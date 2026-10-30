"""Level 5, PROBABILITY: chances, products, many shots.

Run: python examples/05_probability.py
"""
from fractions import Fraction

import numpy as np

# two fair coins: HH, HT, TH, TT are equally likely
p_both = Fraction(1, 2) * Fraction(1, 2)
print("P(both heads) =", p_both)
assert p_both == Fraction(1, 4)

# the complement rule
print("P(not a 6) =", 1 - Fraction(1, 6))

# the law of large numbers: shares approach probabilities
rng = np.random.default_rng(seed=7)
for shots in (10, 100, 1000, 100000):
    hits = (rng.random(shots) < 0.25).sum()
    print(f"{shots:6d} shots: share {hits / shots:.3f}")

hits = (rng.random(100000) < 0.25).sum()
assert abs(hits / 100000 - 0.25) < 0.01
