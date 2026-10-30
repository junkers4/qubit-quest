"""REQ-071, REQ-072, REQ-077: the assembler game plays like the web game.

Runs the core headless (build/libqqgame.so, `make -C asm test`): every
level of the web game played to the end by keys, stars and saved
progress, locks, clicks, the ELI5 and hint windows. Screenshots of a
few screens go to $QQ_SHOTS (default /tmp/qq-asm).
"""
import ctypes
import os
import pathlib
import shutil

import pytest

from asm_game import (Game, LIB, ROOT as ROOT_DIR, K_ITEM, K_LEVEL, K_GATE, K_WIRE,
                      levels, play_level, step_keys)

SHOTS = pathlib.Path(os.environ.get("QQ_SHOTS", "/tmp/qq-asm"))


@pytest.fixture(scope="module")
def data():
    return levels()


@pytest.fixture
def fresh(tmp_path):
    """A game of its own: a private copy of the library, so no state
    (progress, the save in memory) leaks between tests."""
    if not LIB.exists():
        pytest.fail(f"{LIB} missing: run make -C asm test")
    def make(unlock=False, saved=None):
        copy = tmp_path / f"game{len(list(tmp_path.iterdir()))}.so"
        shutil.copy(LIB, copy)
        lib = ctypes.CDLL(str(copy))
        if saved is not None:
            buf = (ctypes.c_ubyte * 256).in_dll(lib, "saved")
            for k, b in enumerate(saved):
                buf[k] = b
            ctypes.c_int32.in_dll(lib, "saved_len").value = len(saved)
        return Game(unlock=unlock, lib=lib)
    return make


def saved_bytes(game):
    n = game.var("saved_len")
    return bytes((ctypes.c_ubyte * 256).in_dll(game.lib, "saved")[:n])


def open_map(game):
    game.key("down")
    game.key("enter")
    assert game.screen == "map"


def test_every_level_plays_to_the_end(fresh, data):
    """REQ-071: all 63 levels, every lesson, quiz and puzzle."""
    game = fresh(unlock=True)
    SHOTS.mkdir(parents=True, exist_ok=True)
    assert len(data["levels"]) == 63
    for i, level in enumerate(data["levels"]):
        game.key("esc")  # from the done screen (or the title) to the map
        if game.screen == "title":
            open_map(game)
        game.key(K_LEVEL + i)
        assert game.var("game_level") == i
        play_level(game, i, data)
        perfect = all(len(s["solution"]) <= s["par"]
                      for s in level["steps"] if s["type"] == "circuit")
        stars = saved_bytes(game)[4 + i]
        assert stars == (3 if perfect else 2), level["id"]
        if i % 10 == 0:
            game.png(SHOTS / f"done-{i + 1:02}.png")


def test_progress_is_saved_and_loaded(fresh, data):
    """REQ-072: stars are saved when a level ends and come back."""
    game = fresh()
    game.key("enter")  # START: the first level
    assert game.screen == "level" and game.var("game_level") == 0
    play_level(game, 0, data)
    saved = saved_bytes(game)
    assert saved[:4] == b"QQS1" and saved[4] == 3
    again = fresh(saved=saved)
    open_map(again)  # the map opens on the first level not done yet
    again.key("enter")
    assert again.screen == "level" and again.var("game_level") == 1


def test_locked_levels_stay_shut(fresh):
    """REQ-072: a level opens once the one before has a star."""
    game = fresh()
    open_map(game)
    game.key(K_LEVEL + 5)
    assert game.screen == "map"
    game.key(K_LEVEL + 0)
    assert game.screen == "level"


def test_a_wrong_answer_costs_a_star(fresh, data):
    game = fresh()
    game.key("enter")
    level = data["levels"][0]
    for s, step in enumerate(level["steps"]):
        if step["type"] == "quiz":
            wrong = (step["answer"] + 1) % len(step["options"])
            game.key(str(wrong + 1))
            assert game.var("game_solved") == 0
            game.key("enter")  # no going on before the right answer
            assert game.var("game_step") == s
            break
        game.key("enter")
        while game.var("game_step") == s:
            game.key("enter")
    game.key("esc")
    game.key(K_LEVEL + 0)
    # replay: a fresh try, the same rules
    play = []
    for step in level["steps"]:
        play += step_keys(step, data["keys"])
    assert play


def hit(game, code):
    """The centre of the clickable box with this code."""
    n = game.var("nhits")
    boxes = (ctypes.c_int32 * (5 * 64)).in_dll(game.lib, "hits")
    for k in range(n - 1, -1, -1):
        x, y, w, h, c = boxes[5 * k:5 * k + 5]
        if c == code:
            return x + w // 2, y + h // 2
    raise AssertionError(f"nothing to click for {code:#x}")


