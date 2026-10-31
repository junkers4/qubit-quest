"""Runs every example and records what it prints in examples/output/NN_name.txt, for the
game's RUN button (the game cannot run Python itself, least of all offline on a phone).
tests/test_examples.py checks each recording is exactly what the code prints now.
Run: python tools/record-outputs.py (the requirements.txt environment), or make outputs.
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "examples" / "output"


def run(path):
    done = subprocess.run([sys.executable, "-I", str(path)], cwd=ROOT,
                          capture_output=True, text=True, timeout=300)
    if done.returncode:
        raise SystemExit(f"{path.name} failed:\n{done.stdout}{done.stderr}")
    return done.stdout


def main():
    OUT.mkdir(exist_ok=True)
    for path in sorted((ROOT / "examples").glob("[0-9][0-9]_*.py")):
        (OUT / (path.stem + ".txt")).write_text(run(path))
        print("recorded", path.name)


if __name__ == "__main__":
    main()
