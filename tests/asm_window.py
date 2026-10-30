"""REQ-073: the real programs, in real windows.

Plays the first level in build/qubit-quest (Linux, X11) and in
build/qubit-quest.exe (Windows, run by wine) with X events sent by
xdotool, as a player would: keys for the whole level, then a click on
QUIT. Checks the progress file each one saves and that each quits.
Needs an X display (make -C asm test-window runs it under xvfb-run),
xdotool, ImageMagick's import, and wine for the .exe. Screenshots go to
$QQ_SHOTS (default /tmp/qq-asm).
"""
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile
import time

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from asm_game import Game, ROOT, levels, play_level  # noqa: E402

SHOTS = pathlib.Path(os.environ.get("QQ_SHOTS", "/tmp/qq-asm"))
XKEY = {"enter": "Return", "esc": "Escape", "back": "BackSpace",
        "?": "question", "left": "Left", "right": "Right", "up": "Up",
        "down": "Down"}
WINE = shutil.which("wine64") or shutil.which("wine") or "/usr/lib/wine/wine64"


def xdo(*args):
    return subprocess.run(["xdotool", *args], capture_output=True,
                          text=True).stdout.strip()


def find_window(timeout):
    end = time.time() + timeout
    while time.time() < end:
        found = xdo("search", "--name", "^Qubit Quest$")
        if found:
            return found.split()[0]
        time.sleep(0.3)
    raise AssertionError("no Qubit Quest window")


def play(name, cmd, keys, save_file, save_env, env, wait):
    save_file.unlink(missing_ok=True)
    proc = subprocess.Popen(cmd, env={**os.environ, **env, "QQ_SAVE": save_env},
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        win = find_window(wait)
        time.sleep(1)
        xdo("windowfocus", "--sync", win)
        xdo("key", "--window", win, "--delay", "40", "Return",
            *[XKEY.get(k, k) for k in keys])
        time.sleep(1.5)
        subprocess.run(["import", "-window", "root",
                        str(SHOTS / f"window-{name}.png")], check=True)
        data = save_file.read_bytes() if save_file.exists() else b""
        assert data[:4] == b"QQS1" and data[4] == 3, f"{name}: saved {data[:8]!r}"
        # back to the title and a click on QUIT (window at scale 3)
        xdo("key", "--window", win, "--delay", "100", "Escape", "Escape")
        time.sleep(0.5)
        xdo("mousemove", "--window", win, "480", "438", "click", "1")
        proc.wait(timeout=10)
        print(f"{name}: played level 1, saved 3 stars, quit by the QUIT button")
    finally:
        if proc.poll() is None:
            proc.kill()
            raise AssertionError(f"{name}: still running after QUIT")


def start():
    game = Game()
    game.key("enter")  # START
    return game


def main():
    SHOTS.mkdir(parents=True, exist_ok=True)
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="qq-window-"))
    save = tmp / "progress.dat"
    # the first level's keys, worked out on the headless core
    keys = play_level(start(), 0, levels())
    play("linux", [str(ROOT / "build" / "qubit-quest")], keys, save, str(save), {}, 10)
    prefix = os.environ.get("WINEPREFIX", str(ROOT / "build" / "wineprefix"))
    env = {"WINEPREFIX": prefix, "WINEDEBUG": "-all",
           "WINEDLLOVERRIDES": "mscoree,mshtml="}
    subprocess.run([WINE, "wineboot", "-i"], env={**os.environ, **env},
                   capture_output=True, timeout=300)
    play("windows", [WINE, str(ROOT / "build" / "qubit-quest.exe")], keys, save,
         "Z:" + str(save).replace("/", "\\"), env, 60)
    subprocess.run([WINE.replace("wine64", "wineserver"), "-k"],
                   env={**os.environ, **env}, capture_output=True)


if __name__ == "__main__":
    main()
