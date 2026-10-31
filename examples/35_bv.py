"""Level 35, BERNSTEIN-VAZIRANI: read a secret in one query.

Run: python examples/35_bv.py
"""
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

secret = "1011"          # s, written as qubits 0, 1, 2, 3
n = len(secret)

# Bernstein-Vazirani: the output qubit in |->, H on
# the inputs, the oracle, H again: one query reveals
# the whole secret string
qc = QuantumCircuit(n + 1)
qc.x(n)
qc.h(range(n + 1))
for q, bit in enumerate(secret):    # f(x) = s.x mod 2
    if bit == "1":
        qc.cx(q, n)
qc.h(range(n))

# the inputs end in exactly one basis state: the secret
probs = Statevector(qc).probabilities_dict(list(range(n)))
(key,) = [k for k, p in probs.items() if p > 0.999]
found = key[::-1]  # Qiskit writes qubit 0 last
print("secret", secret, "found", found)
assert found == secret
