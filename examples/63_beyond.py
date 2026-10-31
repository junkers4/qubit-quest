"""Level 63, WHAT NEXT: a playground. Change it and rerun!

Run: python examples/63_beyond.py
"""
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import Statevector

# a GHZ state: H, then CNOTs spread it to all three
qc = QuantumCircuit(3)
qc.h(0)          # try: qc.x(0), qc.s(1), qc.ccx(0, 1, 2) ...
qc.cx(0, 1)
qc.cx(0, 2)
print(qc.draw())

# its amplitudes; to_dict lists the nonzero ones
state = Statevector(qc)
print("amplitudes (Qiskit order):")
for key, amp in state.to_dict().items():
    print(f"  |{key}>  {amp:.3f}")

# and measured: always 000 or 111, never mixed
qc.measure_all()
res = StatevectorSampler(seed=0).run([qc], shots=1000).result()
counts = res[0].data.meas.get_counts()
print("1000 shots:", counts)
assert set(counts) == {"000", "111"}
