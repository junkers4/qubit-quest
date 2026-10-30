"""Level 11, TENSOR PRODUCTS: np.kron joins systems.

np.kron(a, b) puts a on the LEFT digit, like this game.
Run: python examples/11_tensor.py
"""
import numpy as np

ket0, ket1 = np.array([1, 0]), np.array([0, 1])
print("|0> x |1> =", np.kron(ket0, ket1))  # |01>
print("|1> x |0> =", np.kron(ket1, ket0))  # |10>
assert (np.kron(ket1, ket0) == [0, 0, 1, 0]).all()

# sizes multiply: 10 qubits need 2**10 numbers
state = ket0
for _ in range(9):
    state = np.kron(state, ket0)
print("10 qubits:", state.size, "amplitudes")
assert state.size == 1024


def is_product(psi):
    """A 2-qubit state is a product exactly when its 2x2
    reshape has rank 1 (one Schmidt coefficient)."""
    return np.linalg.matrix_rank(psi.reshape(2, 2)) == 1


s = 1 / np.sqrt(2)
plus = np.array([s, s])
bell = np.array([s, 0, 0, s])
print("|+>|+> is a product:", is_product(np.kron(plus, plus)))
print("Bell state is a product:", is_product(bell))
assert is_product(np.kron(plus, ket1))
assert not is_product(bell)

# matrices too: X on the first qubit, nothing on the second
X, I = np.array([[0, 1], [1, 0]]), np.eye(2)
print("(X x I)|00> =", np.kron(X, I) @ np.kron(ket0, ket0))
