"""Level 15, THE X GATE: the quantum NOT.

Run: python examples/15_xgate.py
"""
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector

qc = QuantumCircuit(1)
qc.x(0)
print(qc.draw())
state = Statevector(qc)
print("X|0> =", state)
assert state.equiv(Statevector.from_label("1"))

print("X =\n", Operator(qc).data.real)

# X swaps the amplitudes of any state
psi = Statevector([0.6, 0.8])
print("X(0.6|0>+0.8|1>) =", psi.evolve(qc))
assert psi.evolve(qc).equiv(Statevector([0.8, 0.6]))

# X twice is the identity
twice = QuantumCircuit(1)
twice.x(0)
twice.x(0)
assert Operator(twice).equiv(Operator(QuantumCircuit(1)))
