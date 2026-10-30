"""Level 12, UNITARY MATRICES: U-dagger U = I.

Run: python examples/12_unitary.py
"""
import numpy as np
from qiskit.circuit.library import HGate, SGate, XGate
from qiskit.quantum_info import Operator


def dagger(U):
    return U.conj().T


def is_unitary(U):
    return np.allclose(dagger(U) @ U, np.eye(len(U)))


H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
S = np.array([[1, 0], [0, 1j]])
print("H unitary:", is_unitary(H), " S unitary:", is_unitary(S))
assert is_unitary(H) and is_unitary(S)
assert not is_unitary(np.diag([1, 2]))  # it stretches

# the inverse of a unitary is its dagger
assert np.allclose(H @ H, np.eye(2))  # H undoes itself
# S-dagger undoes S
assert np.allclose(S @ dagger(S), np.eye(2))

# Hermitian: U equals its dagger. H is, S is not.
assert np.allclose(H, dagger(H))
assert not np.allclose(S, dagger(S))

# Qiskit knows the same matrices
for gate in (XGate(), HGate(), SGate()):
    print(gate.name, Operator(gate).is_unitary())
    assert Operator(gate).is_unitary()
