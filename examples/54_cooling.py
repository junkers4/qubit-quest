"""Level 54, LASER COOLING: the Doppler and recoil limits.

Doppler limit T = hbar gamma / (2 kB), recoil velocity
v = hbar k / m. Rubidium-87 numbers: Steck, Rb 87 D line data.
Run: python examples/54_cooling.py
"""
import numpy as np
from scipy.constants import hbar, k as kB, atomic_mass

# rubidium-87, the D2 line
gamma = 2 * np.pi * 6.07e6        # natural linewidth (1/s)
lam = 780.24e-9                   # wavelength (m)
m = 86.909 * atomic_mass          # mass (kg)

T_doppler = hbar * gamma / (2 * kB)
print(f"Doppler limit: {T_doppler * 1e6:.0f} uK")
assert 140e-6 < T_doppler < 150e-6       # about 146 uK

v_recoil = hbar * 2 * np.pi / lam / m
print(f"one photon kick: {v_recoil * 1e3:.2f} mm/s")
assert 5.5e-3 < v_recoil < 6.2e-3        # about 6 mm/s

T_recoil = m * v_recoil ** 2 / kB
print(f"recoil temperature: {T_recoil * 1e9:.0f} nK")
assert 340e-9 < T_recoil < 380e-9        # about 0.36 uK

# sodium: Lett et al. measured 43 uK, far below the
# predicted Doppler limit of 240 uK; that limit means
gamma_na = 2 * kB * 240e-6 / hbar
print(f"sodium linewidth: {gamma_na / 2 / np.pi / 1e6:.1f} MHz")
assert 9 < gamma_na / 2 / np.pi / 1e6 < 11   # about 10 MHz

# kicks to stop a room-temperature atom (about 300 m/s)
kicks = 300 / v_recoil
print(f"photons to stop a 300 m/s atom: {kicks:.0f}")
assert 4e4 < kicks < 6e4
