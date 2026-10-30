"""Level 16, SUPERPOSITION: H|0> = |+>, H|1> = |->.

Run: python examples/16_hadamard.py
"""
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector

plus = QuantumCircuit(1)
plus.h(0)
print("H|0> =", Statevector(plus))
assert Statevector(plus).equiv(Statevector.from_label("+"))

minus = QuantumCircuit(1)
minus.x(0)
minus.h(0)
print("H|1> =", Statevector(minus))
assert Statevector(minus).equiv(Statevector.from_label("-"))

print("H =\n", Operator(plus).data.real.round(3))
# both are 50/50 coins
for qc in (plus, minus):
    print(Statevector(qc).probabilities_dict())
