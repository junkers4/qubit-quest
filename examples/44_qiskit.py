"""Level 44, QISKIT IN PRACTICE: order, counts, transpile.

Run: python examples/44_qiskit.py
"""
from qiskit import QuantumCircuit, transpile
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import Operator, Statevector

# qubit 0 is the RIGHTMOST character of a key
qc = QuantumCircuit(3)
qc.x(0)
qc.measure_all()
res = StatevectorSampler(seed=1).run([qc], shots=100).result()
counts = res[0].data.meas.get_counts()
print("X on qubit 0 of 3:", counts)
assert counts == {"001": 100}

# a GHZ state, drawn and simulated
ghz = QuantumCircuit(3)
ghz.h(0)
ghz.cx(0, 1)
ghz.cx(1, 2)
print(ghz.draw())
print(Statevector(ghz).probabilities_dict())

# rewrite it for a machine with only rz, sx, x and cx
hw = transpile(ghz, basis_gates=["rz", "sx", "x", "cx"],
               optimization_level=1)
print(hw.draw())
print("gates:", dict(hw.count_ops()))
assert set(hw.count_ops()) <= {"rz", "sx", "x", "cx"}
assert Operator(hw).equiv(Operator(ghz))

# On real IBM hardware you would use qiskit-ibm-runtime:
#   from qiskit_ibm_runtime import QiskitRuntimeService
#   from qiskit_ibm_runtime import SamplerV2
# with an account; see the Qiskit documentation.
