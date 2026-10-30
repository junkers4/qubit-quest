// World 3: one qubit: state vectors, measurement, X, H, interference, phase, the Bloch sphere,
// other bases and rotations.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.LEVELS.push(
    {
        id: 'qubit', world: 3, title: 'THE QUBIT', code: '13_qubit',
        refs: ['nc2010 §1.2', 'feynman1982', 'ibmbasics'],
        steps: [
            {type: 'text', title: 'WHY BOTHER?', body:
                'In 1982 Richard Feynman pointed out that ordinary computers seem to need exponential effort to simulate quantum physics, and suggested building computers out of quantum parts instead.\n' +
                'The basic part is the QUBIT, a quantum bit.',
            eli5: 'Nature itself does quantum things very fast. Feynman\'s idea: if a normal computer is too slow to copy nature, build a computer that works like nature.'},
            {type: 'text', title: 'KET ZERO, KET ONE', body:
                'A qubit has two basic states, |0> and |1> ("ket zero", "ket one"): the vectors (1, 0) and (0, 1). But it can also be any mix of them, a SUPERPOSITION:\n' +
                '  |ψ> = α|0> + β|1> = (α, β)\n' +
                'α and β are complex AMPLITUDES with\n' +
                '  |α|^2 + |β|^2 = 1',
            eli5: 'A bit is a switch that is off or on. A qubit is more like a dial with two numbers on it. Only when you look does it snap to off or on, with chances given by the two numbers.'},
            {type: 'text', title: 'REAL QUBITS', body:
                'Anything with two clean states can be a qubit: the polarization of a photon, the spin of an electron or a nucleus, two energy levels of a trapped ion, or a tiny superconducting circuit cooled close to absolute zero.\n' +
                'Each needs the qubits kept isolated, yet controllable. That is the hard part.',
            eli5: 'A qubit can be a single particle of light, a single atom, or a tiny cold electric loop. They are all very shy and easily disturbed.'},
            {type: 'quiz', q: 'Which of these is a valid qubit state?',
                options: ['0.5|0> + 0.5|1>', '0.6|0> + 0.8|1>', '|0> + |1>', '0.9|0> + 0.9|1>'], answer: 1,
                why: '0.36 + 0.64 = 1. The others add up to 0.5, 2 and 1.62, not 1.'},
        ],
    },
    {
        id: 'measure', world: 3, title: 'MEASUREMENT', code: '14_measure',
        refs: ['born1926', 'nc2010 §2.2.3', 'nc2010 §1.2'],
        steps: [
            {type: 'text', title: 'LOOKING CHANGES IT', body:
                'To read a qubit you MEASURE it. The BORN RULE (Max Born, 1926):\n' +
                '  P(0) = |α|^2    P(1) = |β|^2\n' +
                'After the measurement the qubit IS the result: it COLLAPSES to |0> or |1>. Measure it again and you get the same answer.\n' +
                '>Measurement is not reversible and not a gate.',
            eli5: 'Peeking at a qubit is like opening a box with a spinning coin inside: the coin falls to heads or tails the moment you look, and stays there.'},
            {type: 'text', title: 'SHOTS', body:
                'One measurement gives one bit. You cannot read α and β from a single run.\n' +
                'So quantum programs run a circuit many times, say 1024 SHOTS, and count: |+> gives roughly 512 zeros and 512 ones.\n' +
                'Amplitudes can be negative or complex. Probabilities never are.',
            eli5: 'One coin flip does not tell you if a coin is fair. Flip it a thousand times and count.'},
            {type: 'quiz', q: 'A qubit is 0.6|0> + 0.8|1>. What is the chance to measure 1?',
                options: ['0.8', '0.64', '0.36', '0.2'], answer: 1,
                why: '0.8^2 = 0.64. Check: 0.36 + 0.64 = 1.'},
            {type: 'quiz', q: 'You measured it and got 1. What is the qubit now?',
                options: ['STILL 0.6|0>+0.8|1>', '|1>', '|0>'], answer: 1,
                why: 'Measuring collapses the state. Measure again and you get 1 again.'},
            {type: 'quiz', q: 'The states |0> and −|0> differ only by a sign. Can any measurement tell them apart?',
                options: ['YES', 'NO'], answer: 1,
                why: 'A factor on the WHOLE state (a global phase) changes no probability. Signs matter only BETWEEN amplitudes.'},
        ],
    },
    {
        id: 'xgate', world: 3, title: 'THE X GATE', code: '15_xgate',
        refs: ['nc2010 §1.3.1', 'pauli1927'],
        steps: [
            {type: 'text', title: 'QUANTUM NOT', body:
                'The X gate (one of Pauli\'s matrices) is the quantum NOT. It swaps the two amplitudes:\n' +
                '  X = [0 1]\n' +
                '      [1 0]\n' +
                '  X(α|0> + β|1>) = β|0> + α|1>\n' +
                'In a circuit, time runs left to right along a wire. Every qubit starts in |0>.',
            eli5: 'X is the "flip" button. A 0 becomes a 1, a 1 becomes a 0, and a mix gets its two numbers swapped.'},
            {type: 'circuit', goal: 'TURN |0> INTO |1>.', qubits: 1, gates: ['X'], par: 1,
                solution: [['X', 0]], hint: 'Tap the X button to put an X on the wire.',
                eli5: 'Press X once. The arrow on the circle will flip from the top (0) to the bottom (1).'},
            {type: 'quiz', q: 'What does X applied twice do?',
                options: ['NOTHING CHANGES', 'ALWAYS GIVES |1>', 'MAKES A SUPERPOSITION'], answer: 0,
                why: 'X·X = I: a second swap undoes the first.'},
        ],
    },
    {
        id: 'hadamard', world: 3, title: 'SUPERPOSITION', code: '16_hadamard',
        refs: ['nc2010 §1.3.1'],
        steps: [
            {type: 'text', title: 'THE H GATE', body:
                'The Hadamard gate H makes an even superposition:\n' +
                '  H = 1/√2 [1  1]\n' +
                '           [1 −1]\n' +
                '  H|0> = (|0> + |1>)/√2 = |+>\n' +
                '  H|1> = (|0> − |1>)/√2 = |−>\n' +
                '1/√2 ≈ 0.71 and its square is 0.5: measuring |+> is a fair coin flip.',
            eli5: 'H is the "make it a coin" button. A definite 0 becomes a perfect 50/50 mix of 0 and 1.'},
            {type: 'circuit', goal: 'MAKE |+> FROM |0>.', qubits: 1, gates: ['H', 'X'], par: 1,
                solution: [['H', 0]], hint: 'One gate makes a superposition.',
                eli5: 'You want the arrow to point right, half way between 0 and 1. One button does that.'},
            {type: 'circuit', goal: 'MAKE |−> FROM |0>.', qubits: 1, gates: ['H', 'X'], par: 2,
                solution: [['X', 0], ['H', 0]], hint: 'H turns |1> into |−>. How do you get |1> first?',
                eli5: '|−> is the coin made from a 1 instead of a 0. Flip first, then make the coin.'},
            {type: 'quiz', q: '|+> and |−> both give 50/50 when measured. Are they the same state?',
                options: ['YES', 'NO, THE SIGN DIFFERS'], answer: 1,
                why: 'Same chances, different sign BETWEEN the amplitudes. The next level shows why that sign matters.'},
        ],
    },
    {
        id: 'interference', world: 3, title: 'INTERFERENCE', code: '17_interference',
        refs: ['cleve1998', 'nc2010 §1.3.1'],
        steps: [
            {type: 'text', title: 'H TWICE', body:
                'H H |0> = |0>. Why?\n' +
                'The first H splits |0> into |0> and |1>. The second H splits each of them again. The two paths that end in |1> carry +1/2 and −1/2 and CANCEL. The paths to |0> carry +1/2 and +1/2 and ADD UP to 1.\n' +
                '>This is INTERFERENCE. Every quantum algorithm is built on it.',
            eli5: 'Two water waves can meet top-on-top and make a big wave, or top-on-bottom and make flat water. Amplitudes do the same: the wrong answers can cancel out.'},
            {type: 'text', title: 'SEE IT', body:
                'Below: the circuit H, H. The state view shows each basic state, its amplitude and a bar for its chance.',
                demo: {qubits: 1, ops: [['H', 0], ['H', 0]]},
                eli5: 'Two coin-makers in a row give back exactly what you started with. The coin "un-flips".'},
            {type: 'quiz', q: 'What is H H |1> ?', options: ['|0>', '|1>', '|−>'], answer: 1,
                why: 'H undoes itself: H·H = I.'},
            {type: 'quiz', q: 'H|+> = |0>. What happened to the paths into |1>?',
                options: ['THEY ADDED UP', 'THEY CANCELLED'], answer: 1,
                why: '+1/2 and −1/2 meet in |1> and cancel to zero.'},
        ],
    },
    {
        id: 'phase', world: 3, title: 'PHASE: Z S T', code: '18_phase',
        refs: ['nc2010 §1.3.1', 'nc2010 §2.2.7', 'nc2010 §4.2'],
        steps: [
            {type: 'text', title: 'THE Z GATE', body:
                'Z keeps |0> and flips the sign of |1>:\n' +
                '  Z = [1  0]\n' +
                '      [0 −1]\n' +
                'So Z turns |+> into |−>. Measured right away you see no change: the chances stay the same. The change is in the RELATIVE PHASE, and an H can reveal it.',
            eli5: 'Z secretly turns the coin over without changing how it looks from above. Only the H trick shows the difference.'},
            {type: 'text', title: 'SMALLER TURNS', body:
                'S multiplies |1> by I = e^(Iπ/2), a quarter turn. T multiplies it by e^(Iπ/4), an eighth turn.\n' +
                '  S S = Z    T T = S\n' +
                'In the state view colour shows the phase:\n' +
                '  GREEN +  RED −  BLUE +I  GOLD −I\n' +
                'Purple means a phase in between, like after T.',
            eli5: 'Z is a half turn of the hidden arrow, S a quarter turn, T an eighth turn. The colours show which way each hidden arrow points.'},
            {type: 'circuit', goal: 'TURN |0> INTO |1>. THERE IS NO X GATE!', qubits: 1, gates: ['H', 'Z'], par: 3,
                solution: [['H', 0], ['Z', 0], ['H', 0]], hint: 'H, then flip the sign, then H again.',
                eli5: 'Make a coin, secretly turn it over, then un-make the coin. The un-making now lands on 1.'},
            {type: 'circuit', goal: 'MAKE |−> WITH ONLY H AND S.', qubits: 1, gates: ['H', 'S'], par: 3,
                solution: [['H', 0], ['S', 0], ['S', 0]], hint: 'Two quarter turns are a half turn: S S = Z.',
                eli5: 'Two quarter turns make a half turn.'},
        ],
    },
    {
        id: 'bloch', world: 3, title: 'THE BLOCH SPHERE', code: '19_bloch',
        refs: ['nc2010 §1.2', 'bloch1946'],
        steps: [
            {type: 'text', title: 'A QUBIT IS A POINT', body:
                'Up to a global phase every one-qubit state can be written with two angles:\n' +
                '  |ψ> = COS(θ/2)|0>\n' +
                '        + e^(Iφ)SIN(θ/2)|1>\n' +
                'θ and φ are a point on a ball, the BLOCH SPHERE (named after Felix Bloch). |0> is the north pole, |1> the south pole; |+>, |−>, |+I>, |−I> sit on the equator.',
            eli5: 'Every qubit state is a dot on a globe. North pole is 0, south pole is 1, and the equator is all the perfect coins.'},
            {type: 'text', title: 'GATES ARE TURNS', body:
                'Gates ROTATE the sphere. X turns it half way round the X axis, Z half way round the up-down axis, and H swaps the up-down axis with the X axis.\n' +
                'One-qubit puzzles show the sphere from the side: up |0>, down |1>, right |+>, left |−>. States like |+I> point straight at you and show as a dot in the middle.',
                demo: {qubits: 1, ops: [['H', 0]]},
                eli5: 'Each gate spins the globe. The puzzles show the globe from the side, so a dot pointing at you sits in the middle.'},
            {type: 'quiz', q: 'Where is |1> on the Bloch sphere?',
                options: ['NORTH POLE', 'SOUTH POLE', 'ON THE EQUATOR'], answer: 1,
                why: '|0> up, |1> down. The even superpositions are on the equator.'},
            {type: 'circuit', goal: 'POINT THE ARROW LEFT (|−>) WITHOUT X.', qubits: 1, gates: ['H', 'Z', 'S'], par: 2,
                solution: [['H', 0], ['Z', 0]], hint: 'Go to the equator first, then turn half way round.',
                eli5: 'First tip the arrow over to the right side, then spin the globe half way round so it points left.'},
        ],
    },
    {
        id: 'bases', world: 3, title: 'BASES AND ROTATIONS', code: '20_bases',
        refs: ['nc2010 §1.3.3', 'nc2010 §4.2'],
        steps: [
            {type: 'text', title: 'MEASURING ANOTHER WAY', body:
                'A normal measurement asks "|0> or |1>?" (the Z BASIS). To ask "|+> or |−>?" (the X BASIS), apply H first and then measure: H turns |+> into |0> and |−> into |1>.\n' +
                'For the Y basis |+I>, |−I> use S† then H.',
            eli5: 'The measuring machine only asks "up or down?". To ask "left or right?" you first turn the qubit so left-right becomes up-down.'},
            {type: 'text', title: 'ANY ANGLE', body:
                'RX(θ), RY(θ) and RZ(θ) turn the Bloch sphere by any angle θ about the X, Y or Z axis (see the GATE BOOK).\n' +
                'Every one-qubit gate is three such turns:\n' +
                '  U = e^(Iα)·RZ(β)·RY(γ)·RZ(δ)\n' +
                'Real hardware usually offers a few turns like these and builds everything else from them.',
            eli5: 'With three spins of the globe, about the right axes, you can move any dot to any place.'},
            {type: 'circuit', goal: 'THE QUBIT IS |−>. ADD ONE GATE SO A NORMAL MEASUREMENT READS 1.', qubits: 1,
                setup: [['X', 0], ['H', 0]], gates: ['H', 'X', 'Z'], par: 1,
                solution: [['H', 0]], hint: 'Measure in the X basis: H turns |−> into |1>.',
                eli5: 'The grey gates already made the arrow point left. Turn left-right into up-down.'},
            {type: 'circuit', goal: 'MAKE |+I> = (|0> + I|1>)/√2.', qubits: 1, gates: ['H', 'S', 'Z'], par: 2,
                solution: [['H', 0], ['S', 0]], hint: 'Make |+>, then a quarter turn.',
                eli5: 'Make a coin, then turn it a quarter so its arrow points at you.'},
            {type: 'circuit', goal: 'THE QUBIT IS |+I>. BRING IT BACK TO |0>.', qubits: 1,
                setup: [['H', 0], ['S', 0]], gates: ['H', 'S', 'SDG'], par: 2,
                solution: [['SDG', 0], ['H', 0]], hint: 'Undo in reverse order: S† undoes S, then H undoes H.',
                eli5: 'Taking off clothes goes in the reverse order of putting them on: the last one on comes off first.'},
        ],
    },
);
