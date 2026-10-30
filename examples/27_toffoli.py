"""Level 27, TOFFOLI AND UNIVERSALITY: reversible AND, OR.

Run: python examples/27_toffoli.py
"""
from itertools import product

from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector


def run(a, b, gate):
    qc = QuantumCircuit(3)
    if a:
        qc.x(0)
    if b:
        qc.x(1)
    gate(qc)
    out = Statevector(qc).reverse_qargs()  # game order
    (key,) = out.probabilities_dict(decimals=9)
    return key


def AND(qc):
    qc.ccx(0, 1, 2)


def OR(qc):  # A OR B = NOT(NOT A AND NOT B)
    qc.x([0, 1])
    qc.ccx(0, 1, 2)
    qc.x(2)
    qc.x([0, 1])


for a, b in product((0, 1), repeat=2):
    k_and, k_or = run(a, b, AND), run(a, b, OR)
    print(a, b, "AND ->", k_and, " OR ->", k_or)
    assert k_and == f"{a}{b}{a & b}"
    assert k_or == f"{a}{b}{a | b}"
