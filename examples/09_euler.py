"""Level 9, PHASE AND EULER: e^(i theta) = cos + i sin.

Run: python examples/09_euler.py
"""
import cmath
import math

for theta in (0, math.pi / 4, math.pi / 2, math.pi):
    z = cmath.exp(1j * theta)
    print(f"theta={theta:.3f}  e^(i theta)={z:.3f}",
          f"|z|={abs(z):.3f}")
    assert math.isclose(abs(z), 1)
    euler = math.cos(theta) + 1j * math.sin(theta)
    assert cmath.isclose(z, euler)

# Euler's identity: e^(i pi) = -1
assert cmath.isclose(cmath.exp(1j * math.pi), -1)
# multiplying adds angles: two quarter turns are a half turn
q = cmath.exp(1j * math.pi / 2)
assert cmath.isclose(q * q, -1)

# a phase never changes a probability |a|^2
a = 0.6
for theta in (0.3, 1.0, 2.5):
    b = cmath.exp(1j * theta) * a
    assert math.isclose(abs(b) ** 2, a**2)
print("phases keep probabilities")
