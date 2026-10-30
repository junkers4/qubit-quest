"""Level 18, PHASE: Z S T: HZH = X, SS = Z, TT = S.

Run: python examples/18_phase.py
"""
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector


def op(*gates):
    qc = QuantumCircuit(1)
    for g in gates:
        getattr(qc, g)(0)
    return Operator(qc)


assert op("h", "z", "h").equiv(op("x"))   # puzzle: no X gate
assert op("s", "s").equiv(op("z"))
assert op("t", "t").equiv(op("s"))
print("HZH = X, SS = Z, TT = S: all true")

# Z turns |+> into |->; the chances do not change
plus = Statevector.from_label("+")
after = plus.evolve(op("z"))
print(plus.probabilities(), after.probabilities())
assert after.equiv(Statevector.from_label("-"))

# diagonal gates commute, so S T S-dagger is just T
assert op("s", "t", "sdg").equiv(op("t"))
# Operator.equiv ignores a global phase: Z X Z = -X counts as X
assert op("z", "x", "z").equiv(op("x"))
print("T =\n", op("t").data.round(3))
