"""Level 47, SPINS IN SILICON: Zeeman, precession, exchange.

Run: python examples/47_spins.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, SparsePauliOp
from scipy.linalg import expm

h = 6.62607015e-34        # Planck constant, J s (exact)
mu_B = 9.2740100657e-24   # Bohr magneton, J/T (CODATA 2018)
g = 2.0                   # electron g-factor, about 2

for B in (0.1, 0.5, 1.0):
    f = g * mu_B * B / h  # the spin flip frequency
    print(f"B = {B:.1f} T: spin qubit at {f / 1e9:.1f} GHz")
assert abs(g * mu_B * 1.0 / h / 1e9 - 28.0) < 0.1

# exchange: H = J (XX + YY + ZZ) / 4. Left on for J t = pi
# it swaps the two spins; half as long gives sqrt(SWAP).
H = SparsePauliOp(["XX", "YY", "ZZ"], [0.25] * 3).to_matrix()
U = expm(-1j * np.pi * H)
swap = QuantumCircuit(2)
swap.swap(0, 1)
assert Operator(U).equiv(Operator(swap))
root = expm(-1j * np.pi / 2 * H)
assert Operator(root @ root).equiv(Operator(swap))
print("exchange for J t = pi is a SWAP; half of it squared too")
