"""Level 42, SUPERCONDUCTING QUBITS: the transmon's levels.

The transmon Hamiltonian in the charge basis |n>:
  H = 4 EC (n - ng)^2 - EJ cos(phi)
where cos(phi) moves one Cooper pair: (|n><n+1| + h.c.)/2.
Koch et al. (2007): E01 ~ sqrt(8 EJ EC) - EC and the
anharmonicity E12 - E01 ~ -EC when EJ/EC is large.
Run: python examples/42_superconducting.py
"""
import numpy as np

EC = 0.25          # GHz (energies as frequencies, E/h)
EJ = 50 * EC       # a typical transmon ratio EJ/EC = 50


def levels(ng, n_max=20):
    n = np.arange(-n_max, n_max + 1)
    H = np.diag(4 * EC * (n - ng) ** 2)
    H -= EJ / 2 * (np.eye(len(n), k=1) + np.eye(len(n), k=-1))
    return np.linalg.eigvalsh(H)


E = levels(ng=0.0)
f01, f12 = E[1] - E[0], E[2] - E[1]
print(f"f01 = {f01:.3f} GHz, f12 = {f12:.3f} GHz")
print(f"anharmonicity f12 - f01 = {f12 - f01:.3f} GHz")
assert abs(f01 - (np.sqrt(8 * EJ * EC) - EC)) < 0.05
assert abs((f12 - f01) + EC) < 0.05     # about -EC

# a plain LC oscillator would have f12 = f01: no qubit
# charge noise: f01 hardly moves when the offset ng changes
spread = levels(0.5)[1] - levels(0.5)[0] - f01
print(f"f01 change from ng = 0 to 0.5: {spread * 1e6:.1f} kHz")
assert abs(spread) < 1e-3
