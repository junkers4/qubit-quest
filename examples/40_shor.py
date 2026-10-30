"""Level 40, SHOR FACTORING: factor 15 with a = 7.

The quantum part is phase estimation of "multiply by 7
mod 15"; continued fractions turn the phase into r.
Run: python examples/40_shor.py  (takes a few seconds)
"""
from fractions import Fraction
from math import gcd

import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate, UnitaryGate
from qiskit.quantum_info import Statevector

N, a = 15, 7
t, m = 8, 4          # 8 counting qubits, 4 work qubits


def mult_gate(factor):
    """|y> -> |factor*y mod N> for y < N, as a 16x16
    permutation matrix (y = 15 is left alone)."""
    U = np.zeros((16, 16))
    for y in range(16):
        U[factor * y % N if y < N else y, y] = 1
    return UnitaryGate(U, label=f"x{factor}")


qc = QuantumCircuit(t + m)
qc.h(range(t))
qc.x(t)              # work register starts at y = 1
for k in range(t):   # counting qubit k controls U^(2^k)
    power = pow(a, 2**k, N)
    qc.append(mult_gate(power).control(1),
              [k] + list(range(t, t + m)))
qc.append(QFTGate(t).inverse(), range(t))

probs = Statevector(qc).probabilities_dict(list(range(t)))
peaks = sorted(k for k, p in probs.items() if p > 0.01)
print("peaks:", [int(k, 2) for k in peaks])

found = set()
for key in peaks:
    phase = Fraction(int(key, 2), 2**t)
    r = phase.limit_denominator(N).denominator
    if pow(a, r, N) == 1:
        found.add(r)
r = min(found)
print("period r =", r)
assert r == 4
x = pow(a, r // 2, N)
factors = sorted({gcd(x - 1, N), gcd(x + 1, N)})
print("factors of 15:", factors)
assert factors == [3, 5]
