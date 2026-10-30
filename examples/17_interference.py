"""Level 17, INTERFERENCE: H H |0> = |0>, path by path.

Run: python examples/17_interference.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)

# add up every path |0> -> |m> -> |k>: amplitude H[k,m]*H[m,0]
for k in (0, 1):
    paths = [H[k, m] * H[m, 0] for m in (0, 1)]
    print(f"into |{k}>: paths {np.round(paths, 2)} sum",
          round(sum(paths), 2))
# |1> gets +1/2 and -1/2: they cancel
assert np.isclose(sum(H[1, m] * H[m, 0] for m in (0, 1)), 0)

qc = QuantumCircuit(1)
qc.h(0)
qc.h(0)
print("H H |0> =", Statevector(qc))
assert Statevector(qc).equiv(Statevector.from_label("0"))
