"""Level 20, BASES AND ROTATIONS: measure in X, any angle.

Run: python examples/20_bases.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator, Statevector
from qiskit.synthesis import OneQubitEulerDecomposer

# measuring in the X basis: H first, then a normal reading
qc = QuantumCircuit(1)
qc.x(0)
qc.h(0)      # the qubit is |->
qc.h(0)      # turn the X basis into the Z basis
print("|-> read in the X basis:",
      Statevector(qc).probabilities())
assert np.allclose(Statevector(qc).probabilities(), [0, 1])

# RY(pi/2)|0> = |+>, RX(pi) = X up to a global phase
ry = QuantumCircuit(1)
ry.ry(np.pi / 2, 0)
assert Statevector(ry).equiv(Statevector.from_label("+"))
rx = QuantumCircuit(1)
rx.rx(np.pi, 0)
x = QuantumCircuit(1)
x.x(0)
assert Operator(rx).equiv(Operator(x))

# any one-qubit gate is RZ RY RZ (times a global phase)
rng = np.random.default_rng(3)
a, b, c = rng.uniform(0, 2 * np.pi, 3)
gate = QuantumCircuit(1)
gate.rx(a, 0)
gate.ry(b, 0)
gate.rz(c, 0)
zyz = OneQubitEulerDecomposer("ZYZ")(Operator(gate))
print(zyz.draw())
assert Operator(zyz).equiv(Operator(gate))
