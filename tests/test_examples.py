"""REQ-030, REQ-031: every CODE example runs as it is and checks its own result."""
import pathlib
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


@pytest.mark.parametrize("path", EXAMPLES, ids=lambda p: p.name)
def test_example_is_readable_in_the_game(path):
    lines = path.read_text().splitlines()
    assert lines[0].startswith('"""Level ')
    assert all(len(line) <= 64 for line in lines), "lines <= 64"
    assert all(line.isascii() for line in lines)
