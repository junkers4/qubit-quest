"""Level 43, THE DILUTION FRIDGE: why 0.01 K.

The chance that heat has flipped a qubit of frequency f
at temperature T: p1 = 1 / (1 + exp(h f / k T)).
Run: python examples/43_fridge.py
"""
import math

h = 6.62607015e-34   # Planck constant, J s (exact)
k = 1.380649e-23     # Boltzmann constant, J/K (exact)
f = 5e9              # a 5 GHz qubit

print(f"h f / k = {h * f / k:.3f} K")
stages = [("room", 300), ("first plate", 50),
          ("second plate", 4), ("still", 1),
          ("cold plate", 0.1), ("mixing", 0.01)]
for name, T in stages:
    p1 = 1 / (1 + math.exp(h * f / (k * T)))
    print(f"{name:13s} {T:7.2f} K  P(heat flip) = {p1:.2e}")

p_room = 1 / (1 + math.exp(h * f / (k * 300)))
p_cold = 1 / (1 + math.exp(h * f / (k * 0.01)))
assert abs(p_room - 0.5) < 0.01    # hot: a coin flip
assert p_cold < 1e-9               # cold: almost never
