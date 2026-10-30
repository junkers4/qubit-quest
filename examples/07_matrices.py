"""Level 7, MATRICES: a matrix moves vectors; order matters.

Run: python examples/07_matrices.py
"""
import numpy as np

X = np.array([[0, 1], [1, 0]])
Z = np.array([[1, 0], [0, -1]])
v = np.array([2, 5])

print("X v =", X @ v)  # swaps the two numbers
assert (X @ v == [5, 2]).all()

print("[2 0; 0 3] (1, 1) =", np.diag([2, 3]) @ [1, 1])

# A B v = A (B v): B acts first
assert (X @ Z @ v == X @ (Z @ v)).all()

# order matters: XZ is not ZX (here XZ = -ZX)
print("XZ =\n", X @ Z, "\nZX =\n", Z @ X)
assert not np.array_equal(X @ Z, Z @ X)
assert np.array_equal(X @ Z, -(Z @ X))

I = np.eye(2)
assert np.array_equal(X @ X, I)  # X undoes itself
