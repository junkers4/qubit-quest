"""Level 52, NEUTRAL ATOMS: loading, sorting, Rydberg CZ.

Run: python examples/52_atoms.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

rng = np.random.default_rng(16)

# each of 100 tweezers catches an atom about half the time
traps = rng.random(100) < 0.5
print("loaded:", traps.sum(), "of 100")
print("".join("o" if t else "." for t in traps[:50]))

# move the atoms we have into the first places, no gaps
atoms = int(traps.sum())
sorted_traps = np.arange(100) < atoms
print("".join("o" if t else "." for t in sorted_traps[:50]))
assert sorted_traps[:atoms].all()
assert not sorted_traps[atoms:].any()

# the blockade gives a CZ; H on the target makes a CNOT
qc = QuantumCircuit(2)
qc.h(1)
qc.cz(0, 1)
qc.h(1)
cnot = QuantumCircuit(2)
cnot.cx(0, 1)
assert Operator(qc).equiv(Operator(cnot))
print("H CZ H = CNOT")
