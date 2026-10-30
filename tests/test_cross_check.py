"""REQ-032: the game's simulator gives the same amplitudes as Qiskit.

tests/sim_cases.json holds every puzzle's solution and random
circuits, with the state the game computes (q0 = left digit).
Qiskit numbers the other way, hence reverse_qargs().
"""
import json
import pathlib

import numpy as np
import pytest
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

CASES = json.loads((pathlib.Path(__file__).parent
                    / "sim_cases.json").read_text())

METHOD = {"X": "x", "Y": "y", "Z": "z", "H": "h", "S": "s",
          "SDG": "sdg", "T": "t", "TDG": "tdg", "CX": "cx",
          "CZ": "cz", "CS": "cs", "CSDG": "csdg", "SWAP": "swap",
          "CCX": "ccx"}


@pytest.mark.parametrize("case", CASES, ids=lambda c: c["name"])
def test_same_state_as_qiskit(case):
    qc = QuantumCircuit(case["n"])
    for name, *wires in case["ops"]:
        getattr(qc, METHOD[name])(*wires)
    qiskit = Statevector(qc).reverse_qargs().data
    game = np.array([re + 1j * im for re, im in case["state"]])
    # exact equality, not just up to a global phase
    assert np.allclose(qiskit, game, atol=1e-9)


def test_every_gate_is_covered():
    used = {op[0] for case in CASES for op in case["ops"]}
    assert used == set(METHOD)
