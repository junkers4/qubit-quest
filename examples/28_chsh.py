"""Level 28, THE BELL TEST: CHSH, classical 2, quantum 2.83.

Run: python examples/28_chsh.py
"""
from itertools import product

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp, Statevector

# classical: try every fixed plan a(x), b(y)
best = 0
for a0, a1, b0, b1 in product((0, 1), repeat=4):
    wins = sum(((a1 if x else a0) ^ (b1 if y else b0))
               == (x & y) for x, y in product((0, 1), repeat=2))
    best = max(best, wins / 4)
print("best classical win rate:", best)
assert best == 0.75

# quantum: a Bell pair; Alice measures Z or X, Bob at 45 deg
bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)
state = Statevector(bell)
r = 1 / np.sqrt(2)
A = [SparsePauliOp("Z"), SparsePauliOp("X")]
B = [SparsePauliOp(["Z", "X"], [r, r]),
     SparsePauliOp(["Z", "X"], [r, -r])]


def corr(a, b):  # Qiskit order: Bob is qubit 1 (left)
    return state.expectation_value(b ^ a).real


S = corr(A[0], B[0]) + corr(A[0], B[1]) \
    + corr(A[1], B[0]) - corr(A[1], B[1])
print("CHSH value S =", round(S, 4), " 2*sqrt(2) =",
      round(2 * np.sqrt(2), 4))
assert np.isclose(S, 2 * np.sqrt(2))
win = np.cos(np.pi / 8) ** 2
print("quantum win rate:", round(win, 4))
assert np.isclose(win, 0.5 + S / 8)
