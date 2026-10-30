"""Level 44, THE DILUTION FRIDGE: heat flips and radiation.

The chance that heat has flipped a qubit of frequency f
at temperature T: p1 = 1 / (1 + exp(h f / k T)).
A surface at T radiates sigma T^4 per square metre.
Run: python examples/44_fridge.py
"""
import math

h = 6.62607015e-34   # Planck constant, J s (exact)
k = 1.380649e-23     # Boltzmann constant, J/K (exact)
sigma = 5.670374419e-8   # Stefan-Boltzmann, W m^-2 K^-4
f = 5e9              # a 5 GHz qubit

print(f"h f / k = {h * f / k:.3f} K")
stages = [("room", 300), ("first plate", 50),
          ("second plate", 4), ("still", 1),
          ("cold plate", 0.1), ("mixing", 0.01)]
for name, T in stages:
    p1 = 1 / (1 + math.exp(h * f / (k * T)))
    rad = sigma * T**4
    print(f"{name:13s} {T:7.2f} K  heat flip {p1:.1e}"
          f"  radiates {rad:.1e} W/m^2")

p_room = 1 / (1 + math.exp(h * f / (k * 300)))
p_cold = 1 / (1 + math.exp(h * f / (k * 0.01)))
assert abs(p_room - 0.5) < 0.01    # hot: a coin flip
assert p_cold < 1e-9               # cold: almost never
assert round(sigma * 300**4) == 459      # ~460 W per m^2
assert abs(sigma * 4**4 - 14.5e-6) < 0.1e-6  # ~15 uW
