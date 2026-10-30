"""Level 39, PHASE ESTIMATION: read the phase of T.

T|1> = e^(2 pi i / 8)|1>, so phi = 1/8 = 0.001 in binary.
Run: python examples/39_qpe.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Statevector

t = 3                       # counting qubits 0 .. t-1
qc = QuantumCircuit(t + 1)
qc.x(t)                     # the eigenvector |1>
qc.h(range(t))
for k in range(t):          # qubit k controls U^(2^k)
    qc.cp(2 * np.pi / 8 * 2**k, k, t)
qc.append(QFTGate(t).inverse(), range(t))

probs = Statevector(qc).probabilities_dict(list(range(t)))
best = max(probs, key=probs.get)
phi = int(best, 2) / 2**t   # the key is read as a binary number
print("counting register:", best, " phi =", phi)
assert np.isclose(probs[best], 1)
assert phi == 1 / 8

# the game's puzzle: U = S (phi = 1/4) with 2 counting qubits
qc = QuantumCircuit(3)
qc.x(2)
qc.h([0, 1])
for k in range(2):
    qc.cp(np.pi / 2 * 2**k, k, 2)
qc.append(QFTGate(2).inverse(), [0, 1])
probs = Statevector(qc).probabilities_dict([0, 1])
print("S: counting register", max(probs, key=probs.get))
assert np.isclose(probs["01"], 1)   # 0.01 binary = 1/4