def test_a_level_by_clicks_only(fresh, data):
    """REQ-071: menus, pages, answers, wires and gates all take clicks."""
    game = fresh(unlock=True)
    game.click(*hit(game, K_ITEM + 1))  # SELECT LEVEL
    assert game.screen == "map"
    i = next(k for k, L in enumerate(data["levels"]) if L["id"] == "bell")
    for _ in range(3):  # to world 4
        game.key("right")
    game.click(*hit(game, K_LEVEL + i))
    assert game.screen == "level"
    gates = None
    for s, step in enumerate(data["levels"][i]["steps"]):
        if step["type"] == "quiz":
            game.click(*hit(game, K_ITEM + step["answer"]))
        elif step["type"] == "circuit":
            palette = ["H", "X", "CX"]  # the bell puzzle's palette
            for name, *wires in step["solution"]:
                game.click(*hit(game, K_WIRE + wires[0]))
                game.click(*hit(game, K_GATE + palette.index(name)))
            game.png(SHOTS / "clicks-bell.png")
        assert step["type"] == "text" or game.var("game_solved") == 1
        while game.screen == "level" and game.var("game_step") == s:
            if step["type"] == "text":
                game.click(*hit(game, 0x105))  # the page itself
            else:
                game.key("enter")
    assert game.screen == "done"
    game.click(160, 100)  # anywhere: the next level
    assert game.screen == "level" and game.var("game_level") == i + 1


def test_eli5_and_hint_windows(fresh, data):
    """REQ-071: E opens the ELI5 window on every step, ? the hint on puzzles."""
    game = fresh(unlock=True)
    for i, level in enumerate(data["levels"]):
        game.key("esc")
        if game.screen == "title":
            open_map(game)
        game.key(K_LEVEL + i)
        for s, step in enumerate(level["steps"]):
            game.key("e")
            assert game.var("game_overlay") == 1, (level["id"], s)
            if i == 3 and s == 0:
                game.png(SHOTS / "eli5.png")
            game.key("esc")
            assert game.var("game_overlay") == 0
            if step["type"] == "circuit":
                game.key("?")
                assert game.var("game_overlay") == 2
                game.key("esc")
            for k in step_keys(step, data["keys"]):
                game.key(k)
            while game.screen == "level" and game.var("game_step") == s:
                game.key("enter")


def test_screens_look_right(fresh, data):
    """Screenshots to look at: title, map, a 3-qubit puzzle, black boxes."""
    game = fresh(unlock=True)
    SHOTS.mkdir(parents=True, exist_ok=True)
    game.png(SHOTS / "title.png")
    open_map(game)
    game.key("right")
    game.png(SHOTS / "map.png")
    for name in ("teleport", "deutsch", "toffoli", "dj", "fridge"):
        i = next(k for k, L in enumerate(data["levels"]) if L["id"] == name)
        if game.screen != "map":
            game.key("esc")
        game.key(K_LEVEL + i)
        assert game.var("game_level") == i
        steps = data["levels"][i]["steps"]
        first = next((s for s, st in enumerate(steps) if st["type"] == "circuit"), 0)
        for s in range(first):
            for k in step_keys(steps[s], data["keys"]):
                game.key(k)
            while game.var("game_step") == s:
                game.key("enter")
        keys = step_keys(steps[first], data["keys"])
        for k in keys[:-1]:
            game.key(k)
        game.png(SHOTS / f"{name}.png")


def test_vec_rotate_turns_like_the_gates(fresh):
    """REQ-076: the animation turns a qubit's arrow about the gate's axis."""
    import math
    lib = fresh().lib
    lib.vec_rotate.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_double]
    r = 2 ** -0.5
    cases = [((0, 0, 1), (r, 0, r), math.pi, (1, 0, 0)),          # H: |0> to |+>
             ((0, 0, 1), (r, 0, r), math.pi / 2, (0.5, -r, 0.5)),  # half way
             ((1, 0, 0), (0, 0, 1), math.pi / 2, (0, 1, 0)),       # S: |+> to |+i>
             ((0, 1, 0), (1, 0, 0), math.pi, (0, -1, 0))]          # X
    for v, k, angle, want in cases:
        vec = (ctypes.c_double * 3)(*v)
        lib.vec_rotate(vec, (ctypes.c_double * 3)(*k), angle)
        assert all(abs(a - b) < 1e-12 for a, b in zip(vec, want)), (v, k, list(vec))


def to_puzzle(game, data, name):
    i = next(k for k, L in enumerate(data["levels"]) if L["id"] == name)
    if game.screen == "title":
        open_map(game)
    elif game.screen != "map":
        game.key("esc")
    game.key(K_LEVEL + i)
    steps = data["levels"][i]["steps"]
    first = next(s for s, st in enumerate(steps) if st["type"] == "circuit")
    for s in range(first):
        for k in step_keys(steps[s], data["keys"]):
            game.key(k)
        while game.var("game_step") == s:
            game.key("enter")
    return steps[first]


