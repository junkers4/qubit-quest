"""Level 33, DEUTSCH: constant or balanced, with one query.

Run: python examples/33_deutsch.py
"""
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector


def oracle(f0, f1):
    """U_f |x>|y> = |x>|y XOR f(x)> for f(0)=f0, f(1)=f1."""
    qc = QuantumCircuit(2, name="U_f")
    if f0:
        qc.x(1)       # f(0) = 1 flips y for x = 0 ...
    if f0 != f1:
        qc.cx(0, 1)   # ... and f(0) != f(1) flips it for x = 1
    return qc


def deutsch(f0, f1):
    qc = QuantumCircuit(2)
    qc.x(1)
    qc.h([0, 1])
    qc.compose(oracle(f0, f1), inplace=True)  # ONE query
    qc.h(0)
    p1 = Statevector(qc).probabilities([0])[1]  # P(q0 = 1)
    return round(p1)


for f0 in (0, 1):
    for f1 in (0, 1):
        kind = "constant" if f0 == f1 else "balanced"
        got = deutsch(f0, f1)
        print(f"f(0)={f0} f(1)={f1}: {kind:8s} -> q0 = {got}")
        assert got == (f0 != f1)
