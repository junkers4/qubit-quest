"""Level 19, THE BLOCH SPHERE: (<X>, <Y>, <Z>) of a qubit.

Run: python examples/19_bloch.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp, Statevector


def bloch(state):
    return np.array([
        state.expectation_value(SparsePauliOp(p)).real
        for p in ("X", "Y", "Z")])


cases = {"|0>": [], "|1>": ["x"], "|+>": ["h"],
         "|->": ["h", "z"], "|+i>": ["h", "s"]}
for name, gates in cases.items():
    qc = QuantumCircuit(1)
    for g in gates:
        getattr(qc, g)(0)
    v = bloch(Statevector(qc))
    print(f"{name:5s} Bloch vector {np.round(v, 3)}")

# the puzzle: H then Z points the arrow left, to (-1, 0, 0)
qc = QuantumCircuit(1)
qc.h(0)
qc.z(0)
assert np.allclose(bloch(Statevector(qc)), [-1, 0, 0])

# cos(t/2)|0> + e^(ip) sin(t/2)|1> sits at angles (t, p)
t, p = 1.0, 0.5
psi = Statevector([np.cos(t / 2),
                   np.exp(1j * p) * np.sin(t / 2)])
expect = [np.sin(t) * np.cos(p), np.sin(t) * np.sin(p),
          np.cos(t)]
assert np.allclose(bloch(psi), expect)
