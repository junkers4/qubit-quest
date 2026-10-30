"""Level 4, REVERSIBLE COMPUTING: Toffoli keeps information.

Run: python examples/04_reversible.py
"""
from itertools import product
from math import log

from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator


def toffoli(a, b, c):
    return a, b, c ^ (a & b)

# reversible: 8 different inputs give 8 different outputs
outs = {toffoli(*bits) for bits in product((0, 1), repeat=3)}
assert len(outs) == 8
# with c = 0 the third bit is a AND b
for a, b in product((0, 1), repeat=2):
    assert toffoli(a, b, 0)[2] == (a & b)
# and running it twice undoes it
for bits in product((0, 1), repeat=3):
    assert toffoli(*toffoli(*bits)) == bits

# AND is not reversible: three inputs give the output 0
print("AND inputs giving 0:",
      [ab for ab in product((0, 1), repeat=2)
       if ab[0] & ab[1] == 0])

# the same gate in Qiskit is a permutation matrix
qc = QuantumCircuit(3)
qc.ccx(0, 1, 2)
U = Operator(qc)
print(U.data.real.astype(int))
assert U.is_unitary()

# Landauer: erasing a bit costs at least kT ln 2
k = 1.380649e-23  # Boltzmann constant, J/K (exact in SI)
print("kT ln 2 at 300 K =", k * 300 * log(2), "joule")
