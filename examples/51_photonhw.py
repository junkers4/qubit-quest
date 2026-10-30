"""Level 51, PHOTON SOURCES, DETECTORS: energy and efficiency.

Down-conversion keeps energy: 1/lp = 1/l1 + 1/l2.
Run: python examples/51_photonhw.py
"""
def partner(pump_nm, signal_nm):
    return 1 / (1 / pump_nm - 1 / signal_nm)


print("405 nm pump, 810 nm signal -> idler",
      round(partner(405, 810), 1), "nm")
assert abs(partner(405, 810) - 810) < 1e-9
print("405 nm pump, 780 nm signal -> idler",
      round(partner(405, 780), 1), "nm")

# every photon must be detected: efficiency to the N-th power
for eff in (0.2, 0.93):
    for N in (2, 10, 50):
        print(f"efficiency {eff}:",
              f"all {N:2d} click {eff**N:.2e}")
assert abs(0.93**10 - 0.484) < 0.001
assert 0.2**10 < 1.1e-7
