"""Level 23, ENTANGLEMENT: the Bell state (|00> + |11>)/sqrt2.

Run: python examples/23_bell.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import Statevector, partial_trace

bell = QuantumCircuit(2)
bell.h(0)
bell.cx(0, 1)
print(bell.draw())
state = Statevector(bell)
print(state)
s = 1 / np.sqrt(2)
assert state.equiv(Statevector([s, 0, 0, s]))

# measure 1000 times: only 00 and 11, never 01 or 10
bell.measure_all()
res = StatevectorSampler(seed=11).run([bell], shots=1000)
counts = res.result()[0].data.meas.get_counts()
print("counts:", counts)
assert set(counts) == {"00", "11"}

# each qubit alone is a perfectly random bit
one = partial_trace(state, [1])
print("qubit 0 alone:\n", np.round(one.data.real, 3))
assert np.allclose(one.data, np.eye(2) / 2)
