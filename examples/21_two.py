"""Level 21, TWO QUBITS: four amplitudes, and Qiskit's order.

Qiskit writes qubit 0 as the RIGHTMOST digit. This game, and
np.kron, write it on the LEFT.
Run: python examples/21_two.py
"""
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(2)
qc.x(0)
qc.x(1)
print("X on both:", Statevector(qc).probabilities_dict())
assert Statevector(qc).probabilities_dict() == {"11": 1.0}

# only qubit 0 flipped: Qiskit shows '01', the game |10>
one = QuantumCircuit(2)
one.x(0)
print("X on qubit 0, Qiskit order:",
      Statevector(one).probabilities_dict())
flipped = Statevector(one).reverse_qargs()
print("same state in the game's order:",
      flipped.probabilities_dict())
assert "10" in flipped.probabilities_dict()

# a coin on each wire: all four results equally likely
coins = QuantumCircuit(2)
coins.h([0, 1])
probs = Statevector(coins).probabilities_dict()
print(probs)
assert all(abs(p - 0.25) < 1e-9 for p in probs.values())
