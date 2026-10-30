"""Level 47, CONTROL AND READOUT: two clouds in the IQ plane.

Each shot gives a point (I, Q); the qubit state picks
which cloud it comes from; noise spreads the clouds.
Run: python examples/47_readout.py
"""
import numpy as np

rng = np.random.default_rng(47)
shots = 20000


def fidelity(separation, noise=1.0):
    c0, c1 = np.array([-separation / 2, 0]), \
        np.array([separation / 2, 0])
    p0 = c0 + noise * rng.standard_normal((shots, 2))
    p1 = c1 + noise * rng.standard_normal((shots, 2))
    # threshold: the line half way between the clouds
    right0 = (p0[:, 0] < 0).mean()   # 0 read as 0
    right1 = (p1[:, 0] > 0).mean()   # 1 read as 1
    return (right0 + right1) / 2


for sep in (1, 2, 4, 6):
    print(f"separation {sep} sigma:",
          f"fidelity {fidelity(sep):.4f}")
assert fidelity(1) < 0.8
assert fidelity(6) > 0.99

# a smooth (Gaussian) pulse and its DRAG correction
t = np.linspace(-2, 2, 401)
x = np.exp(-t**2 / 0.5)            # the main (X) envelope
# the derivative goes on the other (Y) quadrature
y = -np.gradient(x, t) * 0.1
print("pulse area", round(np.trapezoid(x, t), 3),
      " DRAG area", round(np.trapezoid(y, t), 6))
# it adds no net rotation
assert abs(np.trapezoid(y, t)) < 1e-6
