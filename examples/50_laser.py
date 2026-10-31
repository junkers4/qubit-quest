"""Level 50, HOW A LASER WORKS: inversion and coherence.

In equilibrium N2/N1 = exp(-h nu / kT): visible light never
inverts by itself, so a laser is pumped. Coherence length
L = c / linewidth. The CODE uses scipy's physical constants.
Run: python examples/50_laser.py
"""
import numpy as np
# c: speed of light, h: Planck, k: Boltzmann (SI)
from scipy.constants import c, h, k

# thermal light at 633 nm (a red laser line), room temperature
# Boltzmann: the share of atoms up is exp(-h nu / kT)
nu = c / 633e-9
ratio = np.exp(-h * nu / (k * 300))
print(f"N2/N1 at 300 K, 633 nm: {ratio:.1e}")
assert 1e-34 < ratio < 1e-32       # about 10^-33: no inversion

# even a hot lamp filament (3000 K) is far from inverted
hot = np.exp(-h * nu / (k * 3000))
print(f"N2/N1 at 3000 K: {hot:.1e}")
assert hot < 1e-3

# a laser photon: energy in electron volts
ev = h * nu / 1.602176634e-19
print(f"photon energy: {ev:.2f} eV")
assert abs(ev - 1.96) < 0.01

# coherence length L = c / linewidth
for name, width in [("1 kHz laser", 1e3), ("1 MHz laser", 1e6),
                    ("white light", 3e14)]:
    L = c / width
    print(f"{name:12s}: L = {L:.3g} m")
assert abs(c / 1e6 - 300) < 1          # the quiz: about 300 m
assert 1e-7 < c / 3e14 < 1e-5          # about a micrometre

# Maiman's ruby laser: 694.3 nm, a photon of about 1.79 eV
ruby = h * c / 694.3e-9 / 1.602176634e-19
print(f"ruby photon: {ruby:.2f} eV")
assert abs(ruby - 1.79) < 0.01
