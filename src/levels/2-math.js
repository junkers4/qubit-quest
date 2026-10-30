// World 2: the math a quantum computer runs on: probability, vectors, matrices,
// complex numbers, Euler's formula, inner products, tensor products, unitary matrices.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.LEVELS.push(
    {
        id: 'probability', world: 2, title: 'PROBABILITY', code: '05_probability',
        refs: ['grinstead1997 ch. 1'],
        steps: [
            {type: 'text', title: 'CHANCES', body:
                'A probability is a number from 0 (never) to 1 (always). A fair coin gives heads with probability 1/2 = 0.5.\n' +
                'The chances of ALL possible results add up to exactly 1. So the chance that something does NOT happen is 1 minus the chance that it does.',
            eli5: 'Probability is "how sure". 0 means no way, 1 means certainly, 0.5 means a coin flip. All the possible answers share one whole pie between them.'},
            {type: 'text', title: 'AND, AND MANY TRIES', body:
                'For two INDEPENDENT events the chance that both happen is the product:\n' +
                '  P(A AND B) = P(A) x P(B)\n' +
                'Run an experiment many times and the share of each result gets close to its probability (the law of large numbers).\n' +
                '>A quantum computer runs a circuit many times (SHOTS) and counts results, exactly like this.',
            eli5: 'Two coins both landing heads: half of a half, so one in four. And if you flip a coin a thousand times you get close to 500 heads.'},
            {type: 'quiz', q: 'Two fair coins. What is the chance that both show heads?',
                options: ['1/2', '1/3', '1/4', '1'], answer: 2,
                why: '1/2 x 1/2 = 1/4: the four equally likely results are HH, HT, TH, TT.'},
            {type: 'quiz', q: 'A die. What is the chance of NOT rolling a 6?',
                options: ['1/6', '5/6', '1/2', '6/5'], answer: 1,
                why: '1 - 1/6 = 5/6.'},
            {type: 'quiz', q: 'A result has probability 0.25. In 1000 shots you expect it about...',
                options: ['25 TIMES', '250 TIMES', '500 TIMES', 'EXACTLY 250 TIMES'], answer: 1,
                why: '0.25 x 1000 = 250, give or take some random spread. Exactly 250 is not guaranteed.'},
        ],
    },
    {
        id: 'vectors', world: 2, title: 'VECTORS', code: '06_vectors',
        refs: ['strang2016 ch. 1'],
        steps: [
            {type: 'text', title: 'A LIST OF NUMBERS', body:
                'A vector is a list of numbers, written as a column. In 2D it is an arrow: v = (3, 4) goes 3 right and 4 up.\n' +
                'Add vectors number by number, and scale them by multiplying every number:\n' +
                '  (1, 2) + (3, 0) = (4, 2)\n' +
                '  2 x (1, 2) = (2, 4)',
            eli5: 'A vector is a treasure-map instruction: "3 steps east, 4 steps north". Adding two instructions means doing one after the other.'},
            {type: 'text', title: 'LENGTH AND BASIS', body:
                'The length of (a, b) is √(a^2 + b^2), by Pythagoras. (3, 4) has length 5. A vector of length 1 is a UNIT vector.\n' +
                'Every 2D vector is a mix of the two basis vectors e0 = (1, 0) and e1 = (0, 1):\n' +
                '  (a, b) = a·e0 + b·e1\n' +
                '>Soon e0 will be called |0> and e1 will be |1>.',
            eli5: 'Any arrow on paper is "some amount of east plus some amount of north". East and north are the two basic directions.'},
            {type: 'quiz', q: 'What is the length of the vector (0.6, 0.8)?',
                options: ['1.4', '1', '0.7', '0.48'], answer: 1,
                why: '√(0.36 + 0.64) = √1 = 1. It is a unit vector, just like a qubit state must be.'},
            {type: 'quiz', q: '(2, 1) + (−1, 3) = ?',
                options: ['(1, 4)', '(3, −2)', '(−2, 3)', '(1, 2)'], answer: 0,
                why: '2 + (−1) = 1 and 1 + 3 = 4.'},
        ],
    },
    {
        id: 'matrices', world: 2, title: 'MATRICES', code: '07_matrices',
        refs: ['strang2016 ch. 2', 'nc2010 §2.1.2'],
        steps: [
            {type: 'text', title: 'A MATRIX MOVES VECTORS', body:
                'A matrix is a grid of numbers. Multiplying it by a vector gives a new vector: each row times the vector, number by number, added up.\n' +
                '  [0 1] (a)   (b)\n' +
                '  [1 0] (b) = (a)\n' +
                'This matrix swaps the two numbers. It will be the quantum NOT gate, X.',
            eli5: 'A matrix is a recipe that turns one list of numbers into another. This one just says "swap the first and the second".'},
            {type: 'text', title: 'ONE AFTER ANOTHER', body:
                'Doing matrix B and then matrix A is the single matrix A·B. The RIGHT one acts first, because it stands next to the vector:\n' +
                '  A·B·v = A·(B·v)\n' +
                'Order matters: A·B is usually not B·A. The IDENTITY I = [1 0; 0 1] changes nothing.',
            eli5: 'Putting on socks and then shoes is not the same as shoes and then socks. Matrices are like that too.'},
            {type: 'quiz', q: '[2 0; 0 3] times (1, 1) = ?',
                options: ['(2, 3)', '(3, 2)', '(5, 5)', '(2, 0)'], answer: 0,
                why: 'Row 1: 2x1 + 0x1 = 2. Row 2: 0x1 + 3x1 = 3.'},
            {type: 'quiz', q: 'In A·B·v, which matrix acts on v first?',
                options: ['A', 'B', 'BOTH AT ONCE'], answer: 1,
                why: 'B stands next to v, so B·v comes first, then A acts on the result. Circuits are drawn the other way round: left to right in time.'},
        ],
    },
    {
        id: 'complex', world: 2, title: 'COMPLEX NUMBERS', code: '08_complex',
        refs: ['needham1997 ch. 1', 'nc2010 §2.1'],
        steps: [
            {type: 'text', title: 'THE NUMBER I', body:
                'There is no ordinary number whose square is −1, so we add one: I, with I^2 = −1.\n' +
                'A complex number is z = a + bI: a real part a and an imaginary part b. Draw it as the point (a, b) on a plane.\n' +
                '  (1 + 2I) + (3 − I) = 4 + I\n' +
                '  (a+bI)(c+dI) = (ac−bd) + (ad+bc)I',
            eli5: 'Normal numbers live on a line. Complex numbers live on a whole flat map: one direction is the normal numbers, the other is the new I direction.'},
            {type: 'text', title: 'SIZE AND MIRROR', body:
                'The CONJUGATE of z = a + bI is z* = a − bI, its mirror image.\n' +
                'The size (modulus) of z is |z| = √(a^2 + b^2), its distance from 0. And z·z* = a^2 + b^2 = |z|^2 is always a real number ≥ 0.\n' +
                '>Quantum amplitudes are complex numbers. Their squared size |z|^2 is a probability.',
            eli5: 'Every complex number is a dot on the map. Its size is how far the dot is from the middle. Size squared will tell us how likely things are.'},
            {type: 'quiz', q: 'What is |3 + 4I| ?', options: ['7', '5', '25', '1'], answer: 1,
                why: '√(9 + 16) = √25 = 5.'},
            {type: 'quiz', q: 'I x I x I x I = ?', options: ['1', '−1', 'I', '−I'], answer: 0,
                why: 'I x I = −1, and (−1) x (−1) = 1.'},
            {type: 'quiz', q: '(1 + I)(1 − I) = ?', options: ['0', '2', '2I', '1 − I'], answer: 1,
                why: '1 − I + I − I^2 = 1 + 1 = 2. A number times its conjugate is its size squared: |1 + I|^2 = 2.'},
        ],
    },
    {
        id: 'euler', world: 2, title: 'PHASE AND EULER', code: '09_euler',
        refs: ['needham1997 ch. 1', 'nc2010 §2.2.7'],
        steps: [
            {type: 'text', title: 'ARROWS THAT TURN', body:
                'Any complex number is a length r and an angle θ (the PHASE):\n' +
                '  z = r·e^(Iθ)\n' +
                '  e^(Iθ) = COS θ + I·SIN θ\n' +
                'That is Euler\'s formula. e^(Iθ) is a point on the circle of radius 1. Angles are in radians: π = half a turn.',
            eli5: 'Think of a clock hand of length 1. e^(Iθ) is where the tip points after turning by the angle θ.'},
            {type: 'text', title: 'MULTIPLYING TURNS', body:
                'Multiplying complex numbers multiplies lengths and ADDS angles:\n' +
                '  e^(Ia)·e^(Ib) = e^(I(a+b))\n' +
                '  I = e^(Iπ/2)    −1 = e^(Iπ)\n' +
                '|e^(Iθ)| = 1 for every θ, so multiplying an amplitude by a phase never changes its probability.\n' +
                '>But phases change how amplitudes ADD, and that is where quantum computing gets its power.',
            eli5: 'Turning a clock hand does not make it longer. So a phase does not change how likely a result is on its own. It only matters when two hands are added together.'},
            {type: 'quiz', q: 'e^(Iπ) = ?', options: ['1', '−1', 'I', '0'], answer: 1,
                why: 'COS π + I·SIN π = −1 + 0 = −1. Half a turn points the other way.'},
            {type: 'quiz', q: 'e^(Iπ/2) x e^(Iπ/2) = ?', options: ['I', '−1', '1', 'π'], answer: 1,
                why: 'Angles add: π/2 + π/2 = π, and e^(Iπ) = −1. Check: I x I = −1.'},
            {type: 'quiz', q: 'An amplitude a is multiplied by e^(Iθ). Its probability |a|^2...',
                options: ['GROWS', 'SHRINKS', 'STAYS THE SAME'], answer: 2,
                why: '|e^(Iθ)·a|^2 = |e^(Iθ)|^2·|a|^2 = |a|^2.'},
        ],
    },
    {
        id: 'inner', world: 2, title: 'INNER PRODUCTS', code: '10_inner',
        refs: ['nc2010 §2.1.4', 'dirac1939', 'strang2016 ch. 1'],
        steps: [
            {type: 'text', title: 'BRA AND KET', body:
                'Dirac\'s notation: a column vector is a KET |a>. Its conjugate transpose, a row with every number conjugated, is a BRA <a|.\n' +
                'Bra times ket is the INNER PRODUCT, one number:\n' +
                '  <a|b> = a0*·b0 + a1*·b1 + ...\n' +
                'For real vectors it is the usual dot product.',
            eli5: 'The inner product measures how much two arrows point the same way. Same way: big. At right angles: zero.'},
            {type: 'text', title: 'LENGTH AND OVERLAP', body:
                '<a|a> is the length squared. A quantum state always has <ψ|ψ> = 1.\n' +
                'If <a|b> = 0 the vectors are ORTHOGONAL: in quantum terms, perfectly distinguishable.\n' +
                '  <0|1> = 0    <+|−> = 0\n' +
                '>The chance to find state |ψ> as |k> is |<k|ψ>|^2.',
            eli5: 'Two states at right angles can always be told apart, like north and east. The overlap squared is the chance one looks like the other.'},
            {type: 'quiz', q: '|0> = (1, 0) and |1> = (0, 1). What is <0|1> ?',
                options: ['1', '0', '−1', '1/2'], answer: 1,
                why: '1x0 + 0x1 = 0. They are orthogonal.'},
            {type: 'quiz', q: '|+> = (1, 1)/√2. What is |<0|+>|^2 ?',
                options: ['1', '1/2', '1/√2', '0'], answer: 1,
                why: '<0|+> = 1/√2, squared is 1/2: measuring |+> gives 0 half of the time.'},
        ],
    },
    {
        id: 'tensor', world: 2, title: 'TENSOR PRODUCTS', code: '11_tensor',
        refs: ['nc2010 §2.1.7', 'nc2010 §2.2.8'],
        steps: [
            {type: 'text', title: 'PUTTING SYSTEMS TOGETHER', body:
                'Two separate systems combine by the tensor product ⊗: every number of the first times every number of the second.\n' +
                '  (a, b) ⊗ (c, d) = (ac, ad, bc, bd)\n' +
                '  |0> ⊗ |1> = (0, 1, 0, 0) = |01>\n' +
                'Sizes multiply: n qubits need 2^n numbers.',
            eli5: 'If one coin can be H or T and another can be H or T, together they can be HH, HT, TH, TT. The tensor product makes that list of combinations.'},
            {type: 'text', title: 'NOT EVERYTHING SPLITS', body:
                'Some two-qubit vectors are NOT a product of two one-qubit vectors:\n' +
                '  (1, 0, 0, 1)/√2\n' +
                'A product would need ac and bd nonzero but ad = 0: impossible. Such states are ENTANGLED.\n' +
                'Matrices combine the same way: X ⊗ I flips the first qubit and leaves the second alone.',
            eli5: 'Usually you can describe two things one by one. Entangled things are a team: you can only describe them together.'},
            {type: 'quiz', q: '|1> ⊗ |0> = ?',
                options: ['(0, 1, 0, 0)', '(0, 0, 1, 0)', '(1, 0, 0, 0)', '(0, 0, 0, 1)'], answer: 1,
                why: '(0, 1) ⊗ (1, 0) = (0x1, 0x0, 1x1, 1x0) = (0, 0, 1, 0), which is |10>.'},
            {type: 'quiz', q: 'How many numbers describe a 10-qubit state?',
                options: ['10', '20', '100', '1024'], answer: 3,
                why: '2^10 = 1024 amplitudes.'},
        ],
    },
    {
        id: 'unitary', world: 2, title: 'UNITARY MATRICES', code: '12_unitary',
        refs: ['nc2010 §2.1.6', 'nc2010 §2.2.2', 'strang2016 ch. 9'],
        steps: [
            {type: 'text', title: 'GATES KEEP LENGTH', body:
                'The CONJUGATE TRANSPOSE U† flips a matrix over its diagonal and conjugates every number.\n' +
                'U is UNITARY when U†·U = I. Then U keeps every length: a unit vector stays a unit vector, so the probabilities still add up to 1.\n' +
                '>Quantum mechanics says an isolated system changes by a unitary matrix. Every quantum gate is one.',
            eli5: 'A unitary matrix turns and mirrors arrows but never stretches or squashes them. That keeps the whole pie of chances exactly one pie.'},
            {type: 'text', title: 'ALWAYS UNDOABLE', body:
                'If U†·U = I then U† undoes U. So every quantum gate can be reversed, just like Toffoli\'s gate.\n' +
                'Examples: X, Z and H are their own inverses (X·X = I). For S, the inverse is S†.\n' +
                'A matrix with U = U† is HERMITIAN. X, Y, Z and H are both Hermitian and unitary.',
            eli5: 'Every quantum move has an "undo" button: the same move played backwards.'},
            {type: 'quiz', q: 'Is the matrix [1 0; 0 2] unitary?',
                options: ['YES', 'NO'], answer: 1,
                why: 'It doubles the length of (0, 1). Unitary matrices never change lengths.'},
            {type: 'quiz', q: 'What undoes the Hadamard gate H?',
                options: ['H ITSELF', 'X', 'NOTHING CAN', 'MEASURING'], answer: 0,
                why: 'H·H = I. Measuring does not undo anything: it is not reversible.'},
        ],
    },
);
