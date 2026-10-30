"""Level 44, TRAPPED IONS AND LASERS: Rabi and Ramsey.

A laser pulse of area theta rotates the ion's qubit by
RX(theta): P(1) = sin^2(theta / 2). A pi pulse flips it.
Run: python examples/44_ions.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector


def p1(qc):
    return Statevector(qc).probabilities()[1]


# Rabi oscillation: longer pulses rotate further
for theta in np.linspace(0, 2 * np.pi, 9):
    qc = QuantumCircuit(1)
    qc.rx(theta, 0)
    print(f"pulse area {theta:5.2f}: P(1) = {p1(qc):.3f}")
    assert np.isclose(p1(qc), np.sin(theta / 2) ** 2)

# the puzzle: two pi/2 pulses make a pi pulse (X)
half = QuantumCircuit(1)
half.h(0)
half.s(0)
half.h(0)          # = RX(pi/2) up to a global phase
two = half.compose(half)
x = QuantumCircuit(1)
x.x(0)
assert Operator(two).equiv(Operator(x))

# Ramsey: pi/2 pulse, a phase phi, pi/2 pulse
for phi in (0, np.pi / 2, np.pi):
    qc = QuantumCircuit(1)
    qc.rx(np.pi / 2, 0)
    qc.rz(phi, 0)
    qc.rx(np.pi / 2, 0)
    print(f"Ramsey phase {phi:4.2f}: P(1) = {p1(qc):.3f}")
    assert np.isclose(p1(qc), np.cos(phi / 2) ** 2)
