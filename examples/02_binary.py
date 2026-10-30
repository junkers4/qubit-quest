"""Level 2, BINARY NUMBERS: place values 1, 2, 4, 8, ...

Run: python examples/02_binary.py
"""
for text in ["101", "1011", "1111"]:
    value = int(text, 2)
    places = " + ".join(
        f"{d}x{2**i}" for i, d in enumerate(reversed(text)))
    print(text, "=", places, "=", value)

assert int("1011", 2) == 11
assert format(5, "03b") == "101"

# 4 bits count from 0 to 15
for n in range(16):
    print(format(n, "04b"), n)

# a ket label is a number: |101> is basis state number 5
print("|101> is basis state", int("101", 2))
