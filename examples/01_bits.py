"""Level 1, BITS: n bits have 2**n patterns, but hold one.

Run: python examples/01_bits.py
"""
from itertools import product

for n in range(1, 5):
    patterns = ["".join(p) for p in product("01", repeat=n)]
    print(n, "bits:", len(patterns), "patterns:", patterns[:8])
    assert len(patterns) == 2**n

# a classical register holds exactly one of them at a time
register = "101"
print("the register now holds only", register)
print("a byte has", 2**8, "patterns")
assert 2**8 == 256
