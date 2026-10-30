// World 5: quantum protocols: superdense coding, teleportation, BB84 key distribution.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.LEVELS.push(
    {
        id: 'superdense', world: 5, title: 'SUPERDENSE CODING', code: '29_superdense', origin: 'bennett1992',
        refs: ['bennett1992', 'nc2010 §2.3', 'ibmbasics'],
        steps: [
            {type: 'text', title: 'TWO BITS IN ONE QUBIT', body:
                'Alice and Bob share a Bell pair Φ+ in advance: q0 is Alice\'s, q1 is Bob\'s. To send two bits, Alice does one of four things to HER qubit only and mails it to Bob:\n' +
                '  00: NOTHING   01: X\n' +
                '  10: Z         11: X THEN Z\n' +
                'Bob then holds one of the four Bell states (Bennett and Wiesner, 1992).',
            eli5: 'If two friends share a pair of magic coins beforehand, one friend can twist her coin in one of four ways and post it. That one coin then carries two bits.'},
            {type: 'text', title: 'BOB DECODES', body:
                'Bob undoes the Bell pair: CNOT from q0 to q1, then H on q0. That turns the four Bell states into |00>, |01>, |10>, |11>, and he reads the two bits.\n' +
                'In the puzzles Bob\'s decoder is fixed at the END of the circuit (grey). X and Z are allowed on Alice\'s qubit q0 only.',
            eli5: 'Bob runs the "magic pair" recipe backwards. That turns each of the four twists into a different plain answer.'},
            {type: 'circuit', goal: 'SEND THE BITS 01: BOB MUST READ |01>.', qubits: 2,
                setup: [['H', 0], ['CX', 0, 1]], after: [['CX', 0, 1], ['H', 0]],
                gates: ['X', 'Z'], allow: {X: [0], Z: [0]}, allowText: 'ONLY ALICE\'S QUBIT Q0 MAY BE CHANGED.',
                par: 1, solution: [['X', 0]], hint: 'Look at the table: 01 is one gate.',
                eli5: 'Twist Alice\'s coin the "01" way.'},
            {type: 'circuit', goal: 'SEND THE BITS 11: BOB MUST READ |11>.', qubits: 2,
                setup: [['H', 0], ['CX', 0, 1]], after: [['CX', 0, 1], ['H', 0]],
                gates: ['X', 'Z'], allow: {X: [0], Z: [0]}, allowText: 'ONLY ALICE\'S QUBIT Q0 MAY BE CHANGED.',
                par: 2, solution: [['X', 0], ['Z', 0]], hint: 'X then Z, both on q0.',
                eli5: 'Use both twists, one after the other.'},
            {type: 'quiz', q: 'How many classical bits does one qubit carry in superdense coding?',
                options: ['1', '2', 'INFINITELY MANY'], answer: 1,
                why: 'Two, and only with a Bell pair shared beforehand. Without one a qubit carries at most one bit (Holevo\'s bound).'},
        ],
    },
    {
        id: 'teleport', world: 5, title: 'TELEPORTATION', code: '30_teleport', origin: 'bennett1993',
        refs: ['bennett1993', 'nc2010 §1.3.7', 'nc2010 §4.4', 'ibmbasics'],
        steps: [
            {type: 'text', title: 'MOVING A STATE', body:
                'Alice has an unknown state |ψ> on q0. She and Bob share a Bell pair: q1 (Alice) and q2 (Bob). She cannot copy |ψ> (no-cloning) and cannot measure it (that destroys it). Yet she can move it (Bennett et al., 1993):\n' +
                '  1. CNOT q0 → q1, then H on q0\n' +
                '  2. measure q0 and q1: two bits\n' +
                '  3. send the bits; Bob fixes q2',
            eli5: 'Alice cannot photocopy her qubit or even look at it. But using one magic coin pair and two ordinary bits sent by phone, she can make Bob\'s coin become exactly her qubit.'},
            {type: 'text', title: 'BOB\'S FIX', body:
                'If q1 read 1, Bob applies X to q2. If q0 read 1, he applies Z. Then q2 is |ψ>, and Alice\'s copy is gone.\n' +
                'In a circuit, "measure, then a gate if the bit is 1" equals a controlled gate followed by the measurement (the DEFERRED MEASUREMENT principle). So the fix is CNOT q1 → q2 and CZ q0 → q2.\n' +
                '>Nothing travels faster than light: Bob needs Alice\'s two bits.',
            eli5: 'Bob gets two bits by phone. They tell him which of four small repairs to make. Until the phone call arrives, his coin looks completely random.'},
            {type: 'circuit', goal: 'TELEPORT Q0\'S STATE TO Q2. THE GREY GATES MADE |ψ> AND THE BELL PAIR.', qubits: 3,
                setup: [['H', 0], ['T', 0], ['H', 0], ['H', 1], ['CX', 1, 2]],
                gates: ['H', 'CX', 'CZ'], allow: {H: [0, 1], CX: [[0, 1], [1, 2]], CZ: [[0, 2]]},
                allowText: 'ALICE: H ON Q0, Q1 AND CNOT Q0→Q1. BOB\'S FIX: CNOT Q1→Q2, CZ Q0-Q2.',
                goalQubits: [2], par: 4,
                solution: [['CX', 0, 1], ['H', 0], ['CX', 1, 2], ['CZ', 0, 2]],
                hint: 'CNOT q0→q1, H on q0, then the fixes: CNOT q1→q2 and CZ between q0 and q2.',
                eli5: 'Follow the recipe: Alice\'s two steps, then Bob\'s two repairs. Watch the little globe for q2: its arrow must land on the gold box.'},
            {type: 'quiz', q: 'Before Bob gets Alice\'s two bits, his qubit q2 is...',
                options: ['ALREADY |ψ>', 'COMPLETELY RANDOM', 'ALWAYS |0>'], answer: 1,
                why: 'On its own q2 is fully mixed (the arrow shrinks to the centre). Only with the bits can he turn it into |ψ>.'},
        ],
    },
    {
        id: 'bb84', world: 5, title: 'QUANTUM KEYS: BB84', code: '31_bb84', origin: 'bb84',
        refs: ['bb84', 'ekert1991', 'nc2010 §12.6', 'wootters1982'],
        steps: [
            {type: 'text', title: 'SENDING A SECRET KEY', body:
                'BB84 (Bennett and Brassard, 1984): for each bit Alice picks a random BASIS, Z (|0>, |1>) or X (|+>, |−>), and sends one qubit. Bob measures each in a random basis of his own.\n' +
                'Afterwards they compare the BASES (not the bits) in public and keep only the rounds where they matched. Those bits agree: that is the key.',
            eli5: 'Alice sends coins that are either "up/down" coins or "left/right" coins. Bob guesses which kind each one is. They later say only which kind they used, and keep the coins where they guessed the same.'},
            {type: 'text', title: 'CATCHING A SPY', body:
                'An eavesdropper Eve must measure the qubits to learn anything, but she does not know the bases. Each time she guesses wrong she disturbs the qubit, and in kept rounds Bob then gets the wrong bit 1/4 of the time.\n' +
                'Alice and Bob sacrifice some key bits to check the error rate. Too many errors: someone listened, start again.\n' +
                'Ekert (1991) gave a version that uses Bell pairs and the Bell test.',
            eli5: 'Looking at a qubit changes it. A spy who peeks leaves fingerprints: mistakes that Alice and Bob can count.'},
            {type: 'quiz', q: 'Alice sent |+> (X basis). Bob measures in the Z basis. He gets...',
                options: ['ALWAYS 0', 'ALWAYS 1', '0 OR 1, 50/50'], answer: 2,
                why: '|+> is an even mix of |0> and |1>. That round is thrown away because the bases differ.'},
            {type: 'quiz', q: 'With no eavesdropper, what share of rounds do Alice and Bob keep?',
                options: ['ALL', 'ABOUT HALF', 'ABOUT A QUARTER'], answer: 1,
                why: 'Their random bases match half of the time.'},
            {type: 'quiz', q: 'Eve measures every qubit in a random basis. In the kept rounds, the error rate becomes...',
                options: ['0%', '25%', '50%'], answer: 1,
                why: 'She guesses the wrong basis half of the time, and then Bob\'s bit is wrong half of the time: 1/2 x 1/2 = 1/4.'},
        ],
    },
);
