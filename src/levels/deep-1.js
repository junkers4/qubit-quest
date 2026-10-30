// Deep dives (the MORE button) for worlds 1 to 4: the details, derivations and numbers
// behind each level. Same text format as lesson pages; every page cites its sources.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.addDeep({
    // ---------------------------------------------------------------- world 1
    bits: [
        {title: 'HOW MUCH IS ONE BIT?', refs: ['shannon1948'], body:
            'Shannon measured information by surprise: an event of probability p carries\n' +
            '  -LOG2(p) BITS\n' +
            'A fair coin flip (p = 1/2) is exactly 1 bit. Picking one of N equally likely options is log2(N) bits: one of 8 is 3 bits, one of 256 is 8 bits, a byte.'},
        {title: 'BITS AGAINST QUBITS', refs: ['nc2010 ch. 12', 'nc2010 §1.2.1'], body:
            'n bits hold one pattern out of 2^n. Writing down the state of n qubits takes 2^n complex amplitudes.\n' +
            'But measuring n qubits still gives only n bits. Holevo\'s bound says no trick gets more than n classical bits out of n qubits.\n' +
            '>The power is not storage. It is how amplitudes interfere before you look.'},
    ],
    binary: [
        {title: 'ADDING IN BINARY', refs: ['knuth1997'], body:
            'Binary addition works like school addition, with carries at 2:\n' +
            '  0101 + 0011 = 1000\n' +
            '(5 + 3 = 8). Shifting all digits one place left doubles a number: 0011 → 0110 is 3 → 6. Computers subtract, multiply and divide with the same few tricks.'},
        {title: 'ORDER OF THE DIGITS', refs: ['nc2010 §1.2.1', 'qiskitdocs'], body:
            'A ket |x> with x from 0 to 2^n - 1 names one basic state of n qubits. Which qubit is which digit is a convention:\n' +
            '  GAME, TEXTBOOKS: Q0 = LEFT DIGIT\n' +
            '  QISKIT: QUBIT 0 = RIGHT DIGIT\n' +
            'The state is the same; only its name is written in the other order (Qiskit\'s reverse_qargs() converts).'},
    ],
    gates: [
        {title: 'HOW MANY GATES EXIST?', refs: ['nc2010 §3.1'], body:
            'A gate with two input bits and one output is a table of 4 output bits, so there are 2^4 = 16 such gates. AND, OR, XOR, NAND and NOR are five of them.\n' +
            'NAND alone (or NOR alone) is UNIVERSAL: every one of the 16, and every bigger circuit, can be built from it.'},
        {title: 'A FULL ADDER', refs: ['nc2010 §3.1', 'knuth1997'], body:
            'Adding two bits a, b and a carry c from the place to the right:\n' +
            '  SUM   = a XOR b XOR c\n' +
            '  CARRY = (a AND b)\n' +
            '     OR (c AND (a XOR b))\n' +
            'Chain n full adders, each passing its carry left, and you add two n-bit numbers: a ripple-carry adder. Shor\'s algorithm runs reversible versions of exactly such circuits.'},
    ],
    reversible: [
        {title: 'LANDAUER IN NUMBERS', refs: ['landauer1961'], body:
            'Erasing one bit at temperature T dissipates at least\n' +
            '  k·T·LN 2\n' +
            'with k = 1.380649e-23 J/K. At room temperature (300 K) that is about 2.9e-21 joule: tiny, but a lower limit that no irreversible computer can beat.'},
        {title: 'BENNETT\'S TRICK', refs: ['bennett1973', 'nc2010 §3.2.5'], body:
            'To compute f(x) reversibly without leaving garbage:\n' +
            '  1. compute: x, 0, 0 → x, g, f(x)\n' +
            '  2. copy f(x) to a fresh register\n' +
            '  3. run step 1 backwards: g → 0\n' +
            'You keep x and f(x), and the scratch bits are clean again. Quantum oracles must do exactly this, or leftover garbage would spoil interference.'},
    ],

    // ---------------------------------------------------------------- world 2
    probability: [
        {title: 'HOW MANY SHOTS?', refs: ['grinstead1997 ch. 6'], body:
            'A result of probability p, in N shots, appears about N·p times, with a spread (standard deviation) of\n' +
            '  √(N·p·(1-p))\n' +
            'So the measured share has an error of about √(p(1-p)/N). For p = 0.5 and N = 1024 that is ±1.6%; to get ±0.5% you need 10,000 shots.'},
        {title: 'CONDITIONAL PROBABILITY', refs: ['grinstead1997 ch. 4'], body:
            'P(A given B) = P(A AND B) / P(B). It matters for readout: if a "1" is misread as "0" 2% of the time and a "0" as "1" 1% of the time, the counts you see are a mix you can correct for with this rule (Bayes).'},
    ],
    vectors: [
        {title: 'BASES', refs: ['strang2016 ch. 3', 'nc2010 §2.1.1'], body:
            'A BASIS is a set of vectors that are independent and reach every vector by mixing. In 2D any two non-parallel vectors are a basis.\n' +
            'The numbers you write for a vector depend on the basis: |+> is (1, 1)/√2 in the |0>, |1> basis but just (1, 0) in the |+>, |-> basis.'},
        {title: 'COMPLEX VECTORS', refs: ['strang2016 ch. 9'], body:
            'Quantum vectors have complex entries. Their length uses |z|^2, not z^2:\n' +
            '  ||(a, b)||^2 = |a|^2 + |b|^2\n' +
            'Otherwise (1, I) would have length 0. A qubit lives in C^2, the space of pairs of complex numbers.'},
    ],
    matrices: [
        {title: 'THE MULTIPLICATION RULE', refs: ['strang2016 ch. 2'], body:
            'Entry (i, j) of A·B is row i of A times column j of B:\n' +
            '  (AB)ij = SUM over k of Aik·Bkj\n' +
            'Example: X·Z = [0 -1; 1 0] while Z·X = [0 1; -1 0]: XZ = -ZX, the two gates ANTICOMMUTE.'},
        {title: 'EIGENVECTORS', refs: ['strang2016 ch. 6', 'nc2010 §2.1.5'], body:
            'An eigenvector v of A is only stretched: A·v = λ·v. The eigenvectors of Z are |0> (λ = +1) and |1> (λ = -1); those of X are |+> (+1) and |-> (-1).\n' +
            '>Measuring an observable always gives one of its eigenvalues.'},
    ],
    complex: [
        {title: 'POLAR FORM', refs: ['needham1997 ch. 1'], body:
            'z = r(COS θ + I SIN θ), with r = |z| and θ its angle. Then\n' +
            '  z1·z2: SIZES MULTIPLY, ANGLES ADD\n' +
            '  z*: SAME SIZE, ANGLE -θ\n' +
            '  1/z: SIZE 1/r, ANGLE -θ\n' +
            'Multiplication is a rotation plus a stretch, which is why complex numbers fit rotations so well.'},
        {title: 'ROOTS OF UNITY', refs: ['needham1997 ch. 1', 'nc2010 §5.1'], body:
            'The N solutions of z^N = 1 are e^(2πI·k/N), k = 0..N-1: N points evenly round the unit circle.\n' +
            'They add up to zero (for N > 1): their arrows cancel. That cancellation is exactly what makes the quantum Fourier transform pick out periods.'},
    ],
    euler: [
        {title: 'WHY EULER\'S FORMULA HOLDS', refs: ['needham1997 ch. 1'], body:
            'Write e^x as a power series and put x = Iθ:\n' +
            '  1 + Iθ - θ^2/2! - Iθ^3/3! + ...\n' +
            'The real terms are the series of COS θ and the imaginary terms that of SIN θ, so e^(Iθ) = COS θ + I SIN θ.'},
        {title: 'GLOBAL AND RELATIVE PHASE', refs: ['nc2010 §2.2.7'], body:
            'e^(Iγ)|ψ> and |ψ> give the same probabilities for every measurement: a GLOBAL phase is invisible.\n' +
            'In a|0> + e^(Iφ)b|1> the RELATIVE phase φ is real physics: an H before measuring turns it into different chances (|+> and |-> differ only by φ = π).'},
    ],
    inner: [
        {title: 'CAUCHY-SCHWARZ', refs: ['nc2010 §2.1.4'], body:
            'For any vectors\n' +
            '  |<a|b>|^2 ≤ <a|a>·<b|b>\n' +
            'with equality only when they are parallel. For unit states this gives |<k|ψ>|^2 ≤ 1: a probability can never exceed one.'},
        {title: 'OUTER PRODUCTS, PROJECTORS', refs: ['nc2010 §2.1.4', 'nc2010 §2.2.3'], body:
            '|a><b| is a matrix. P0 = |0><0| = [1 0; 0 0] PROJECTS onto |0>. The projectors of a basis add up to the identity:\n' +
            '  |0><0| + |1><1| = I\n' +
            'and the chance of result k is <ψ|Pk|ψ>.'},
    ],
    tensor: [
        {title: 'MATRICES SIDE BY SIDE', refs: ['nc2010 §2.1.7'], body:
            'A ⊗ B is the block matrix [a11·B a12·B; a21·B a22·B]. It acts on each part:\n' +
            '  (A⊗B)(|a>⊗|b>) = A|a> ⊗ B|b>\n' +
            'X ⊗ I flips the first (left) qubit; I ⊗ X the second. Order matters.'},
        {title: 'A TEST FOR ENTANGLEMENT', refs: ['nc2010 §2.5'], body:
            'Write a two-qubit state as a 2x2 grid M = [α00 α01; α10 α11]. It is a product state exactly when M has rank 1:\n' +
            '  α00·α11 - α01·α10 = 0\n' +
            'For the Bell state (|00> + |11>)/√2 it is 1/2: entangled. (The rank is the Schmidt number.)'},
    ],
    unitary: [
        {title: 'UNITARY = ROTATION', refs: ['nc2010 §2.2.2', 'strang2016 ch. 9'], body:
            'The columns of a unitary are orthonormal, and U keeps every inner product: <Ua|Ub> = <a|b>. Its eigenvalues lie on the unit circle, e^(Iθ).\n' +
            'Any unitary is U = e^(-IHt) for a Hermitian H: that is Schrödinger\'s equation, with H the Hamiltonian.'},
        {title: 'OBSERVABLES', refs: ['nc2010 §2.2.5'], body:
            'A Hermitian matrix A (A = A†) has real eigenvalues and orthogonal eigenvectors, so it can describe a measurement: the results are its eigenvalues and\n' +
            '  <A> = <ψ|A|ψ>\n' +
            'is the average result. X, Y and Z have eigenvalues +1 and -1.'},
    ],

    // ---------------------------------------------------------------- world 3
    qubit: [
        {title: 'TWO REAL NUMBERS', refs: ['nc2010 §1.2'], body:
            'α and β are two complex numbers, four real ones. Length 1 removes one, and the invisible global phase another: two real parameters are left, the angles θ and φ of the Bloch sphere.'},
        {title: 'INFINITE BUT HIDDEN', refs: ['nc2010 ch. 12'], body:
            'θ and φ can take infinitely many values, so is a qubit an infinite memory? No: one measurement yields one bit and destroys the rest. By Holevo\'s bound n qubits never deliver more than n classical bits.'},
    ],
    measure: [
        {title: 'PROJECTIVE MEASUREMENT', refs: ['nc2010 §2.2.5'], body:
            'A measurement is a set of projectors Pm adding up to I. Result m comes with probability\n' +
            '  p(m) = <ψ|Pm|ψ>\n' +
            'and leaves the state Pm|ψ> / √p(m). Measuring in the computational basis uses P0 = |0><0| and P1 = |1><1|.'},
        {title: 'RECONSTRUCTING A STATE', refs: ['nc2010 ch. 8'], body:
            'To learn an unknown qubit you need many copies and three kinds of measurement: in the Z, X and Y bases. Their averages are the Bloch coordinates (<X>, <Y>, <Z>).\n' +
            'This is quantum state TOMOGRAPHY; the number of measurements grows quickly with the number of qubits.'},
    ],
    xgate: [
        {title: 'THE PAULI MATRICES', refs: ['nc2010 §2.1.3', 'pauli1927'], body:
            '  X = [0 1; 1 0]  Y = [0 -I; I 0]\n' +
            '  Z = [1 0; 0 -1]\n' +
            'Each squares to I, each has eigenvalues ±1, and they multiply in a circle: XY = IZ, YZ = IX, ZX = IY. Any 2x2 Hermitian matrix is a real mix of I, X, Y and Z.'},
        {title: 'X AS A ROTATION', refs: ['nc2010 §4.2'], body:
            'RX(π) = -I·X. The factor -I is a global phase, so X IS a half turn of the Bloch sphere about the X axis. A pulse of half the length, RX(π/2), stops on the equator.'},
    ],
    hadamard: [
        {title: 'H IN OTHER WORDS', refs: ['nc2010 §4.2'], body:
            '  H = (X + Z)/√2\n' +
            'H is a half turn about the axis half way between X and Z, which swaps those two axes:\n' +
            '  H X H = Z    H Z H = X\n' +
            'and turns Y into -Y.'},
        {title: 'MANY HADAMARDS', refs: ['nc2010 §1.4.4'], body:
            'On n qubits:\n' +
            '  H|0..0> = SUM over x |x> / √2^n\n' +
            '  H|x> = SUM (-1)^(x·y) |y> / √2^n\n' +
            'where x·y counts the places where both have a 1. The second line is the engine of Deutsch-Jozsa, Bernstein-Vazirani and Simon.'},
    ],
    interference: [
        {title: 'AMPLITUDES ADD', refs: ['cleve1998'], body:
            'Two paths with amplitudes a1, a2 into the same result give\n' +
            '  P = |a1 + a2|^2\n' +
            '  = |a1|^2 + |a2|^2 + 2·RE(a1*·a2)\n' +
            'The last term is the interference: positive when the phases agree, negative (down to total cancellation) when they are opposite.'},
        {title: 'THE MACH-ZEHNDER LINK', refs: ['kok2007', 'nc2010 §1.3.1'], body:
            'H, a phase φ, H: the chance of ending in |1> is\n' +
            '  SIN^2(φ/2)\n' +
            'An optical Mach-Zehnder interferometer does the same with beam splitters and a delay. The OPTICS AND PHOTONS level builds one.'},
    ],
    phase: [
        {title: 'ONE FAMILY', refs: ['nc2010 §4.2'], body:
            'P(φ) = DIAG(1, e^(Iφ)) is the general phase gate:\n' +
            '  Z = P(π)  S = P(π/2)  T = P(π/4)\n' +
            'and RZ(φ) = e^(-Iφ/2)·P(φ) differs only by a global phase.'},
        {title: 'WHY T MATTERS', refs: ['nc2010 §10.5.4', 'nc2010 §4.5'], body:
            'H, S and CNOT (the CLIFFORD gates) are not enough: by the Gottesman-Knill theorem circuits of them can be simulated efficiently on an ordinary computer. Adding T makes the set universal, and that is where quantum computers can pull ahead.'},
    ],
    bloch: [
        {title: 'COORDINATES', refs: ['nc2010 §1.2'], body:
            'For COS(θ/2)|0> + e^(Iφ)SIN(θ/2)|1>:\n' +
            '  x = SIN θ COS φ\n' +
            '  y = SIN θ SIN φ\n' +
            '  z = COS θ\n' +
            'and these are the averages <X>, <Y>, <Z>.'},
        {title: 'ORTHOGONAL = OPPOSITE', refs: ['nc2010 §1.2'], body:
            'States at 90° in C^2 (orthogonal, perfectly distinguishable) sit at OPPOSITE points of the Bloch sphere: |0> and |1> at the poles, |+> and |-> across the equator. The half angle θ/2 in the formula is why.'},
    ],
    bases: [
        {title: 'ROTATION FORMULAS', refs: ['nc2010 §4.2'], body:
            'A turn by θ about the axis n = (nx, ny, nz):\n' +
            '  R(θ) = COS(θ/2)·I\n' +
            '       - I·SIN(θ/2)(nxX + nyY + nzZ)\n' +
            'RX, RY and RZ are the cases n = x, y, z.'},
        {title: 'Z-Y DECOMPOSITION', refs: ['nc2010 §4.2', 'qiskitdocs'], body:
            'Every one-qubit unitary can be written\n' +
            '  U = e^(Iα)·RZ(β)·RY(γ)·RZ(δ)\n' +
            '(Nielsen and Chuang, theorem 4.1). In the same spirit Qiskit\'s usual hardware basis has just RZ, SX = √X and X for one qubit, plus a two-qubit gate (see the QISKIT IN PRACTICE level).'},
    ],

    // ---------------------------------------------------------------- world 4
    two: [
        {title: 'HOW BIG IS THE STATE?', refs: ['nc2010 §1.2.1'], body:
            'n qubits: 2^n complex amplitudes, 2^(n+1) - 2 real parameters after normalization and global phase. Stored as 16-byte complex numbers, 50 qubits need 2^54 bytes: 16 pebibytes.'},
        {title: 'MEASURING ONE OF TWO', refs: ['nc2010 §1.2.1'], body:
            'Measure only q0 of α00|00> + α01|01> + α10|10> + α11|11>:\n' +
            '  P(Q0 = 0) = |α00|^2 + |α01|^2\n' +
            'and the state becomes (α00|00> + α01|01>) divided by the square root of that probability: the other qubit keeps its superposition.'},
    ],
    cnot: [
        {title: 'CNOT IN SYMBOLS', refs: ['nc2010 §1.3.2', 'nc2010 §4.3'], body:
            '  |x, y> → |x, y XOR x>\n' +
            '  CNOT = |0><0|⊗I + |1><1|⊗X\n' +
            'Hadamards on both qubits reverse its direction: (H⊗H)·CNOT·(H⊗H) is a CNOT with control and target swapped.'},
        {title: 'ANY CONTROLLED GATE', refs: ['nc2010 §4.3', 'barenco1995'], body:
            'Controlled-U = |0><0|⊗I + |1><1|⊗U. For any one-qubit U it can be built from two CNOTs and one-qubit gates (Barenco et al., 1995), which is one reason CNOT plus one-qubit gates is a universal set.'},
    ],
    bell: [
        {title: 'MEASURING IN THE BELL BASIS', refs: ['nc2010 §1.3.6'], body:
            'Run the Bell circuit backwards: CNOT, then H on the first qubit, then measure. Φ+, Ψ+, Φ- and Ψ- come out as 00, 01, 10 and 11. Teleportation and superdense coding both need this measurement.'},
        {title: 'ONE QUBIT OF A PAIR', refs: ['nc2010 §2.4'], body:
            'Tracing out one qubit of a Bell pair leaves the other in the density matrix I/2: completely random, with a Bloch arrow of length zero. All the information sits in the correlations, none in the parts.'},
    ],
    bell4: [
        {title: 'FROM ONE BELL TO ALL', refs: ['nc2010 §2.3'], body:
            'A Pauli gate on ONE qubit of Φ+ gives the others:\n' +
            '  X → Ψ+   Z → Φ-   ZX → Ψ-\n' +
            '(the last up to a sign).\n' +
            'Superdense coding is exactly this: Alice\'s choice of I, X, Z or ZX picks the Bell state.'},
        {title: 'CORRELATED IN EVERY BASIS', refs: ['nc2010 §2.6'], body:
            'Φ+ = (|00> + |11>)/√2 = (|++> + |-->)/√2: its qubits agree in the Z basis AND in the X basis.\n' +
            'The singlet Ψ- gives opposite results along every axis you choose. No classical pair of coins can do that.'},
    ],
    swap: [
        {title: 'WHY THREE CNOTS SWAP', refs: ['nc2010 §1.3.4'], body:
            'On basic states the three CNOTs do a ^= b, b ^= a, a ^= b, the classic swap of two numbers without a spare variable. Since gates are linear, what works on |00>, |01>, |10>, |11> works on every superposition.'},
        {title: 'SWAPS ON REAL CHIPS', refs: ['qiskit2024'], body:
            'Hardware usually connects each qubit only to a few neighbours. To act on two distant qubits a compiler inserts SWAPs to bring them together (ROUTING). Each SWAP costs three CNOTs, so a good layout matters.'},
    ],
    nocloning: [
        {title: 'THE PROOF', refs: ['wootters1982', 'nc2010 ch. 12'], body:
            'Suppose U|ψ>|0> = |ψ>|ψ> and U|φ>|0> = |φ>|φ>. Unitaries keep inner products, so\n' +
            '  <ψ|φ> = <ψ|φ>^2\n' +
            'which only 0 or 1 satisfy: a cloner can only copy states that are identical or orthogonal, never an unknown one.'},
        {title: 'WHAT IS ALLOWED', refs: ['wootters1982', 'bennett1993'], body:
            'Copying KNOWN or mutually orthogonal states is fine (that is classical copying). Imperfect, approximate cloning is possible. And teleportation MOVES a state without copying it: the original is destroyed.'},
    ],
    toffoli: [
        {title: 'TOFFOLI FROM SMALL GATES', refs: ['nc2010 §4.3'], body:
            'The Toffoli gate can be built from six CNOTs and single-qubit H, T and T† gates (Nielsen and Chuang, figure 4.9). Real hardware has no native three-qubit gate, so this decomposition, or a cheaper one, is what actually runs.'},
        {title: 'APPROXIMATING EVERYTHING', refs: ['nc2010 §4.5'], body:
            'H and T generate every one-qubit gate to any accuracy ε, and the SOLOVAY-KITAEV theorem says it only takes about LOG^c(1/ε) gates. Together with CNOT that makes {H, T, CNOT} a practical universal set.'},
    ],
    chsh: [
        {title: 'THE CHSH NUMBER', refs: ['chsh1969', 'tsirelson1980', 'nc2010 §2.6'], body:
            'With correlations E between ±1 results for settings (a, a\') and (b, b\'):\n' +
            '  S = E(a,b) + E(a,b\')\n' +
            '    + E(a\',b) - E(a\',b\')\n' +
            'Local hidden variables: |S| ≤ 2. A Bell pair with Alice measuring Z or X and Bob the two diagonals (Z+X)/√2 and (Z-X)/√2 gives 2√2, the maximum (Tsirelson).'},
        {title: 'LOOPHOLES', refs: ['hensen2015', 'aspect1982'], body:
            'Early tests left gaps: slow choice of settings (LOCALITY loophole) and missed detections (DETECTION loophole). Aspect et al. (1982) switched settings during the photons\' flight. Hensen et al. (2015) closed both gaps at once with electron spins 1.3 km apart.'},
    ],
});
