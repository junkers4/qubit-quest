"""Level 55, SPIN QUBIT DEVICES: spin-to-charge readout.

Spin up may tunnel out of the dot within the read window;
spin down cannot. A charge sensor sees the tunnelling.
Run: python examples/55_spinhw.py
"""
import numpy as np

rng = np.random.default_rng(55)
shots = 50000
tunnel_time = 1.0      # mean time for spin up to tunnel out
window = 4.0           # how long we watch (same units)
false_click = 0.01     # sensor noise that looks like a jump

up_out = rng.exponential(tunnel_time, shots) < window
up_read = up_out | (rng.random(shots) < false_click)
down_read = rng.random(shots) < false_click

f_up, f_down = up_read.mean(), 1 - down_read.mean()
print(f"spin up read as up:     {f_up:.4f}")
print(f"spin down read as down: {f_down:.4f}")
print(f"readout fidelity:       {(f_up + f_down) / 2:.4f}")
assert f_up > 0.97 and f_down > 0.98

# a longer window catches more tunnel events
longer = 1 - np.exp(-8 / tunnel_time)
assert longer > 1 - np.exp(-4 / tunnel_time)
