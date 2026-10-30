"""Level 49, ION TRAP HARDWARE: Yb+ numbers, the MS gate.

Run: python examples/49_iontrap.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

h, c, eV = 6.62607015e-34, 299792458, 1.602176634e-19

# the 369.5 nm detection light against the 12.6 GHz qubit
optical = h * c / 369.5e-9
qubit = h * 12.6e9
print(f"369.5 nm photon: {optical / eV:.2f} eV")
print(f"12.6 GHz qubit:  {qubit / eV * 1e6:.1f} micro-eV")
print(f"ratio: {optical / qubit:.0f}")
assert abs(optical / eV - 3.36) < 0.01

# the Molmer-Sorensen gate is exp(-i pi/4 X X): from |00>
# it makes the Bell state (|00> - i|11>)/sqrt2
qc = QuantumCircuit(2)
qc.rxx(np.pi / 2, 0, 1)
s = 1 / np.sqrt(2)
want = Statevector([s, 0, 0, -1j * s])
print(Statevector(qc))
assert Statevector(qc).equiv(want)
