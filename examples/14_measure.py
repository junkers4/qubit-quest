"""Level 14, MEASUREMENT: the Born rule and shots.

Run: python examples/14_measure.py
"""
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import Statevector

# P(1) = |0.8|^2 for 0.6|0> + 0.8|1>
psi = Statevector([0.6, 0.8])
print("P(0), P(1) =", psi.probabilities())

# |+> measured 1024 times: roughly half and half
qc = QuantumCircuit(1)
qc.h(0)
qc.measure_all()
sampler = StatevectorSampler(seed=1234)
result = sampler.run([qc], shots=1024).result()
counts = result[0].data.meas.get_counts()
print("counts for |+>:", counts)
assert set(counts) == {"0", "1"}
assert abs(counts["0"] - 512) < 80

# a measured qubit stays put: measure twice, same answer
qc2 = QuantumCircuit(1, 2)
qc2.h(0)
qc2.measure(0, 0)
qc2.measure(0, 1)
res = StatevectorSampler(seed=5).run([qc2], shots=200)
twice = res.result()[0].data.c.get_counts()
print("measured twice:", twice)
assert set(twice) <= {"00", "11"}

# a global sign changes nothing
minus0 = Statevector([-1, 0])
assert minus0.equiv(Statevector([1, 0]))
