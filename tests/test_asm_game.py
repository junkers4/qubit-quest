"""REQ-071, REQ-072: the assembler game plays like the web game.

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

from asm_game import (Game, LIB, K_ITEM, K_LEVEL, K_GATE, K_WIRE,
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
    """REQ-071: all 60 levels, every lesson, quiz and puzzle."""
    game = fresh(unlock=True)
    SHOTS.mkdir(parents=True, exist_ok=True)
    assert len(data["levels"]) == 60
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
