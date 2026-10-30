"""Level 26, NO CLONING: CNOT copies 0 and 1, not |+>.

Run: python examples/26_nocloning.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, state_fidelity

for label in ("0", "1"):
    qc = QuantumCircuit(2)
    if label == "1":
        qc.x(0)
    qc.cx(0, 1)
    print(f"copy of |{label}>:",
          Statevector(qc).probabilities_dict())

# the same circuit on |+>
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
got = Statevector(qc)
copy = Statevector.from_label("++")  # what a cloner would give
s = 1 / np.sqrt(2)
print("got:", np.round(got.data.real, 3))
print("a true copy:", np.round(copy.data.real, 3))
assert got.equiv(Statevector([s, 0, 0, s]))  # a Bell state
print("fidelity with |++>:", state_fidelity(got, copy))
assert state_fidelity(got, copy) < 0.51
