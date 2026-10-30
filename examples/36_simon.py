"""Level 36, SIMON: find a hidden XOR period s.

Run: python examples/36_simon.py
"""
from itertools import product

from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

n = 3
secret = "110"   # s as bits for qubits 0, 1, 2
s = [int(b) for b in secret]


def oracle():
    """|x>|0> -> |x>|f(x)> with f(x) = f(x XOR s):
    copy x, then XOR s into the output when x_k = 1 for the
    first k with s_k = 1."""
    qc = QuantumCircuit(2 * n)
    for q in range(n):
        qc.cx(q, n + q)
    k = s.index(1)
    for q in range(n):
        if s[q]:
            qc.cx(k, n + q)
    return qc


qc = QuantumCircuit(2 * n, n)
qc.h(range(n))
qc.compose(oracle(), inplace=True)
qc.h(range(n))
qc.measure(range(n), range(n))
res = StatevectorSampler(seed=3).run([qc], shots=64).result()
# reversed: qubit 0 first
ys = [k[::-1] for k in res[0].data.c.get_counts()]
print("measured y:", sorted(ys))


def dot(a, b):
    return sum(int(x) * int(y) for x, y in zip(a, b)) % 2


# every y satisfies y.s = 0 (mod 2)
assert all(dot(y, secret) == 0 for y in ys)
# the only nonzero s consistent with all of them is the secret
cands = []
for c in product("01", repeat=n):
    c = "".join(c)
    if "1" in c and all(dot(y, c) == 0 for y in ys):
        cands.append(c)
print("candidates for s:", cands)
assert cands == [secret]
