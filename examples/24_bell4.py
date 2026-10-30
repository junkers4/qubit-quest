"""Level 24, ALL FOUR BELLS: four orthogonal entangled states.

Run: python examples/24_bell4.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector


def bell(z, x):
    """Phi+ , then Z (sign) and X (flip) on qubit 0 / 1."""
    qc = QuantumCircuit(2)
    qc.h(0)
    if z:
        qc.z(0)
    if x:
        qc.x(1)
    qc.cx(0, 1)
    # game order: q0 is the left digit
    return Statevector(qc).reverse_qargs()


s = 1 / np.sqrt(2)
names = {"Phi+": (0, 0), "Phi-": (1, 0),
         "Psi+": (0, 1), "Psi-": (1, 1)}
want = {"Phi+": [s, 0, 0, s], "Phi-": [s, 0, 0, -s],
        "Psi+": [0, s, s, 0], "Psi-": [0, s, -s, 0]}
states = {}
for name, (z, x) in names.items():
    states[name] = bell(z, x)
    print(name, np.round(states[name].data.real, 3))
    assert states[name].equiv(Statevector(want[name]))

# all four are orthogonal: one measurement tells them apart
for a in states:
    for b in states:
        overlap = abs(states[a].inner(states[b]))
        assert np.isclose(overlap, 1.0 if a == b else 0.0)
print("all four are orthogonal")
