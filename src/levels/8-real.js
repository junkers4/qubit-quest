// World 8: real quantum computers: noise, error correction, variational algorithms,
// Qiskit in practice, where to go next.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.LEVELS.push(
    {
        id: 'noise', world: 8, title: 'NOISE', code: '48_noise',
        refs: ['zurek2003', 'nc2010 ch. 8', 'preskill2018'],
        steps: [
            {type: 'text', title: 'DECOHERENCE', body:
                'A real qubit is never perfectly isolated. Its surroundings keep "measuring" it a little, and its superposition fades into a plain random bit. This is DECOHERENCE.\n' +
                'Two numbers describe it: T1, how long |1> takes to decay to |0>, and T2, how long the phase between |0> and |1> survives.',
            eli5: 'A spinning coin on a table slowly wobbles and falls flat. Air and bumps make it fall. A qubit is the same: the world around it makes it "fall" into an ordinary bit.'},
            {type: 'text', title: 'ERRORS EVERYWHERE', body:
                'Every gate is a little wrong, measurements sometimes read the wrong bit, and long circuits pile up errors.\n' +
                'A noisy state is described by a DENSITY MATRIX; on the Bloch sphere its arrow is shorter than 1. A completely mixed qubit sits at the centre.\n' +
                '>Preskill (2018) named today\'s machines NISQ: noisy intermediate-scale quantum.',
            eli5: 'Every step a quantum computer takes has a small chance of a mistake. Many steps, many mistakes. That limits how long a program can be today.'},
            {type: 'quiz', q: 'On the Bloch sphere, a qubit that has fully decohered is...',
                options: ['AT THE NORTH POLE', 'ON THE EQUATOR', 'AT THE CENTRE'], answer: 2,
                why: 'A 50/50 random bit with no phase is the fully mixed state: arrow length 0.'},
            {type: 'quiz', q: 'Each gate fails with probability 1%. Roughly what is the chance that 100 gates all work?',
                options: ['99%', 'ABOUT 37%', '1%'], answer: 1,
                why: '0.99^100 ≈ 0.366. Errors add up fast, which is why error correction matters.'},
        ],
    },
    {
        id: 'qec', world: 8, title: 'ERROR CORRECTION', code: '49_qec', origin: 'shor1995',
        refs: ['shor1995', 'steane1996', 'nc2010 §10.1', 'google2025'],
        steps: [
            {type: 'text', title: 'COPYING WITHOUT CLONING', body:
                'Classically you protect a bit by repeating it: 0 → 000. One flipped bit is outvoted.\n' +
                'Qubits cannot be cloned, but they can be SPREAD: two CNOTs turn α|0> + β|1> into\n' +
                '  α|000> + β|111>\n' +
                'This is the three-qubit bit-flip code. It is not three copies: it is one entangled logical qubit.',
            eli5: 'To keep a message safe you write it three times. With qubits you cannot copy, but you can tie three qubits together so that they hold one message as a team.'},
            {type: 'text', title: 'FIND AND FIX', body:
                'If one qubit flips, CNOTs from q0 onto q1 and q2 reveal which one (the SYNDROME) without revealing α or β. A Toffoli controlled by the syndrome then repairs q0.\n' +
                'Shor\'s 9-qubit code (1995) also fixes phase flips; Steane\'s 7-qubit code (1996) followed. Modern machines aim at SURFACE CODES; Google Quantum AI reported a surface-code memory that gets better as the code grows (preprint 2024, Nature).',
            eli5: 'The team can check "do we still agree?" without reading the message. If one member disagrees, the others outvote it and fix it.'},
            {type: 'circuit', goal: 'ENCODE Q0\'S STATE INTO α|000> + β|111>.', qubits: 3,
                setup: [['H', 0], ['T', 0], ['H', 0]], gates: ['CX'], par: 2,
                solution: [['CX', 0, 1], ['CX', 0, 2]], hint: 'CNOT from q0 to q1, then from q0 to q2. Tap the target wire after CNOT.',
                eli5: 'Tie q1 and q2 to q0 with two guarded flips.'},
            {type: 'circuit', goal: 'AN X ERROR HIT Q0 (LAST GREY GATE). DECODE AND REPAIR: Q0 MUST HOLD THE ORIGINAL STATE.', qubits: 3,
                setup: [['H', 0], ['T', 0], ['H', 0], ['CX', 0, 1], ['CX', 0, 2], ['X', 0]],
                gates: ['CX', 'CCX'], goalQubits: [0], par: 3,
                solution: [['CX', 0, 1], ['CX', 0, 2], ['CCX', 1, 2, 0]],
                hint: 'Undo the encoding with the same two CNOTs. If q1 and q2 both read 1 now, q0 was hit: a Toffoli controlled by q1 and q2 flips it back.',
                eli5: 'Untie the team. The two helpers now say "q0 was hit". Let them flip q0 back with the two-guard flip.'},
            {type: 'quiz', q: 'The bit-flip code fixes...',
                options: ['ANY ERROR', 'ONE BIT FLIP AMONG THE THREE', 'ONLY PHASE ERRORS'], answer: 1,
                why: 'Two flips outvote the truth, and phase flips need another code (Shor\'s 9-qubit code handles both).'},
        ],
    },
    {
        id: 'variational', world: 8, title: 'VARIATIONAL ALGORITHMS', code: '50_variational',
        refs: ['peruzzo2014', 'farhi2014', 'preskill2018'],
        steps: [
            {type: 'text', title: 'QUANTUM PLUS CLASSICAL', body:
                'NISQ machines cannot run long circuits. Variational algorithms use short circuits with adjustable angles θ, measure a cost, and let an ordinary computer tune θ, over and over.\n' +
                'VQE, the variational quantum eigensolver (Peruzzo et al., 2014), searches for the lowest energy of a molecule. QAOA (Farhi, Goldstone, Gutmann, 2014) searches for good answers to optimization problems.',
            eli5: 'Like tuning a radio: the quantum computer plays a short tune, a normal computer listens and turns the knobs a little, and they repeat until it sounds right.'},
            {type: 'text', title: 'THE LOOP', body:
                '  1. prepare |ψ(θ)>: RY(θ), CNOTs\n' +
                '  2. measure the energy <ψ(θ)|H|ψ(θ)>\n' +
                '  3. a classical optimizer picks new θ\n' +
                'The CODE example finds the lowest energy of a one-qubit H = Z: the minimum −1 is at θ = π, the state |1>.\n' +
                'Whether these methods beat classical ones on useful problems is still being studied.',
            eli5: 'Guess, check, adjust, repeat. The quantum part does the checking.'},
            {type: 'quiz', q: 'In VQE, who chooses the next angles θ?',
                options: ['THE QUANTUM COMPUTER', 'A CLASSICAL OPTIMIZER', 'NOBODY, THEY ARE RANDOM'], answer: 1,
                why: 'The quantum computer only estimates the energy for given θ. A classical program updates θ.'},
            {type: 'quiz', q: 'Why are variational methods popular on today\'s machines?',
                options: ['THEY NEED SHORT CIRCUITS', 'THEY NEED NO MEASUREMENTS', 'THEY ARE PROVEN EXPONENTIALLY FASTER'], answer: 0,
                why: 'Short circuits finish before noise takes over. No exponential speed-up has been proven for them.'},
        ],
    },
    {
        id: 'qiskit', world: 8, title: 'QISKIT IN PRACTICE', code: '51_qiskit',
        refs: ['qiskit2024', 'qiskitdocs'],
        steps: [
            {type: 'text', title: 'YOUR FIRST REAL CODE', body:
                'Qiskit is IBM\'s open-source Python toolkit (Javadi-Abhari et al., 2024). Install it and run any CODE example from this game:\n' +
                '  pip install -r requirements.txt\n' +
                '  python examples/23_bell.py\n' +
                'A circuit is QuantumCircuit(n); gates are methods: qc.h(0), qc.cx(0, 1). Statevector(qc) gives the amplitudes; StatevectorSampler gives counts like a real machine.',
            eli5: 'Everything you built here with buttons, you can also write as a few lines of Python and run on your computer, or on a real quantum computer.'},
            {type: 'text', title: 'QUBIT ORDER', body:
                'Careful: Qiskit writes qubit 0 as the RIGHTMOST digit. After qc.x(0) on two qubits Qiskit shows |01>, while this game (and most textbooks) shows |10>.\n' +
                'Real hardware has its own gate set and only some qubit pairs connected; transpile(qc, basis_gates=...) rewrites your circuit for it. The examples show how.',
            eli5: 'Qiskit reads the qubit row from right to left, like counting places in a number. Same state, different way of writing its name.'},
            {type: 'quiz', q: 'In Qiskit, qc.x(0) on 3 qubits gives which counts key?',
                options: ['100', '001', '010'], answer: 1,
                why: 'Qubit 0 is the rightmost character: \'001\'. This game would write |100>.'},
            {type: 'quiz', q: 'What does transpile() do?',
                options: ['RUNS THE CIRCUIT', 'REWRITES IT FOR A MACHINE\'S GATES AND WIRING', 'DRAWS IT'], answer: 1,
                why: 'It maps your gates onto the hardware\'s native gates and connections, and optimizes the result.'},
        ],
    },
    {
        id: 'beyond', world: 8, title: 'WHAT NEXT', code: '52_beyond',
        refs: ['nc2010', 'mermin2007', 'ibmbasics', 'watrous2025', 'preskill2018'],
        steps: [
            {type: 'text', title: 'YOU MADE IT', body:
                'You know the math, qubits, gates, measurement, interference, entanglement, teleportation, key distribution, the big algorithms, noise and error correction.\n' +
                'Read next (all in SOURCES):\n' +
                '  NIELSEN & CHUANG: the standard text\n' +
                '  MERMIN: a short, clear introduction\n' +
                '  WATROUS / IBM: a free course',
            eli5: 'You now know the main ideas. The books in SOURCES go deeper, step by step.'},
            {type: 'text', title: 'KEEP PLAYING', body:
                'Every CODE example runs as it is: change it and see what happens. Replay levels for three stars, and look things up in the GATE BOOK and the GLOSSARY.\n' +
                '>Quantum computing is young. Some of its biggest discoveries are still ahead.',
            eli5: 'Change the examples, break things, fix them. That is how everyone learns.'},
            {type: 'quiz', q: 'Which effect lets wrong answers cancel and right ones grow?',
                options: ['MEASUREMENT', 'INTERFERENCE', 'CLONING'], answer: 1,
                why: 'Interference. (Cloning an unknown qubit is impossible: the no-cloning theorem.)'},
        ],
    },
);
