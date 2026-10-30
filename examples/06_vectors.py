"""Level 6, VECTORS: add, scale, length, basis.

Run: python examples/06_vectors.py
"""
import numpy as np

v = np.array([3.0, 4.0])
print("length of (3, 4):", np.linalg.norm(v))
assert np.isclose(np.linalg.norm(v), 5)

print("(1,2) + (3,0) =", np.array([1, 2]) + np.array([3, 0]))
print("2 x (1,2) =", 2 * np.array([1, 2]))

# every vector is a mix of the basis vectors e0, e1
e0, e1 = np.array([1, 0]), np.array([0, 1])
a, b = 0.6, 0.8
w = a * e0 + b * e1
print("0.6 e0 + 0.8 e1 =", w, "length", np.linalg.norm(w))
assert np.isclose(np.linalg.norm(w), 1)  # a unit vector
