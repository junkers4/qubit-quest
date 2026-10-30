"""Level 56, NOISE: decoherence shrinks the Bloch arrow.

Run: python examples/56_noise.py
"""
import numpy as np
from qiskit.quantum_info import (DensityMatrix, Kraus,
                                 SparsePauliOp)

p = 0.1   # a dephasing channel: Z happens with chance p
dephase = Kraus([np.sqrt(1 - p) * np.eye(2),
                 np.sqrt(p) * np.diag([1, -1])])

rho = DensityMatrix.from_label("+")
for step in range(6):
    x = rho.expectation_value(SparsePauliOp("X")).real
    purity = rho.purity().real
    print(f"step {step}: <X> = {x:.3f} purity {purity:.3f}")
    rho = rho.evolve(dephase)
# each step multiplies <X> by (1 - 2p)
assert np.isclose(x, (1 - 2 * p) ** 5)

# fully dephased |+> is the fully mixed state I/2
full = Kraus([np.sqrt(0.5) * np.eye(2),
              np.sqrt(0.5) * np.diag([1, -1])])
mixed = DensityMatrix.from_label("+").evolve(full)
assert np.allclose(mixed.data, np.eye(2) / 2)

print("100 gates at 99% each:", round(0.99**100, 3))
