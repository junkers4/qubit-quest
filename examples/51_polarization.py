"""Level 51, POLARIZATION QUBITS: wave plates are gates.

Jones calculus: H = |0>, V = |1>. A half-wave plate at angle t
is [[cos 2t, sin 2t], [sin 2t, -cos 2t]] (up to a phase); a
quarter-wave plate with a horizontal fast axis is diag(1, i).
Run: python examples/51_polarization.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector


# the Jones matrix of a half-wave plate with its fast
# axis at angle t (radians), up to a global phase
def hwp(t):
    c, s = np.cos(2 * t), np.sin(2 * t)
    return np.array([[c, s], [s, -c]])


# a quarter-wave plate: V lags a quarter wave (i)
QWP = np.diag([1, 1j])


def same_gate(a, b):
    """Equal up to a global phase."""
    return Operator(a).equiv(Operator(b))


# the matching qubit gates, from Qiskit
gates = {}
for name in ("x", "h", "s", "z"):
    qc = QuantumCircuit(1)
    getattr(qc, name)(0)
    gates[name] = qc

assert same_gate(hwp(np.pi / 4), gates["x"])     # 45 deg
assert same_gate(hwp(np.pi / 8), gates["h"])     # 22.5 deg
assert same_gate(hwp(0), gates["z"])
assert same_gate(QWP, gates["s"])
print("HWP 45 = X, HWP 22.5 = H, HWP 0 = Z, QWP = S")

# the puzzle: |H> -> HWP 22.5 -> QWP = circular light
light = QWP @ hwp(np.pi / 8) @ np.array([1, 0])
qc = QuantumCircuit(1)
qc.h(0)
qc.s(0)
want = Statevector(qc).data      # (|H> + i|V>) / sqrt 2
print("Jones:", np.round(light, 3))
print("Qiskit:", np.round(want, 3))
assert np.allclose(light, want)

# Malus: a polarizer at angle t passes cos^2 t of H light
for deg in (0, 30, 45, 60, 90):
    t = np.radians(deg)
    pol = np.array([np.cos(t), np.sin(t)])
    p = abs(pol @ np.array([1, 0])) ** 2
    print(f"polarizer {deg:2d} deg: passes {p:.3f}")
    assert np.isclose(p, np.cos(t) ** 2)