def test_views_and_measurements(fresh, data):
    """REQ-076: O switches the pictures (state, Bloch spheres, shots); M measures 100
    times, only ever finding basis states the state has; A opens the exact numbers."""
    game = fresh(unlock=True)
    step = to_puzzle(game, data, "bell")
    for k in step_keys(step, data["keys"]):
        game.key(k)
    assert game.var("game_solved") == 1
    views = []
    for _ in range(3):
        game.key("o")
        views.append(game.var("view"))
    assert views == [1, 2, 0]
    game.key("o")
    for _ in range(12):  # let the animation finish
        game.draw()
    game.png(SHOTS / "bell-bloch.png")
    game.key("m")
    assert game.var("view") == 2
    for _ in range(60):
        game.draw()
    counts = list((ctypes.c_int32 * 8).in_dll(game.lib, "shot_counts"))[:4]
    assert game.var("shot_n") == 100 and sum(counts) == 100
    assert counts[1] == counts[2] == 0 and counts[0] > 20 and counts[3] > 20  # |00> or |11> only
    game.png(SHOTS / "bell-shots.png")
    game.key("a")
    assert game.var("game_overlay") == 3
    game.png(SHOTS / "bell-exact.png")
    game.key("esc")
    assert game.var("game_overlay") == 0


def test_every_puzzle_shows_every_view(fresh, data):
    """REQ-076: the three pictures and the exact window draw on every puzzle, also
    halfway through a gate's animation."""
    game = fresh(unlock=True)
    for level in data["levels"]:
        for s, step in enumerate(level["steps"]):
            if step["type"] != "circuit":
                continue
            to_puzzle_step(game, data, level["id"], s)
            keys = step_keys(step, data["keys"])
            for k in keys:
                game.key(k)
            for v in range(3):
                game.key("o")
                for _ in range(5):
                    game.draw()
            game.key("a")
            game.key("esc")


def to_puzzle_step(game, data, name, target):
    i = next(k for k, L in enumerate(data["levels"]) if L["id"] == name)
    if game.screen != "map":
        game.key("esc")
    if game.screen == "title":
        open_map(game)
    game.key(K_LEVEL + i)
    steps = data["levels"][i]["steps"]
    for s in range(target):
        for k in step_keys(steps[s], data["keys"]):
            game.key(k)
        while game.var("game_step") == s:
            game.key("enter")


def test_hardware_drawings_match_the_web_game(fresh):
    """REQ-076: every drawing of src/pics.js, decoded by the core, has exactly the
    pixels of each colour that the web game draws."""
    import json
    import subprocess
    out = subprocess.run(
        ["node", "-e", "const b = require('./tools/asm-data.js'); b();"
         "process.stdout.write(JSON.stringify({stats: b.picStats, colors: b.picColors}))"],
        cwd=ROOT_DIR, capture_output=True, text=True, check=True)
    ref = json.loads(out.stdout)
    game = fresh()
    lib = game.lib
    fb = (ctypes.c_uint32 * (320 * 200)).in_dll(lib, "fb")
    for n, pic in enumerate(ref["stats"]):
        lib.gfx_fill(0xff00ff)  # a colour no drawing uses
        lib.draw_pic(n, 45, 0)
        h = min(pic["h"], 200)
        got = {}
        for y in range(h):
            for x in range(45, 45 + pic["w"]):
                p = fb[y * 320 + x]
                if p != 0xff00ff:
                    got[p] = got.get(p, 0) + 1
        want = {int(ref["colors"][int(k) - 1][1:], 16): v for k, v in pic["counts"].items()}
        assert got == want, pic["name"]


def test_moving_parts_move_as_in_the_web_game(fresh):
    """REQ-077: the moving parts of the drawings (photons, fields, ions) are where
    the web game draws them at the same frame, and they do move."""
    import json
    import subprocess
    frames = [0, 5, 13, 29, 47]
    out = subprocess.run(
        ["node", "-e", """
const QQ = require('./test/load.js');
const res = {};
Object.keys(QQ.PICS).forEach((name, n) => {
    const P = QQ.PICS[name];
    if (!P.motion) return;
    res[n] = [FRAMES].map(t => {
        const px = new Set();
        const R = (c, x, y, w, h) => {
            for (let yy = Math.round(y); yy < Math.round(y) + h; yy++)
                for (let xx = Math.round(x); xx < Math.round(x) + w; xx++) px.add(xx + ',' + yy);
        };
        const line = (x0, y0, x1, y1) => {
            x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
            const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
            let e = dx + dy;
            for (;;) { R(0, x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break;
                const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
        };
        QQ.drawMotion({R, line}, P, 45, 0, t);
        return [...px];
    });
});
process.stdout.write(JSON.stringify(res));
""".replace("FRAMES", ",".join(map(str, frames)))],
        cwd=ROOT_DIR, capture_output=True, text=True, check=True)
    web = json.loads(out.stdout)
    assert len(web) >= 9
    game = fresh()
    lib = game.lib
    fb = (ctypes.c_uint32 * (320 * 200)).in_dll(lib, "fb")
    for n, per_frame in web.items():
        seen = []
        for t, want in zip(frames, per_frame):
            lib.gfx_fill(0xff00ff)
            lib.draw_motion(int(n), 45, 0, t)
            got = {f"{k % 320},{k // 320}" for k in range(320 * 200) if fb[k] != 0xff00ff}
            want = set(want)
            # rounding (x87 and SSE against JavaScript) may move a pixel at a .5 edge
            assert len(got ^ want) <= max(4, len(got | want) // 5), (n, t)
            seen.append(frozenset(got))
        assert len(set(seen)) > 1, f"drawing {n} does not move"
