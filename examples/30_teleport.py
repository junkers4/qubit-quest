"""Level 30, TELEPORTATION: with deferred measurement.

"Measure, then X / Z if the bit is 1" is written as CNOT /
CZ from the measured qubit, then measuring at the end.
Run: python examples/30_teleport.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace

rng = np.random.default_rng(42)
for trial in range(5):
    theta = rng.uniform(0, np.pi)
    phi = rng.uniform(0, 2 * np.pi)
    psi = QuantumCircuit(1)
    psi.ry(theta, 0)
    psi.rz(phi, 0)

    qc = QuantumCircuit(3)
    qc.compose(psi, [0], inplace=True)  # |psi> on q0
    qc.h(1)                             # Bell pair q1, q2
    qc.cx(1, 2)
    qc.cx(0, 1)                         # Alice
    qc.h(0)
    qc.cx(1, 2)                         # Bob's X fix
    qc.cz(0, 2)                         # Bob's Z fix

    bob = partial_trace(Statevector(qc), [0, 1])  # keep q2
    want = Statevector(psi)
    fidelity = np.real(want.data.conj() @ bob.data @ want.data)
    print(f"trial {trial}: fidelity {fidelity:.6f}")
    assert np.isclose(fidelity, 1)

# before the fixes Bob's qubit alone is completely random
qc = QuantumCircuit(3)
qc.ry(1.0, 0)
qc.h(1)
qc.cx(1, 2)
qc.cx(0, 1)
qc.h(0)
bob = partial_trace(Statevector(qc), [0, 1])
print("Bob before the fixes:\n", np.round(bob.data.real, 3))
assert np.allclose(bob.data, np.eye(2) / 2)
