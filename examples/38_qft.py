"""Level 38, FOURIER TRANSFORM: build the QFT, check it.

Run: python examples/38_qft.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFTGate
from qiskit.quantum_info import Operator, Statevector


def qft(n):
    """The textbook circuit: H, controlled phase turns,
    then reverse the qubit order. Qiskit's qubit n-1 is
    the high bit."""
    qc = QuantumCircuit(n)
    for j in reversed(range(n)):
        qc.h(j)
        for k in reversed(range(j)):
            qc.cp(np.pi / 2 ** (j - k), k, j)
    for q in range(n // 2):
        qc.swap(q, n - 1 - q)
    return qc


n = 3
N = 2**n
w = np.exp(2j * np.pi / N)
dft = np.array([[w ** (j * k) for j in range(N)]
                for k in range(N)]) / np.sqrt(N)
assert Operator(qft(n)).equiv(Operator(dft))
assert Operator(QFTGate(n)).equiv(Operator(dft))
print("our circuit = QFTGate = the DFT matrix")

# the puzzle (2 qubits): QFT|01>, |01> meaning x = 1
two = QuantumCircuit(2)
two.x(0)               # x = 1 in Qiskit's order
two.compose(qft(2), inplace=True)
want = np.array([1, 1j, -1, -1j]) / 2
print(np.round(Statevector(two).data, 3))
assert Statevector(two).equiv(Statevector(want))
