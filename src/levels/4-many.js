// World 4: two and three qubits: product states, CNOT, entanglement, Bell states, SWAP,
// no-cloning, the Toffoli gate and universality, Bell's theorem.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.LEVELS.push(
    {
        id: 'two', world: 4, title: 'TWO QUBITS', code: '21_two',
        refs: ['nc2010 §1.2.1', 'nc2010 §2.1.7'],
        steps: [
            {type: 'text', title: 'FOUR AMPLITUDES', body:
                'Two qubits have four basic states |00>, |01>, |10>, |11>, and a state has one amplitude for each:\n' +
                '  α00|00> + α01|01>\n' +
                '  + α10|10> + α11|11>\n' +
                'The left digit is the top wire, q0. Separate qubits combine by the tensor product: |1> ⊗ |0> = |10>.',
            eli5: 'With two coins there are four ways they can land. A two-qubit state keeps one number for each of the four ways.'},
            {type: 'text', title: 'EXPONENTIAL', body:
                'n qubits need 2^n amplitudes. 50 qubits already need about 10^15 numbers; 300 qubits would need more numbers than there are atoms in the visible universe.\n' +
                '>This is why simulating quantum computers on ordinary ones gets so hard so fast.',
            eli5: 'Every new qubit doubles the size of the list. Double 300 times and the list is bigger than the universe.'},
            {type: 'quiz', q: 'How many amplitudes describe 3 qubits?',
                options: ['3', '6', '8', '9'], answer: 2, why: '2^3 = 8, one for each of |000> to |111>.'},
            {type: 'circuit', goal: 'MAKE |11>. TAP A WIRE TO CHOOSE IT.', qubits: 2, gates: ['X'], par: 2,
                solution: [['X', 0], ['X', 1]], hint: 'Each qubit needs its own X. Tap the Q1 label to pick the lower wire.',
                eli5: 'Flip the top qubit, then choose the lower wire and flip that one too.'},
            {type: 'circuit', goal: 'MAKE ALL FOUR STATES EQUALLY LIKELY.', qubits: 2, gates: ['H', 'X'], par: 2,
                solution: [['H', 0], ['H', 1]], hint: 'A coin on each wire: (|0>+|1>)(|0>+|1>)/2.',
                eli5: 'Turn each qubit into a coin. Two coins: four results, each one in four.'},
        ],
    },
    {
        id: 'cnot', world: 4, title: 'CNOT', code: '22_cnot',
        refs: ['nc2010 §1.3.2', 'barenco1995'],
        steps: [
            {type: 'text', title: 'CONTROLLED NOT', body:
                'CNOT has a CONTROL qubit (the dot) and a TARGET (the ⊕). It flips the target only when the control is 1:\n' +
                '  |00> → |00>   |01> → |01>\n' +
                '  |10> → |11>   |11> → |10>\n' +
                'It is a reversible XOR: the target becomes control XOR target. As a matrix it swaps the last two amplitudes.',
            eli5: 'CNOT is a flip button with a guard. The guard (control) lets the flip happen only if the guard is 1.'},
            {type: 'quiz', q: 'CNOT with control q0 acts on |10>. The result is...',
                options: ['|10>', '|11>', '|01>'], answer: 1, why: 'The control is 1, so the target flips: 0 → 1.'},
            {type: 'circuit', goal: 'MAKE |11> WITH ONE X AND ONE CNOT.', qubits: 2, gates: ['X', 'CX'], limits: {X: 1}, par: 2,
                solution: [['X', 0], ['CX', 0, 1]], hint: 'Set the control to 1 first. CNOT puts its dot on the chosen wire.',
                eli5: 'Make the guard 1 first. Then the guarded flip happens.'},
        ],
    },
    {
        id: 'bell', world: 4, title: 'ENTANGLEMENT', code: '23_bell',
        refs: ['nc2010 §1.3.6', 'epr1935'],
        steps: [
            {type: 'text', title: 'SPOOKY', body:
                'Put the control in superposition, then CNOT:\n' +
                '  H on q0: (|00> + |10>)/√2\n' +
                '  CNOT:    (|00> + |11>)/√2\n' +
                'This is a BELL STATE. It is not a product of two one-qubit states: the qubits are ENTANGLED. Measure one and get 0, and the other is 0 too. Every time, however far apart they are.',
            eli5: 'Make two magic coins that always land the same way. Each coin alone is random, but the two always match.'},
            {type: 'text', title: 'EINSTEIN\'S WORRY', body:
                'In 1935 Einstein, Podolsky and Rosen (EPR) argued that such correlations mean quantum mechanics is incomplete: surely the results were fixed in advance.\n' +
                'Bell (1964) showed this can be TESTED, and experiments side with quantum mechanics. More in the BELL TEST level.',
            eli5: 'Einstein thought the coins must have secretly agreed beforehand. Later experiments showed that no such secret plan can explain the results.'},
            {type: 'circuit', goal: 'MAKE THE BELL STATE (|00>+|11>)/√2.', qubits: 2, gates: ['H', 'X', 'CX'], par: 2,
                solution: [['H', 0], ['CX', 0, 1]], hint: 'H on the control, then CNOT.',
                eli5: 'Make the top qubit a coin, then let it control a flip of the bottom one.'},
            {type: 'quiz', q: 'In (|00>+|11>)/√2 you measure q0 and get 1. What will q1 give?',
                options: ['0', '1', '50/50'], answer: 1, why: 'Only |11> has q0 = 1, so q1 is 1 as well.'},
            {type: 'quiz', q: 'Can entanglement send a message faster than light?',
                options: ['YES', 'NO'], answer: 1,
                why: 'Each side alone sees random results. The link shows only when you compare notes, by ordinary slower messages.'},
        ],
    },
    {
        id: 'bell4', world: 4, title: 'ALL FOUR BELLS', code: '24_bell4',
        refs: ['nc2010 §1.3.6'],
        steps: [
            {type: 'text', title: 'THE BELL FAMILY', body:
                'There are four Bell states:\n' +
                '  Φ+ = (|00> + |11>)/√2\n  Φ− = (|00> − |11>)/√2\n' +
                '  Ψ+ = (|01> + |10>)/√2\n  Ψ− = (|01> − |10>)/√2\n' +
                'They are orthogonal, so one measurement in the BELL BASIS can tell them apart. All four are fully entangled.',
            eli5: 'There are four kinds of magic coin pairs: always same, always same with a twist, always opposite, always opposite with a twist.'},
            {type: 'circuit', goal: 'MAKE Φ− = (|00>−|11>)/√2.', qubits: 2, gates: ['H', 'X', 'Z', 'CX'], par: 3,
                solution: [['H', 0], ['Z', 0], ['CX', 0, 1]], hint: 'Make Φ+ and add a minus sign with Z.',
                eli5: 'Make the same-same pair, then give it a secret twist with Z.'},
            {type: 'circuit', goal: 'MAKE Ψ+ = (|01>+|10>)/√2.', qubits: 2, gates: ['H', 'X', 'Z', 'CX'], par: 3,
                solution: [['H', 0], ['X', 1], ['CX', 0, 1]], hint: 'Make Φ+, then flip one qubit.',
                eli5: 'Make the same-same pair, then flip one coin so they are always opposite.'},
            {type: 'circuit', goal: 'MAKE Ψ− = (|01>−|10>)/√2.', qubits: 2, gates: ['H', 'X', 'Z', 'CX'], par: 4,
                solution: [['H', 0], ['Z', 0], ['X', 1], ['CX', 0, 1]], hint: 'Ψ+ with a sign flip.',
                eli5: 'Opposite coins with a twist: combine the last two tricks.'},
        ],
    },
    {
        id: 'swap', world: 4, title: 'SWAP', code: '25_swap',
        refs: ['nc2010 §1.3.4'],
        steps: [
            {type: 'text', title: 'CNOT BOTH WAYS', body:
                'A CNOT can point either way: control on q0 and target on q1, or the other way round.\n' +
                'Three CNOTs that alternate direction SWAP two qubits, whatever state they are in.\n' +
                'The grey gates at the start are fixed. They prepare a state for you.',
            eli5: 'Three XOR tricks in a row swap two values, like swapping two cups of juice using only pouring.'},
            {type: 'circuit', goal: 'SWAP THE TWO QUBITS. ONLY CNOTS!', qubits: 2,
                setup: [['H', 0], ['T', 0], ['X', 1]], gates: ['CX'], par: 3,
                solution: [['CX', 0, 1], ['CX', 1, 0], ['CX', 0, 1]],
                hint: 'Control top, then control bottom, then control top again. Tap Q1 to put the dot on the lower wire.',
                eli5: 'Top flips bottom, bottom flips top, top flips bottom: now they have traded places.'},
        ],
    },
    {
        id: 'nocloning', world: 4, title: 'NO CLONING', code: '26_nocloning',
        refs: ['wootters1982', 'dieks1982', 'nc2010 §1.3.5'],
        steps: [
            {type: 'text', title: 'YOU CANNOT COPY A QUBIT', body:
                'The NO-CLONING THEOREM (Wootters and Zurek; Dieks; 1982): no machine copies every unknown state, |ψ>|0> → |ψ>|ψ>.\n' +
                'Why: gates are LINEAR. A copier that works for |0> and |1> must turn (|0>+|1>)/√2 into\n' +
                '  (|00> + |11>)/√2\n' +
                'which is a Bell state, not the copy |+>|+>.',
            eli5: 'You can photocopy a page, but not a qubit. Trying to copy a coin that is still spinning just ties the two coins together.'},
            {type: 'circuit', goal: 'TRY TO COPY |+> INTO Q1 WITH A CNOT. WHAT DO YOU GET?', qubits: 2,
                setup: [['H', 0]], gates: ['CX'], par: 1,
                solution: [['CX', 0, 1]], hint: 'CNOT copies 0 and 1, so try it on |+>.',
                eli5: 'Use the copy trick that works for 0 and 1, and look at the state: it is the magic pair, not two coins.'},
            {type: 'quiz', q: 'The CNOT "copy" of |+> gave (|00>+|11>)/√2. Is that |+>|+>?',
                options: ['YES', 'NO'], answer: 1,
                why: '|+>|+> = (|00>+|01>+|10>+|11>)/2 has all four states. The CNOT made entanglement, not a copy.'},
            {type: 'quiz', q: 'Why is no-cloning good news for cryptography?',
                options: ['QUBITS ARE FASTER', 'A SPY CANNOT COPY THE KEY QUBITS UNNOTICED', 'IT IS NOT'], answer: 1,
                why: 'An eavesdropper cannot keep a perfect copy of qubits in transit. The BB84 level uses this.'},
        ],
    },
    {
        id: 'toffoli', world: 4, title: 'TOFFOLI AND UNIVERSALITY', code: '27_toffoli',
        refs: ['toffoli1980', 'barenco1995', 'nc2010 §4.5'],
        steps: [
            {type: 'text', title: 'THREE WIRES', body:
                'The Toffoli gate CCX has two controls and a target: it flips the target only when both controls are 1. With the target at |0> it computes AND reversibly.\n' +
                'With three wires, a two-wire gate needs you to choose its wires: tap the gate, then tap the wire it should reach.',
            eli5: 'Toffoli is a flip with two guards. Both guards must say yes.'},
            {type: 'text', title: 'UNIVERSAL GATE SETS', body:
                'One-qubit gates plus CNOT can build ANY quantum gate exactly (Barenco et al., 1995).\n' +
                'A small fixed set like H, T and CNOT can approximate any gate as closely as you like.\n' +
                '>So a quantum computer only needs a handful of gate types, done very well.',
            eli5: 'A few kinds of LEGO bricks are enough to build anything, if you have enough of them.'},
            {type: 'circuit', goal: 'Q0 AND Q1 ARE COINS. WRITE Q0 AND Q1 INTO Q2.', qubits: 3,
                setup: [['H', 0], ['H', 1]], gates: ['CCX', 'X'], par: 1,
                solution: [['CCX', 0, 1, 2]], hint: 'Tap CCX, then tap Q1 as the second control. The target is the wire left over.',
                eli5: 'Q2 should become 1 exactly when both Q0 and Q1 are 1. That is what the two-guard flip does.'},
            {type: 'circuit', goal: 'NOW WRITE Q0 OR Q1 INTO Q2, AND LEAVE Q0, Q1 AS THEY WERE.', qubits: 3,
                setup: [['H', 0], ['T', 0], ['H', 1], ['T', 1]], gates: ['CCX', 'X'], par: 6,
                solution: [['X', 0], ['X', 1], ['CCX', 0, 1, 2], ['X', 2], ['X', 0], ['X', 1]],
                hint: 'A OR B = NOT (NOT A AND NOT B). Flip the inputs, AND them, flip the answer, flip the inputs back.',
                eli5: '"A or B" means "not (neither A nor B)". Flip both inputs, ask if both are now 1, flip that answer, and put the inputs back.'},
        ],
    },
    {
        id: 'chsh', world: 4, title: 'THE BELL TEST', code: '28_chsh',
        refs: ['bell1964', 'chsh1969', 'tsirelson1980', 'aspect1982', 'hensen2015', 'ibmbasics'],
        steps: [
            {type: 'text', title: 'THE CHSH GAME', body:
                'Alice and Bob are far apart. Each gets a random bit, x and y, and must answer a bit, a and b, without talking. They win if\n' +
                '  a XOR b = x AND y\n' +
                'With any plan fixed in advance (a LOCAL HIDDEN VARIABLE) they win at most 75% of the rounds (Clauser, Horne, Shimony, Holt 1969).',
            eli5: 'Two friends in separate rooms each get a yes/no question and must give answers that fit a rule. With any plan agreed beforehand they can win only 3 rounds out of 4.'},
            {type: 'text', title: 'ENTANGLEMENT WINS MORE', body:
                'Sharing a Bell pair and measuring at well-chosen angles, they win cos^2(π/8) ≈ 85.4% of rounds. In the CHSH number that is 2√2 ≈ 2.83 against the classical limit 2, and no quantum strategy can do better (Tsirelson\'s bound, 1980).\n' +
                'Experiments agree: Aspect (1982), and loophole-free in 2015 (Hensen et al.).',
            eli5: 'With magic coins the friends win about 85 rounds in 100, more than any secret plan allows. Real experiments have checked this.'},
            {type: 'quiz', q: 'What is the best a fixed classical plan can win in the CHSH game?',
                options: ['50%', '75%', '85%', '100%'], answer: 1,
                why: 'For example, both always answer 0: they win whenever x AND y = 0, which is 3 of the 4 cases.'},
            {type: 'quiz', q: 'Does winning 85% let Alice send Bob a message?',
                options: ['YES', 'NO'], answer: 1,
                why: 'Each answer alone is a fair coin. The advantage shows only in the correlation.'},
        ],
    },
);
