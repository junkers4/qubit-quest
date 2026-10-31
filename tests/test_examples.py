"""REQ-030, REQ-031, REQ-033: every CODE example runs as it is, checks its own
result, and prints exactly the output the game shows for it (RUN)."""
import pathlib
import re
import subprocess
import sys

import pytest

ROOT = pathlib.Path(__file__).resolve().parent.parent
EXAMPLES = sorted((ROOT / "examples").glob("[0-9][0-9]_*.py"))


def test_there_are_examples():
    assert len(EXAMPLES) >= 45


@pytest.mark.parametrize("path", EXAMPLES, ids=lambda p: p.name)
def test_example_runs(path):
    # -I: isolated, so nothing in examples/ can shadow a module
    done = subprocess.run([sys.executable, "-I", str(path)],
                          cwd=ROOT, capture_output=True, text=True,
                          timeout=300)
    assert done.returncode == 0, done.stdout + done.stderr
    # REQ-033: the game's RUN button shows exactly what it prints
    rec = ROOT / "examples" / "output" / (path.stem + ".txt")
    assert rec.exists(), "no recorded output: python tools/record-outputs.py"
    assert same_output(rec.read_text(), done.stdout), \
        "recorded output is stale: python tools/record-outputs.py"


NUMBER = re.compile(r"[-+]?\d+\.\d*(?:e[-+]?\d+)?|[-+]?\d+e[-+]?\d+")


def same_output(a, b):
    """The same text, numbers equal to 1e-9: another CPU or BLAS can
    change the last digit of a float (-2e-17 for 0.0, -0.0 for 0.0)."""
    if NUMBER.sub("#", a) != NUMBER.sub("#", b):
        return False
    return all(abs(float(x) - float(y)) <= 1e-9 * max(1, abs(float(x)))
               for x, y in zip(NUMBER.findall(a), NUMBER.findall(b)))


@pytest.mark.parametrize("path", EXAMPLES, ids=lambda p: p.name)
def test_example_is_readable_in_the_game(path):
    lines = path.read_text().splitlines()
    assert lines[0].startswith('"""Level ')
    assert all(len(line) <= 64 for line in lines), "lines <= 64"
    assert all(line.isascii() for line in lines)
    # REQ-033: the code explains itself
    comments = [l for l in lines if l.lstrip().startswith("#") or "  # " in l]
    assert len(comments) >= 3, "explain the code with comments"
