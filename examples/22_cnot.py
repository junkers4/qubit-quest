"""Level 22, CNOT: flip the target when the control is 1.

Run: python examples/22_cnot.py
"""
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector

print("control q0, target q1 (written q0 q1, game order)")
for c in (0, 1):
    for t in (0, 1):
        qc = QuantumCircuit(2)
        if c:
            qc.x(0)
        if t:
            qc.x(1)
        qc.cx(0, 1)
        # reverse_qargs: q0 becomes the left digit again
        out = Statevector(qc).reverse_qargs()
        (key,) = out.probabilities_dict(decimals=9)
        print(f"|{c}{t}> -> |{key}>")
        assert key == f"{c}{t ^ c}"

# the puzzle: one X and one CNOT make |11>
qc = QuantumCircuit(2)
qc.x(0)
qc.cx(0, 1)
assert Statevector(qc).probabilities_dict() == {"11": 1.0}

# as a matrix, in Qiskit's order of basis states
# (|00>, |01>, |10>, |11> with qubit 0 on the right)
cnot = QuantumCircuit(2)
cnot.cx(0, 1)
print(Operator(cnot).data.real)
