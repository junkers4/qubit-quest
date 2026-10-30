"""Level 31, QUANTUM KEYS: BB84: a secret key, a spy.

Run: python examples/31_bb84.py
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

N = 400
rng = np.random.default_rng(2024)
sampler = StatevectorSampler(seed=99)


def prepare(bit, basis):
    """A qubit holding `bit` in basis 0 (Z) or 1 (X)."""
    qc = QuantumCircuit(1)
    if bit:
        qc.x(0)
    if basis:
        qc.h(0)
    return qc


def measure(qcs, bases):
    """Read each qubit in its basis; one shot each."""
    pubs = []
    for qc, basis in zip(qcs, bases):
        qc = qc.copy()
        if basis:
            qc.h(0)
        qc.measure_all()
        pubs.append(qc)
    res = sampler.run(pubs, shots=1).result()
    return [int(next(iter(r.data.meas.get_counts())))
            for r in res]


def run(eve):
    bits = rng.integers(0, 2, N)
    a_bases = rng.integers(0, 2, N)
    b_bases = rng.integers(0, 2, N)
    qubits = [prepare(b, a) for b, a in zip(bits, a_bases)]
    if eve:  # Eve reads in random bases and resends
        e_bases = rng.integers(0, 2, N)
        e_bits = measure(qubits, e_bases)
        qubits = [prepare(b, e)
                  for b, e in zip(e_bits, e_bases)]
    got = np.array(measure(qubits, b_bases))
    keep = a_bases == b_bases          # compare bases only
    errors = np.mean(got[keep] != bits[keep])
    return keep.mean(), errors


kept, err = run(eve=False)
print(f"no spy:   kept {kept:.2f}, error rate {err:.3f}")
assert err == 0 and abs(kept - 0.5) < 0.1
kept, err = run(eve=True)
print(f"with Eve: kept {kept:.2f}, error rate {err:.3f}")
assert abs(err - 0.25) < 0.08
