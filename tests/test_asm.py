"""REQ-070: the assembler core simulates exactly like the game's
reference simulator (and so like Qiskit), and checks puzzle goals
the same way.

Loads build/libqqsim.so (asm/core/sim.asm, `make asm`) with ctypes.
"""
import ctypes
import json
import pathlib

import numpy as np
import pytest

ROOT = pathlib.Path(__file__).resolve().parent.parent
LIB = ROOT / "build" / "libqqsim.so"
CASES = json.loads((ROOT / "tests" / "sim_cases.json").read_text())
GOALS = json.loads((ROOT / "tests" / "asm_cases.json").read_text())

# the G_* numbers of asm/core/sim.inc
GATE = {"X": 1, "Y": 2, "Z": 3, "H": 4, "S": 5, "SDG": 6, "T": 7,
        "TDG": 8, "CX": 9, "CZ": 10, "CS": 11, "CSDG": 12,
        "SWAP": 13, "CCX": 14}
G_BOX = 32


@pytest.fixture(scope="module")
def core():
    if not LIB.exists():
        pytest.fail(f"{LIB} missing: run make asm")
    lib = ctypes.CDLL(str(LIB))
    lib.qs_zero.argtypes = [ctypes.c_void_p, ctypes.c_int]
    lib.qs_run.argtypes = [ctypes.c_void_p, ctypes.c_int,
                           ctypes.c_void_p, ctypes.c_int,
                           ctypes.c_void_p]
    lib.qs_matches.argtypes = [ctypes.c_void_p, ctypes.c_void_p,
                               ctypes.c_int, ctypes.c_int,
                               ctypes.c_int]
    lib.qs_matches.restype = ctypes.c_int
    return lib


def encode(ops, boxes):
    names = sorted(boxes)
    out = bytearray()
    for name, *wires in ops:
        g = G_BOX + names.index(name) if name in boxes else GATE[name]
        out += bytes([g] + wires + [0] * (3 - len(wires)))
    return bytes(out)


def run(core, n, ops, boxes=None):
    boxes = boxes or {}
    state = (ctypes.c_double * (2 << n))()
    core.qs_zero(state, n)
    keep = []  # the box ops must stay alive while qs_run reads them
    table = (ctypes.c_uint64 * (2 * max(1, len(boxes))))()
    for k, name in enumerate(sorted(boxes)):
        data = ctypes.create_string_buffer(encode(boxes[name], {}))
        keep.append(data)
        table[2 * k] = ctypes.addressof(data)
        table[2 * k + 1] = len(boxes[name])
    prog = ctypes.create_string_buffer(encode(ops, boxes))
    core.qs_run(state, n, prog, len(ops), table if boxes else None)
    return state


def amplitudes(state):
    return np.array(state[0::2]) + 1j * np.array(state[1::2])


def as_state(n, amps):
    state = (ctypes.c_double * (2 << n))()
    for i, (re, im) in enumerate(amps):
        state[2 * i], state[2 * i + 1] = re, im
    return state


@pytest.mark.parametrize("case", CASES, ids=lambda c: c["name"])
def test_same_amplitudes_as_the_reference(core, case):
    got = amplitudes(run(core, case["n"], case["ops"]))
    want = np.array([re + 1j * im for re, im in case["state"]])
    assert np.allclose(got, want, atol=1e-9)


@pytest.mark.parametrize("case", GOALS, ids=lambda c: c["name"])
def test_goal_check_like_the_game(core, case):
    n = case["n"]
    keep = sum(1 << q for q in case["keep"])
    flags = 1 if case["probsOnly"] else 0
    ops = case["setup"] + case["tries"][0]["ops"] + case["after"]
    got = amplitudes(run(core, n, ops, case["boxes"]))
    want = np.array([re + 1j * im for re, im in case["goal"]])
    assert np.allclose(got, want, atol=1e-9), "boxes run wrong"
    goal = as_state(n, case["goal"])
    for t in case["tries"]:
        state = as_state(n, t["state"])
        verdict = core.qs_matches(state, goal, n, keep, flags)
        assert verdict == int(t["ok"]), t["ops"]


def test_both_verdicts_are_tested():
    oks = [t["ok"] for c in GOALS for t in c["tries"]]
    assert any(oks) and not all(oks)
    assert any(c["keep"] for c in GOALS)
    assert any(c["probsOnly"] for c in GOALS)
    assert any(c["boxes"] for c in GOALS)
