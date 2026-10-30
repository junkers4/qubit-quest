"""Level 58, VARIATIONAL ALGORITHMS: a tiny VQE.

Run: python examples/58_variational.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp, Statevector
from scipy.optimize import minimize

# 1 qubit, H = Z: the lowest energy -1 is at theta = pi (|1>)
def energy1(theta):
    qc = QuantumCircuit(1)
    qc.ry(theta[0], 0)
    return Statevector(qc).expectation_value(
        SparsePauliOp("Z")).real


res = minimize(energy1, x0=[0.3], method="COBYLA")
print("H = Z: theta =", round(res.x[0], 3),
      "E =", round(res.fun, 4))
assert np.isclose(res.fun, -1, atol=1e-3)

# 2 qubits, H = ZZ + 0.5 XI, against the exact answer
H = SparsePauliOp(["ZZ", "XI"], [1.0, 0.5])
exact = np.linalg.eigvalsh(H.to_matrix()).min()


def energy2(p):
    qc = QuantumCircuit(2)
    qc.ry(p[0], 0)
    qc.ry(p[1], 1)
    qc.cx(0, 1)
    qc.ry(p[2], 0)
    qc.ry(p[3], 1)
    return Statevector(qc).expectation_value(H).real


rng = np.random.default_rng(0)
best = min((minimize(energy2, rng.uniform(0, 2 * np.pi, 4),
                     method="COBYLA") for _ in range(5)),
           key=lambda r: r.fun)
print("VQE energy", round(best.fun, 5),
      " exact", round(exact, 5))
assert abs(best.fun - exact) < 1e-3
