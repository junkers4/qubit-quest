"""Level 53, ATOM ARRAY HARDWARE: the Rydberg blockade.

Two atoms, each |g> or |r>, both driven with Rabi frequency
W; a strong interaction V on |rr> blocks double excitation.
Run: python examples/53_atomhw.py
"""
import numpy as np
from scipy.linalg import expm

W, V = 1.0, 100.0          # V >> W: the blockade regime
g, r = np.array([1, 0]), np.array([0, 1])
drive = np.array([[0, 1], [1, 0]]) * W / 2
I = np.eye(2)
rr = np.kron(np.outer(r, r), np.outer(r, r))
H = np.kron(drive, I) + np.kron(I, drive) + V * rr

start = np.kron(g, g)
ts = np.linspace(0, 2 * np.pi / np.sqrt(2), 9)
for t in ts:
    psi = expm(-1j * H * t) @ start
    p_rr = abs(psi[3]) ** 2
    p_one = abs(psi[1]) ** 2 + abs(psi[2]) ** 2
    print(f"t={t:4.2f}: one excited {p_one:.3f}",
          f"both {p_rr:.4f}")
    assert p_rr < 0.01                  # never both at once

# blockade speeds the collective Rabi flop up by sqrt(2)
t_pi = np.pi / (np.sqrt(2) * W)
psi = expm(-1j * H * t_pi) @ start
assert abs(psi[1]) ** 2 + abs(psi[2]) ** 2 > 0.99
print("one shared excitation after t = pi / (sqrt2 W)")

# rearrangement (Endres et al. 2016): about 0.6 -> 0.988
print("defect-free 50 atoms at 0.988 each:",
      round(0.988**50, 3))
