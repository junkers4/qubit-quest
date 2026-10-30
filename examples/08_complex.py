"""Level 8, COMPLEX NUMBERS: i*i = -1, size, conjugate.

Python writes i as 1j.
Run: python examples/08_complex.py
"""
z = 3 + 4j
print("z =", z, " |z| =", abs(z), " z* =", z.conjugate())
assert abs(z) == 5

assert 1j * 1j == -1
assert (1j) ** 4 == 1
print("(1+2i) + (3-i) =", (1 + 2j) + (3 - 1j))
print("(1+i)(1-i) =", (1 + 1j) * (1 - 1j))
assert (1 + 1j) * (1 - 1j) == 2

# z times its conjugate is |z|^2, a real number
print("z z* =", z * z.conjugate())
assert z * z.conjugate() == abs(z) ** 2
