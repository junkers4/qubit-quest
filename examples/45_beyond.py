"""Level 45, WHAT NEXT: a playground. Change it and rerun!

Run: python examples/45_beyond.py
"""
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(3)
qc.h(0)          # try: qc.x(0), qc.s(1), qc.ccx(0, 1, 2) ...
qc.cx(0, 1)
qc.cx(0, 2)
print(qc.draw())

state = Statevector(qc)
print("amplitudes (Qiskit order):")
for key, amp in state.to_dict().items():
    print(f"  |{key}>  {amp:.3f}")

qc.measure_all()
res = StatevectorSampler(seed=0).run([qc], shots=1000).result()
counts = res[0].data.meas.get_counts()
print("1000 shots:", counts)
assert set(counts) == {"000", "111"}
