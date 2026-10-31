"""Level 5, PROBABILITY: chances, products, many shots.

Run: python examples/05_probability.py
"""
# Fraction keeps exact values like 1/4 (no rounding)
from fractions import Fraction

import numpy as np

# two fair coins: HH, HT, TH, TT are equally likely
p_both = Fraction(1, 2) * Fraction(1, 2)
print("P(both heads) =", p_both)
assert p_both == Fraction(1, 4)

# the complement rule
print("P(not a 6) =", 1 - Fraction(1, 6))

# the law of large numbers: shares approach probabilities
# a fixed seed: the same "random" numbers every run,
# so the output can be checked
# rng.random(n) gives n numbers in [0, 1); a number
# below 0.25 counts as a hit, with chance 1/4
rng = np.random.default_rng(seed=7)
for shots in (10, 100, 1000, 100000):
    hits = (rng.random(shots) < 0.25).sum()
    print(f"{shots:6d} shots: share {hits / shots:.3f}")

hits = (rng.random(100000) < 0.25).sum()
assert abs(hits / 100000 - 0.25) < 0.01
