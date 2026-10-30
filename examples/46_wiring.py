"""Level 46, WIRES, FILTERS, SHIELDS: attenuating noise.

Thermal photons per mode: n(T) = 1 / (exp(h f / k T) - 1).
An attenuator A at temperature T passes n / A and adds
(1 - 1/A) n(T) of its own.
Run: python examples/46_wiring.py
"""
import math

h, k, f = 6.62607015e-34, 1.380649e-23, 5e9


def n_thermal(T):
    return 1 / (math.expm1(h * f / (k * T)))


def through(n_in, dB, T):
    A = 10 ** (dB / 10)
    return n_in / A + (1 - 1 / A) * n_thermal(T)


n = n_thermal(300)
print(f"at 300 K: {n:.0f} noise photons (~kT/hf)")
assert abs(n - 1250) < 5

# an example chain: 20 dB on each of three cold plates
chain = [(20, 4), (20, 0.1), (20, 0.01)]
for dB, T in chain:
    n = through(n, dB, T)
    print(f"after {dB} dB at {T:5.2f} K: {n:.2e} photons")
assert n < 5e-3          # far below one photon

# without attenuators the qubit would see room noise
assert n_thermal(300) > 1000
print("total attenuation:", sum(d for d, _ in chain), "dB")
