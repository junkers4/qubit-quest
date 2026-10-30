"""Level 49, ERROR CORRECTION: the 3-qubit bit-flip code.

Run: python examples/49_qec.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import (DensityMatrix, Statevector,
                                 partial_trace)

psi = QuantumCircuit(1)       # the puzzle's state: H T H |0>
psi.h(0)
psi.t(0)
psi.h(0)
want = DensityMatrix(psi)

for error in (None, 0, 1, 2):
    qc = QuantumCircuit(3)
    qc.compose(psi, [0], inplace=True)
    qc.cx(0, 1)               # encode: a|000> + b|111>
    qc.cx(0, 2)
    if error is not None:
        qc.x(error)           # one bit flip
    qc.cx(0, 1)               # decode: q1, q2 = syndrome
    qc.cx(0, 2)
    qc.ccx(1, 2, 0)           # both 1: q0 was hit, flip it
    got = partial_trace(Statevector(qc), [1, 2])
    ok = np.allclose(got.data, want.data)
    print(f"error on {error}: q0 restored = {ok}")
    assert ok
