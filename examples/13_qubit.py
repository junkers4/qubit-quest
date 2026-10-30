"""Level 13, THE QUBIT: a unit vector of two amplitudes.

Run: python examples/13_qubit.py
"""
from qiskit.quantum_info import Statevector

psi = Statevector([0.6, 0.8])
print(psi)
print("valid (length 1):", psi.is_valid())
print("chances:", psi.probabilities())
assert psi.is_valid()

for amps in ([0.5, 0.5], [1, 1], [0.9, 0.9]):
    print(amps, "valid:", Statevector(amps).is_valid())
    assert not Statevector(amps).is_valid()

# complex amplitudes are fine too
s = 2 ** -0.5
assert Statevector([s, 1j * s]).is_valid()
