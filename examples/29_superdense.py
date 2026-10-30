"""Level 29, SUPERDENSE CODING: two bits in one qubit.

Run: python examples/29_superdense.py
"""
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector


def send(bits):
    qc = QuantumCircuit(2)
    qc.h(0)          # the shared Bell pair:
    qc.cx(0, 1)      # q0 is Alice's, q1 is Bob's
    first, second = bits
    if second == "1":
        qc.x(0)      # Alice touches only her qubit q0
    if first == "1":
        qc.z(0)
    qc.cx(0, 1)      # Bob decodes
    qc.h(0)
    out = Statevector(qc).reverse_qargs()  # game order q0 q1
    (key,) = out.probabilities_dict(decimals=9)
    return key


for bits in ("00", "01", "10", "11"):
    got = send(bits)
    print(f"Alice sends {bits}, Bob reads {got}")
    assert got == bits
