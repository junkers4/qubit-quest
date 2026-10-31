"""Level 10, INNER PRODUCTS: <a|b> conjugates the bra.

np.vdot(a, b) conjugates a, so it is exactly <a|b>.
Run: python examples/10_inner.py
"""
import numpy as np

# the states as plain vectors of amplitudes;
# s = 1/sqrt(2) keeps each of length 1
s = 1 / np.sqrt(2)
ket0 = np.array([1, 0])
ket1 = np.array([0, 1])
plus = np.array([s, s])
minus = np.array([s, -s])
plus_i = np.array([s, 1j * s])

# np.vdot(a, b) is the inner product <a|b>: it
# conjugates a first. 0 means the states are
# perfectly distinguishable (orthogonal)
# (rounded: floating point leaves tiny leftovers like 1e-17)
print("<0|1> =", np.round(np.vdot(ket0, ket1), 6))
print("<+|-> =", np.round(np.vdot(plus, minus), 6) + 0)
print("<+|+> =", np.round(np.vdot(plus, plus), 6))
assert np.isclose(np.vdot(ket0, ket1), 0)
assert np.isclose(np.vdot(plus, minus), 0)
assert np.isclose(np.vdot(plus_i, plus_i), 1)

# chance to find |+> as |0>: |<0|+>|^2 = 1/2
p = abs(np.vdot(ket0, plus)) ** 2
print("|<0|+>|^2 =", round(p, 6))
assert np.isclose(p, 0.5)

# without the conjugate the length of |+i> would come out 0
print("wrong, no conjugate:", plus_i @ plus_i)
