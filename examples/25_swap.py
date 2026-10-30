"""Level 25, SWAP: three alternating CNOTs swap two qubits.

Run: python examples/25_swap.py
"""
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector

three = QuantumCircuit(2)
three.cx(0, 1)
three.cx(1, 0)
three.cx(0, 1)
print(three.draw())

swap = QuantumCircuit(2)
swap.swap(0, 1)
assert Operator(three).equiv(Operator(swap))
print("CX CX CX = SWAP")

# the puzzle's start: H T on q0, X on q1
prep = QuantumCircuit(2)
prep.h(0)
prep.t(0)
prep.x(1)
before = Statevector(prep)
after = before.evolve(three)
# swapping = reading the qubits in the other order
assert after.equiv(before.reverse_qargs())
