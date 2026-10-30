"""Level 45, HELIUM DILUTION: cooling power and Kapitza.

With ideal heat exchangers the mixing chamber cools with
about Q = 84 n T^2 watts for n mol/s of helium-3 (Pobell).
The Kapitza boundary resistance grows like 1 / T^3.
Run: python examples/45_dilution.py
"""
def cooling_power(n, T):
    return 84 * n * T**2


n = 1e-3   # a helium-3 flow of 1 mmol/s (an example value)
for T in (0.1, 0.05, 0.02, 0.01):
    q = cooling_power(n, T)
    print(f"T = {T * 1000:5.1f} mK:",
          f"cooling power {q * 1e6:7.2f} uW")

# halving the temperature quarters the cooling power
assert abs(cooling_power(n, 0.05) / cooling_power(n, 0.1)
           - 0.25) < 1e-12

# the flow needed for 10 uW at 10 mK
need = 10e-6 / (84 * 0.01**2)
print(f"flow for 10 uW at 10 mK: {need * 1000:.2f} mmol/s")
assert abs(need - 1.19e-3) < 0.01e-3

# Kapitza: from 100 mK down to 10 mK the boundary resistance
# grows 1000 times, so the contact area must grow with it
print("Kapitza resistance 10 mK / 100 mK:", (0.1 / 0.01) ** 3)
assert (0.1 / 0.01) ** 3 == 1000
