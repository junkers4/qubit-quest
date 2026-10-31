"""Level 32, PHASE KICKBACK: CNOT |+>|-> = |->|->.

Run: python examples/32_kickback.py
"""
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# a CNOT with its target in |-> (an eigenstate of X)
qc = QuantumCircuit(2)
qc.h(0)              # control |+>
qc.x(1)
qc.h(1)              # target |->
before = Statevector(qc)
qc.cx(0, 1)
after = Statevector(qc)

# the target did not change; the control picked up
# the phase -1 on its |1> part: phase kickback
# labels are in Qiskit order: qubit 1 first, then qubit 0
assert before.equiv(Statevector.from_label("-+"))
assert after.equiv(Statevector.from_label("--"))
print("the control turned from |+> into |->")

# the puzzle: one more H turns q0 into |1>
qc.h(0)
assert Statevector(qc).equiv(Statevector.from_label("-1"))
