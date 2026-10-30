"""Level 34, DEUTSCH-JOZSA: n-bit constant or balanced.

Run: python examples/34_dj.py
"""
from itertools import combinations, product

from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

n = 3


def oracle(table):
    """U_f for any f given as a truth table of 2**n bits."""
    qc = QuantumCircuit(n + 1)
    for x, fx in enumerate(table):
        if not fx:
            continue
        bits = [(x >> q) & 1 for q in range(n)]
        zeros = [q for q in range(n) if not bits[q]]
        if zeros:
            qc.x(zeros)
        qc.mcx(list(range(n)), n)   # flip y when the input is x
        if zeros:
            qc.x(zeros)
    return qc


def dj(table):
    qc = QuantumCircuit(n + 1)
    qc.x(n)
    qc.h(range(n + 1))
    qc.compose(oracle(table), inplace=True)
    qc.h(range(n))
    p = Statevector(qc).probabilities(list(range(n)))
    return "constant" if p[0] > 0.999 else "balanced"


tests = [[0] * 8, [1] * 8]                      # constant
for ones in list(combinations(range(8), 4))[:6]:  # balanced
    tests.append([int(x in ones) for x in range(8)])
for table in tests:
    want = "constant" if len(set(table)) == 1 else "balanced"
    got = dj(table)
    print(table, "->", got)
    assert got == want
