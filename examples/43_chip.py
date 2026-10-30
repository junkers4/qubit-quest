"""Level 43, THE QUBIT CHIP: from capacitance to frequency.

The pads' capacitance C sets the charging energy
EC = e^2 / (2 C); the junction sets EJ = hbar Ic / (2 e).
Koch et al. (2007): f01 ~ sqrt(8 EJ EC) - EC.
Run: python examples/43_chip.py
"""
import numpy as np

e = 1.602176634e-19      # elementary charge, C (exact)
h = 6.62607015e-34       # Planck constant, J s (exact)
hbar = h / (2 * np.pi)

C = 80e-15               # 80 fF of pads (an example value)
EC = e**2 / (2 * C) / h  # in Hz
EJ = 50 * EC             # a typical transmon ratio
Ic = 2 * e * EJ * h / hbar   # the junction's critical current
print(f"EC/h = {EC / 1e9:.3f} GHz  EJ/h = {EJ / 1e9:.2f} GHz")
print(f"critical current Ic = {Ic * 1e9:.1f} nA")

# exact levels from the charge basis, as in example 42
n = np.arange(-20, 21)
H = np.diag(4 * EC * n**2) - EJ / 2 * (
    np.eye(41, k=1) + np.eye(41, k=-1))
E = np.linalg.eigvalsh(H)
f01 = E[1] - E[0]
approx = np.sqrt(8 * EJ * EC) - EC
print(f"f01 = {f01 / 1e9:.3f} GHz (formula {approx / 1e9:.3f})")
assert abs(f01 - approx) / f01 < 0.01
assert 3e9 < f01 < 8e9    # in the usual microwave band
