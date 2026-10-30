"""Level 37, GROVER SEARCH: 1 marked item among 8.

Run: python examples/37_grover.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

n = 3
marked = "101"   # in Qiskit order (qubit 2 first)


def oracle():
    qc = QuantumCircuit(n)
    zeros = [q for q in range(n) if marked[::-1][q] == "0"]
    qc.x(zeros)
    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)   # a multi-controlled Z
    qc.h(n - 1)
    qc.x(zeros)
    return qc


def diffuser():
    qc = QuantumCircuit(n)
    qc.h(range(n))
    qc.x(range(n))
    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)
    qc.x(range(n))
    qc.h(range(n))
    return qc


rounds = int(np.floor(np.pi / 4 * np.sqrt(2**n)))
qc = QuantumCircuit(n)
qc.h(range(n))
for r in range(rounds):
    qc.compose(oracle(), inplace=True)
    qc.compose(diffuser(), inplace=True)
    p = Statevector(qc).probabilities_dict()[marked]
    print(f"after round {r + 1}: P({marked}) = {p:.3f}")
assert rounds == 2
assert p > 0.94
