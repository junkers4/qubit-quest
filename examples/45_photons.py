"""Level 45, OPTICS AND PHOTONS: Mach-Zehnder and HOM.

Path qubit: |0> = upper path, |1> = lower path.
A 50/50 beam splitter is B = [[1, i], [i, 1]] / sqrt 2.
Run: python examples/45_photons.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

B = np.array([[1, 1j], [1j, 1]]) / np.sqrt(2)


def phase(phi):  # a phase shifter in the lower arm
    return np.diag([1, np.exp(1j * phi)])


# equal arms: the photon always leaves by the other port
assert np.allclose(B @ B, 1j * np.array([[0, 1], [1, 0]]))

for phi in np.linspace(0, np.pi, 5):
    out = B @ phase(phi) @ B @ np.array([1, 0])
    p_d0, p_d1 = abs(out) ** 2
    print(f"phase {phi:4.2f}: D0 {p_d0:.3f}  D1 {p_d1:.3f}")
    assert np.isclose(p_d1, np.cos(phi / 2) ** 2)

# the game's beam splitter box: H S-dagger H is B (up to
# a global phase)
qc = QuantumCircuit(1)
qc.h(0)
qc.sdg(0)
qc.h(0)
assert Operator(qc).equiv(Operator(B))

# Hong-Ou-Mandel: one photon in each input port. The
# chance of one photon in each output is |perm(B)|^2.
perm = B[0, 0] * B[1, 1] + B[0, 1] * B[1, 0]
print("P(one photon at each detector) =", abs(perm) ** 2)
assert np.isclose(abs(perm), 0)  # they always leave together
