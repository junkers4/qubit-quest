// All the levels. Each one follows the template in docs/LEVEL_TEMPLATE.md:
// a list of steps, each a 'text' page, a 'quiz' or a 'circuit' puzzle.
// Text is English; it is shown in upper case in the pixel font.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.WORLDS = [
    {id: 1, title: 'CLASSICAL WARM-UP'},
    {id: 2, title: 'ONE QUBIT'},
    {id: 3, title: 'TWO QUBITS'},
    {id: 4, title: 'QUANTUM TRICKS'},
];

QQ.LEVELS = [
    // ---------------------------------------------------------------- world 1
    {
        id: 'bits', world: 1, title: 'BITS',
        steps: [
            {type: 'text', title: 'WHAT IS A BIT?', body:
                'Every computer stores everything as bits. A bit is a tiny switch with exactly two states: 0 or 1.\n' +
                'Text, photos, music: all of it is long rows of zeros and ones.\n' +
                '>Eight bits make a byte.'},
            {type: 'text', title: 'MANY BITS', body:
                'One bit has 2 patterns: 0, 1.\nTwo bits have 4: 00, 01, 10, 11.\n' +
                'Each new bit doubles the count, so n bits have 2^n patterns.\n' +
                '>But a classical register holds only ONE of those patterns at a time. Remember this: quantum computers change it.'},
            {type: 'quiz', q: 'How many different patterns can 3 bits hold?',
                options: ['3', '6', '8', '9'], answer: 2,
                why: '2 x 2 x 2 = 8, from 000 to 111.'},
            {type: 'quiz', q: 'How many of those 8 patterns does a 3-bit register hold at one moment?',
                options: ['ONE', 'THREE', 'ALL EIGHT'], answer: 0,
                why: 'A classical register is always in exactly one pattern.'},
        ],
    },
    {
        id: 'gates', world: 1, title: 'LOGIC GATES',
        steps: [
            {type: 'text', title: 'GATES ARE RULES', body:
                'A gate turns input bits into output bits.\n' +
                '  NOT: 0 → 1, 1 → 0\n' +
                '  AND: 1 only if both inputs are 1\n' +
                '  XOR: 1 if the two inputs differ\n' +
                'Chain enough gates and you get a whole computer.'},
            {type: 'quiz', q: '1 XOR 1 = ?', options: ['0', '1'], answer: 0,
                why: 'XOR is 1 only when the inputs differ. 1 and 1 are the same.'},
            {type: 'text', title: 'UNDO', body:
                'NOT is REVERSIBLE: from the output you always know the input.\n' +
                'AND is not: an output of 0 can come from 00, 01 or 10. Information is lost.\n' +
                '>Quantum gates never lose information. Every quantum gate can be undone.'},
            {type: 'quiz', q: 'Which of these gates is reversible?',
                options: ['AND', 'OR', 'NOT'], answer: 2,
                why: 'Run NOT twice and you are back where you started.'},
        ],
    },

    // ---------------------------------------------------------------- world 2
    {
        id: 'qubit', world: 2, title: 'THE QUBIT',
        steps: [
            {type: 'text', title: 'KET ZERO, KET ONE', body:
                'A qubit is the quantum version of a bit. Its two basic states are written |0> and |1>. Say "ket zero" and "ket one".\n' +
                'But a qubit can also be in a mix of both, a SUPERPOSITION:\n' +
                '  a|0> + b|1>\n' +
                'The numbers a and b are called AMPLITUDES.'},
            {type: 'text', title: 'LOOKING AT A QUBIT', body:
                'To read a qubit you MEASURE it. You get 0 with probability |a|^2 and 1 with probability |b|^2.\n' +
                'The two chances must add up to one:\n' +
                '  |a|^2 + |b|^2 = 1\n' +
                '>Amplitudes can be negative, even complex. Probabilities never are.'},
            {type: 'quiz', q: 'A qubit is 0.6|0> + 0.8|1>. What is the chance to measure 1?',
                options: ['0.8', '0.64', '0.36', '0.2'], answer: 1,
                why: '0.8^2 = 0.64. Check: 0.36 + 0.64 = 1.'},
            {type: 'quiz', q: 'You measured it and got 1. What is the qubit now?',
                options: ['STILL 0.6|0>+0.8|1>', '|1>', '|0>'], answer: 1,
                why: 'Measuring COLLAPSES the state. Measure again and you get 1 again.'},
        ],
    },
    {
        id: 'xgate', world: 2, title: 'THE X GATE',
        steps: [
            {type: 'text', title: 'QUANTUM NOT', body:
                'The X gate is the quantum NOT. It swaps the two amplitudes:\n' +
                '  X|0> = |1>\n  X|1> = |0>\n' +
                '  X(a|0> + b|1>) = b|0> + a|1>\n' +
                'In a circuit time runs left to right along a wire. Every qubit starts in |0>.'},
            {type: 'circuit', goal: 'TURN |0> INTO |1>.', qubits: 1, gates: ['X'], par: 1,
                solution: [['X', 0]], hint: 'Tap the X button to put an X on the wire.'},
            {type: 'quiz', q: 'What does X applied twice do?',
                options: ['NOTHING CHANGES', 'ALWAYS GIVES |1>', 'MAKES A SUPERPOSITION'], answer: 0,
                why: 'X swaps the amplitudes, a second X swaps them back.'},
        ],
    },
    {
        id: 'hadamard', world: 2, title: 'SUPERPOSITION',
        steps: [
            {type: 'text', title: 'THE H GATE', body:
                'The Hadamard gate H makes an even superposition:\n' +
                '  H|0> = (|0> + |1>)/√2 = |+>\n' +
                '  H|1> = (|0> - |1>)/√2 = |->\n' +
                '1/√2 is about 0.71 and its square is 0.5: measuring |+> is a fair coin flip.'},
            {type: 'circuit', goal: 'MAKE |+> FROM |0>.', qubits: 1, gates: ['H', 'X'], par: 1,
                solution: [['H', 0]], hint: 'One gate makes a superposition.'},
            {type: 'circuit', goal: 'MAKE |-> FROM |0>.', qubits: 1, gates: ['H', 'X'], par: 2,
                solution: [['X', 0], ['H', 0]], hint: 'H turns |1> into |->. How do you get |1> first?'},
            {type: 'quiz', q: '|+> and |-> both give 50/50 when measured. Are they the same state?',
                options: ['YES', 'NO, THE SIGN DIFFERS'], answer: 1,
                why: 'Same chances, different sign of the |1> amplitude. The next level shows why the sign matters.'},
        ],
    },
    {
        id: 'interference', world: 2, title: 'INTERFERENCE',
        steps: [
            {type: 'text', title: 'H TWICE', body:
                'H H |0> = |0>. Why?\n' +
                'The first H splits |0> into |0> and |1>. The second H splits each of them again. The two paths that end in |1> have opposite signs and CANCEL. The paths to |0> ADD UP.\n' +
                '>This is INTERFERENCE. Amplitudes add and cancel like waves. Every quantum algorithm is built on it.'},
            {type: 'text', title: 'SEE IT', body:
                'Below: the circuit H, H. The state view shows each basic state, its amplitude and a bar for its chance.',
                demo: {qubits: 1, ops: [['H', 0], ['H', 0]]}},
            {type: 'quiz', q: 'What is H H |1> ?', options: ['|0>', '|1>', '|->'], answer: 1,
                why: 'H undoes itself: H H does nothing at all.'},
            {type: 'quiz', q: 'H|+> = |0>. What happened to the paths into |1>?',
                options: ['THEY ADDED UP', 'THEY CANCELLED'], answer: 1,
                why: '+1/2 and -1/2 meet in |1> and cancel to zero.'},
        ],
    },
    {
        id: 'phase', world: 2, title: 'PHASE: Z S T',
        steps: [
            {type: 'text', title: 'THE Z GATE', body:
                'Z leaves |0> alone and flips the sign of |1>:\n' +
                '  Z(a|0> + b|1>) = a|0> - b|1>\n' +
                'So Z turns |+> into |->. Measured straight away you see no change: the chances stay the same. The change is in the PHASE, and an H can reveal it.'},
            {type: 'text', title: 'SMALLER TURNS', body:
                'S multiplies |1> by i (a quarter turn). T is an eighth turn. S S = Z and T T = S.\n' +
                'In the state view colour shows the phase of an amplitude:\n' +
                '  GREEN +   RED -   BLUE +I   GOLD -I\n' +
                'Purple means a phase in between, like after T.'},
            {type: 'circuit', goal: 'TURN |0> INTO |1>. THERE IS NO X GATE!', qubits: 1, gates: ['H', 'Z'], par: 3,
                solution: [['H', 0], ['Z', 0], ['H', 0]], hint: 'H, then flip the sign, then H again.'},
            {type: 'circuit', goal: 'MAKE |-> WITH ONLY H AND S.', qubits: 1, gates: ['H', 'S'], par: 3,
                solution: [['H', 0], ['S', 0], ['S', 0]], hint: 'Two quarter turns are a half turn: S S = Z.'},
        ],
    },
    {
        id: 'bloch', world: 2, title: 'THE BLOCH SPHERE',
        steps: [
            {type: 'text', title: 'A QUBIT IS A POINT', body:
                'Every one-qubit state is a point on a sphere, the BLOCH SPHERE.\n' +
                '|0> is the north pole, |1> the south pole. |+> and |-> sit on the equator, on opposite sides.\n' +
                'Gates ROTATE the sphere: X turns it half way round the X axis, Z half way round the up-down axis.'},
            {type: 'text', title: 'IN THE PUZZLES', body:
                'One-qubit puzzles show the sphere from the side: up is |0>, down is |1>, right is |+>, left is |->.\n' +
                'States like |+I> point straight at you and show as a dot in the middle.',
                demo: {qubits: 1, ops: [['H', 0]]}},
            {type: 'quiz', q: 'Where is |1> on the Bloch sphere?',
                options: ['NORTH POLE', 'SOUTH POLE', 'ON THE EQUATOR'], answer: 1,
                why: '|0> up, |1> down. Superpositions are in between.'},
            {type: 'circuit', goal: 'POINT THE ARROW LEFT (|->) WITHOUT X.', qubits: 1, gates: ['H', 'Z', 'S'], par: 2,
                solution: [['H', 0], ['Z', 0]], hint: 'Go to the equator first, then turn half way round.'},
        ],
    },

    // ---------------------------------------------------------------- world 3
    {
        id: 'two', world: 3, title: 'TWO QUBITS',
        steps: [
            {type: 'text', title: 'FOUR AMPLITUDES', body:
                'Two qubits have four basic states: |00>, |01>, |10>, |11>. The left digit is the top wire, q0.\n' +
                'A two-qubit state has one amplitude for each of them.\n' +
                '>n qubits need 2^n amplitudes. 300 qubits would need more numbers than there are atoms in the visible universe.'},
            {type: 'quiz', q: 'How many amplitudes describe 3 qubits?',
                options: ['3', '6', '8', '9'], answer: 2, why: '2^3 = 8, one for each of |000> to |111>.'},
            {type: 'circuit', goal: 'MAKE |11>. TAP A WIRE TO CHOOSE IT.', qubits: 2, gates: ['X'], par: 2,
                solution: [['X', 0], ['X', 1]], hint: 'Each qubit needs its own X. Tap the Q1 label to pick the lower wire.'},
            {type: 'circuit', goal: 'MAKE ALL FOUR STATES EQUALLY LIKELY.', qubits: 2, gates: ['H', 'X'], par: 2,
                solution: [['H', 0], ['H', 1]], hint: 'A coin on each wire: (|0>+|1>)(|0>+|1>)/2.'},
        ],
    },
    {
        id: 'cnot', world: 3, title: 'CNOT',
        steps: [
            {type: 'text', title: 'CONTROLLED NOT', body:
                'CNOT has a CONTROL qubit (the dot) and a TARGET (the ⊕). It flips the target only when the control is 1:\n' +
                '  |00> → |00>   |01> → |01>\n' +
                '  |10> → |11>   |11> → |10>\n' +
                'It is the quantum XOR: the target becomes control XOR target.'},
            {type: 'quiz', q: 'CNOT with control q0 acts on |10>. The result is...',
                options: ['|10>', '|11>', '|01>'], answer: 1, why: 'The control is 1, so the target flips: 0 → 1.'},
            {type: 'circuit', goal: 'MAKE |11> WITH ONE X AND ONE CNOT.', qubits: 2, gates: ['X', 'CX'], limits: {X: 1}, par: 2,
                solution: [['X', 0], ['CX', 0, 1]], hint: 'Set the control to 1 first. CX puts the dot on the chosen wire.'},
        ],
    },
    {
        id: 'bell', world: 3, title: 'ENTANGLEMENT',
        steps: [
            {type: 'text', title: 'SPOOKY', body:
                'Put the control in superposition, then CNOT:\n' +
                '  H on q0: (|00> + |10>)/√2\n' +
                '  CNOT:    (|00> + |11>)/√2\n' +
                'This is a BELL STATE. The qubits are ENTANGLED: neither has a state of its own. Measure one and get 0, and the other is 0 too. Every time.'},
            {type: 'circuit', goal: 'MAKE THE BELL STATE (|00>+|11>)/√2.', qubits: 2, gates: ['H', 'X', 'CX'], par: 2,
                solution: [['H', 0], ['CX', 0, 1]], hint: 'H on the control, then CNOT.'},
            {type: 'quiz', q: 'In (|00>+|11>)/√2 you measure q0 and get 1. What will q1 give?',
                options: ['0', '1', '50/50'], answer: 1, why: 'Only |11> has q0 = 1, so q1 is 1 as well.'},
            {type: 'quiz', q: 'Can entanglement send a message faster than light?',
                options: ['YES', 'NO'], answer: 1,
                why: 'Each side alone sees random results. The link shows only when you compare notes, by normal slow messages.'},
        ],
    },
    {
        id: 'bell4', world: 3, title: 'ALL FOUR BELLS',
        steps: [
            {type: 'text', title: 'THE BELL FAMILY', body:
                'There are four Bell states:\n' +
                '  Φ+ = (|00> + |11>)/√2\n  Φ- = (|00> - |11>)/√2\n' +
                '  Ψ+ = (|01> + |10>)/√2\n  Ψ- = (|01> - |10>)/√2\n' +
                'All four are fully entangled. Build them!'},
            {type: 'circuit', goal: 'MAKE Φ- = (|00>-|11>)/√2.', qubits: 2, gates: ['H', 'X', 'Z', 'CX'], par: 3,
                solution: [['H', 0], ['Z', 0], ['CX', 0, 1]], hint: 'Make Φ+ and add a minus sign with Z.'},
            {type: 'circuit', goal: 'MAKE Ψ+ = (|01>+|10>)/√2.', qubits: 2, gates: ['H', 'X', 'Z', 'CX'], par: 3,
                solution: [['H', 0], ['X', 1], ['CX', 0, 1]], hint: 'Make Φ+, then flip one qubit.'},
            {type: 'circuit', goal: 'MAKE Ψ- = (|01>-|10>)/√2.', qubits: 2, gates: ['H', 'X', 'Z', 'CX'], par: 4,
                solution: [['H', 0], ['Z', 0], ['X', 1], ['CX', 0, 1]], hint: 'Ψ+ with a sign flip.'},
        ],
    },
    {
        id: 'swap', world: 3, title: 'SWAP',
        steps: [
            {type: 'text', title: 'CNOT BOTH WAYS', body:
                'A CNOT can point either way: control on q0 and target on q1, or the other way round.\n' +
                'Three CNOTs that alternate direction SWAP two qubits, whatever state they are in.\n' +
                'The grey gates at the start are fixed. They prepare a state for you.'},
            {type: 'circuit', goal: 'SWAP THE TWO QUBITS. ONLY CNOTS!', qubits: 2,
                setup: [['H', 0], ['T', 0], ['X', 1]], gates: ['CX'], par: 3,
                solution: [['CX', 0, 1], ['CX', 1, 0], ['CX', 0, 1]],
                hint: 'Control top, then control bottom, then control top again.'},
        ],
    },

    // ---------------------------------------------------------------- world 4
    {
        id: 'kickback', world: 4, title: 'PHASE KICKBACK',
        steps: [
            {type: 'text', title: 'THE TARGET KICKS BACK', body:
                'Flip |-> and you get -|->: only a minus sign. So when a CNOT targets a qubit in |->, the minus sign lands on the CONTROL instead:\n' +
                '  CNOT |+>|-> = |->|->\n' +
                '>The control changed and the target did not. This trick is the heart of many algorithms.'},
            {type: 'circuit', goal: 'Q0 IS |+>, Q1 IS |->. TURN Q0 INTO |1>. NO X!', qubits: 2,
                setup: [['H', 0], ['X', 1], ['H', 1]], gates: ['H', 'CX'], par: 2,
                solution: [['CX', 0, 1], ['H', 0]], hint: 'Kick a minus sign onto q0, then let H turn |-> into |1>.'},
        ],
    },
    {
        id: 'deutsch', world: 4, title: 'DEUTSCH',
        steps: [
            {type: 'text', title: 'ONE QUESTION', body:
                'A black box f takes one bit and gives one bit. It is CONSTANT (f(0) = f(1)) or BALANCED (f(0) ≠ f(1)).\n' +
                'A classical computer must ask the box twice to tell which.\n' +
                '>A quantum computer needs ONE question. This was the first quantum algorithm, by David Deutsch, 1985.'},
            {type: 'text', title: 'THE RECIPE', body:
                'Start in |0>|1>. H on both. Ask the box once. H on q0. Measure q0:\n' +
                '  0 = CONSTANT   1 = BALANCED\n' +
                'The box F adds f(x) into q1, which is |->. By phase kickback the answer lands in the phase of q0, and the last H turns that phase into a bit.'},
            {type: 'circuit', goal: 'THIS BOX F IS BALANCED (F(X) = X). RUN DEUTSCH SO Q0 ENDS IN |1>.', qubits: 2,
                setup: [['X', 1]], gates: ['H', 'F'], limits: {F: 1}, par: 4,
                solution: [['H', 0], ['H', 1], ['F', 0, 1], ['H', 0]], hint: 'H on both, the box F once, then H on q0.'},
            {type: 'quiz', q: 'You run Deutsch and q0 measures 0. The box is...',
                options: ['CONSTANT', 'BALANCED'], answer: 0, why: 'No minus sign kicked back, so the last H brings q0 home to |0>.'},
        ],
    },
    {
        id: 'grover', world: 4, title: 'GROVER SEARCH',
        steps: [
            {type: 'text', title: 'FINDING A NEEDLE', body:
                'Grover\'s algorithm finds a marked item among N in about √N steps, not N.\n' +
                'Start with all items equally likely. The ORACLE flips the sign of the marked one. The DIFFUSER flips every amplitude around the average, and the marked one grows.\n' +
                '>With 4 items one round is enough.'},
            {type: 'text', title: 'THE DIFFUSER', body:
                'For two qubits the diffuser is:\n' +
                '  H H, Z Z, CZ, H H\n' +
                'CZ flips the sign of |11> only. Here the oracle is also a CZ: it marks |11>.'},
            {type: 'circuit', goal: 'THE ORACLE MARKED |11>. BUILD THE DIFFUSER AND FIND IT.', qubits: 2,
                setup: [['H', 0], ['H', 1], ['CZ', 0, 1]], gates: ['H', 'Z', 'X', 'CZ'], par: 5,
                solution: [['H', 0], ['H', 1], ['Z', 0], ['Z', 1], ['CZ', 0, 1], ['H', 0], ['H', 1]],
                hint: 'The diffuser from the lesson works (7 gates). For three stars: the H H at its start does nothing here...'},
            {type: 'quiz', q: 'Searching 1,000,000 items, Grover needs about how many oracle calls?',
                options: ['1,000,000', '500,000', '1,000', '20'], answer: 2, why: '√1,000,000 = 1,000 (Grover: about 0.8 x √N).'},
        ],
    },
    {
        id: 'beyond', world: 4, title: 'WHAT NEXT',
        steps: [
            {type: 'text', title: 'YOU MADE IT', body:
                'You know qubits, superposition, phase, interference, entanglement, kickback, and two real algorithms.\n' +
                'Big ideas to explore next:\n' +
                '  TELEPORTATION: move a state with a Bell pair and two bits\n' +
                '  SHOR: factoring large numbers fast\n' +
                '  ERROR CORRECTION: keeping qubits alive'},
            {type: 'text', title: 'REAL HARDWARE', body:
                'Try real quantum computers for free with Qiskit (IBM Quantum), Cirq (Google) or Amazon Braket. The circuits look just like the ones here.\n' +
                '>Keep playing: replay levels to get all three stars.'},
            {type: 'quiz', q: 'Which effect lets wrong answers cancel and right ones grow?',
                options: ['MEASUREMENT', 'INTERFERENCE', 'CLONING'], answer: 1,
                why: 'Interference. (And cloning an unknown qubit is impossible: the no-cloning theorem.)'},
        ],
    },
];

if (typeof module !== 'undefined')
    module.exports = QQ;
