"""Level 3, LOGIC GATES: truth tables, NAND builds everything.

Run: python examples/03_gates.py
"""
def NAND(a, b):
    return 1 - (a & b)

# NOT, AND, OR and XOR from NAND alone
def NOT(a):
    return NAND(a, a)

def AND(a, b):
    return NOT(NAND(a, b))

def OR(a, b):
    return NAND(NOT(a), NOT(b))

def XOR(a, b):
    c = NAND(a, b)
    return NAND(NAND(a, c), NAND(b, c))

print("A B | AND OR XOR")
for a in (0, 1):
    for b in (0, 1):
        print(a, b, "|", AND(a, b), OR(a, b), XOR(a, b))
        assert AND(a, b) == (a & b)
        assert OR(a, b) == (a | b)
        assert XOR(a, b) == (a ^ b)

# a half adder: XOR is the sum digit, AND the carry
for a in (0, 1):
    for b in (0, 1):
        carry, total = AND(a, b), XOR(a, b)
        print(f"{a} + {b} = {carry}{total} (binary)")
        assert 2 * carry + total == a + b
