"""Level 41, WHAT A QUBIT NEEDS: DiVincenzo's checklist.

Each criterion, tried out in Qiskit. The timing numbers
are round example values, not those of a real machine.
Run: python examples/41_divincenzo.py
"""
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit.primitives import StatevectorSampler
from qiskit.quantum_info import (Operator, Statevector,
                                 random_unitary)

# 1 + 2: several qubits, reset to |000>
assert Statevector(QuantumCircuit(3)).equiv(
    Statevector.from_label("000"))

# 3: coherence much longer than a gate (example values)
coherence_us, gate_ns = 100, 50
print("gates that fit:", coherence_us * 1000 // gate_ns)

# 4: a universal gate set: any 2-qubit unitary from
#    rz, sx and cx
U = random_unitary(4, seed=7)
qc = QuantumCircuit(2)
qc.unitary(U, [0, 1])
hw = transpile(qc, basis_gates=["rz", "sx", "cx"],
               optimization_level=1)
print("as rz/sx/cx:", dict(hw.count_ops()))
assert Operator(hw).equiv(U)

# 5: read out every qubit
qc = QuantumCircuit(3)
qc.x([0, 2])
qc.measure_all()
res = StatevectorSampler(seed=1).run([qc], shots=10).result()
print("readout:", res[0].data.meas.get_counts())
assert res[0].data.meas.get_counts() == {"101": 10}
assert np.isclose(abs(np.linalg.det(U.data)), 1)
