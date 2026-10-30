// World 6: algorithms: phase kickback, Deutsch, Deutsch-Jozsa, Bernstein-Vazirani, Simon,
// Grover, the quantum Fourier transform, phase estimation, Shor.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.LEVELS.push(
    {
        id: 'kickback', world: 6, title: 'PHASE KICKBACK', code: '32_kickback',
        refs: ['cleve1998', 'nc2010 §5.2'],
        steps: [
            {type: 'text', title: 'THE TARGET KICKS BACK', body:
                '|−> is an EIGENVECTOR of X: X|−> = −|−>. Flipping it only adds a minus sign. So when a CNOT targets a qubit in |−>, the sign lands on the CONTROL instead:\n' +
                '  CNOT |+>|−> = |−>|−>\n' +
                '>The control changed and the target did not. Algorithms use this to move answers into phases.',
            eli5: 'Pushing on a wall moves you, not the wall. The CNOT pushes on |−>, which cannot move, so the push comes back to the control qubit.'},
            {type: 'circuit', goal: 'Q0 IS |+>, Q1 IS |−>. TURN Q0 INTO |1>. NO X!', qubits: 2,
                setup: [['H', 0], ['X', 1], ['H', 1]], gates: ['H', 'CX'], par: 2,
                solution: [['CX', 0, 1], ['H', 0]], hint: 'Kick a minus sign onto q0, then let H turn |−> into |1>.',
                eli5: 'Use the push-back trick to turn q0 from |+> into |−>, then turn |−> into a 1.'},
            {type: 'quiz', q: 'After CNOT on |+>|−>, the target q1 is...',
                options: ['|+>', '|−>', '|1>'], answer: 1,
                why: 'It is still |−>: an eigenvector of X only picks up a sign, and the sign moved to q0.'},
        ],
    },
    {
        id: 'deutsch', world: 6, title: 'DEUTSCH', code: '33_deutsch', origin: 'deutsch1985',
        refs: ['deutsch1985', 'cleve1998', 'nc2010 §1.4.3'],
        steps: [
            {type: 'text', title: 'ONE QUESTION', body:
                'A black box f takes one bit and gives one bit. It is CONSTANT (f(0) = f(1)) or BALANCED (f(0) ≠ f(1)). A classical computer must ask the box twice to tell which.\n' +
                'A quantum computer needs ONE question. Deutsch posed the problem in 1985; the sure-fire version below is from Cleve, Ekert, Macchiavello and Mosca (1998).',
            eli5: 'A machine either always says the same thing, or always says different things for 0 and 1. Normally you must try it twice. The quantum trick finds out with one try.'},
            {type: 'text', title: 'THE RECIPE', body:
                'The box is the ORACLE U_f |x>|y> = |x>|y XOR f(x)>.\n' +
                '  1. start in |0>|1>, H on both\n' +
                '  2. ask the box once\n' +
                '  3. H on q0, measure q0\n' +
                '0 means CONSTANT, 1 means BALANCED. q1 is |−>, so by phase kickback q0 picks up (−1)^f(x), and the last H turns that phase into a bit.',
            eli5: 'Put both possible questions into the box at once as a coin. The box leaves a hidden twist on the coin. The last H turns the twist into a plain answer.'},
            {type: 'circuit', goal: 'THIS BOX F IS BALANCED (F(X) = X). RUN DEUTSCH SO Q0 ENDS IN |1>.', qubits: 2,
                setup: [['X', 1]], boxes: {F: [['CX', 0, 1]]}, gates: ['H', 'F'], limits: {F: 1}, par: 4,
                solution: [['H', 0], ['H', 1], ['F'], ['H', 0]], hint: 'H on both, the box F once, then H on q0.',
                eli5: 'Coin both wires, use the box once, un-coin the top wire.'},
            {type: 'quiz', q: 'You run Deutsch and q0 measures 0. The box is...',
                options: ['CONSTANT', 'BALANCED'], answer: 0,
                why: 'No relative minus sign was kicked back, so the last H brings q0 home to |0>.'},
        ],
    },
    {
        id: 'dj', world: 6, title: 'DEUTSCH-JOZSA', code: '34_dj', origin: 'dj1992',
        refs: ['dj1992', 'cleve1998', 'nc2010 §1.4.4'],
        steps: [
            {type: 'text', title: 'MANY BITS', body:
                'Now f takes n bits and is promised to be CONSTANT (same output for all 2^n inputs) or BALANCED (0 for exactly half of them).\n' +
                'A classical computer may need 2^(n−1) + 1 questions to be sure. Deutsch and Jozsa (1992): ONE quantum question.\n' +
                '  H on every input, ask once, H again\n' +
                'All inputs read 0: constant. Anything else: balanced.',
            eli5: 'Same game, but the machine takes many switches. A normal computer may need to try more than half of all switch settings. The quantum computer still needs one try.'},
            {type: 'text', title: 'WHY IT WORKS', body:
                'After the oracle the inputs hold Σ (−1)^f(x) |x> (up to a factor). The final H layer adds all those signs into the amplitude of |00..0>:\n' +
                '  AMP(|0..0>) = (1/2^n) Σ (−1)^f(x)\n' +
                'Constant: ±1, so you surely read 0..0. Balanced: the signs cancel to exactly 0, so you never do.',
            eli5: 'Each input leaves a plus or a minus. If they are all the same they add up to a sure "all zeros". If half are minus they cancel and "all zeros" can never show up.'},
            {type: 'circuit', goal: 'TWO INPUT BITS, F IS A BALANCED BOX. RUN DEUTSCH-JOZSA: THE INPUTS MUST NOT READ 00.', qubits: 3,
                setup: [['X', 2]], boxes: {F: [['CX', 0, 2], ['CX', 1, 2]], W: [['H', 0], ['H', 1]]},
                gates: ['W', 'H', 'F'], limits: {F: 1}, allow: {H: [2]}, allowText: 'H HERE IS FOR THE HELPER Q2. USE W FOR THE INPUTS.',
                goalQubits: [0, 1], par: 4,
                solution: [['W'], ['H', 2], ['F'], ['W']],
                hint: 'W puts H on both inputs. W, H on q2, the box once, W again.',
                eli5: 'W is "coin all the inputs". Coin the inputs and the helper, ask the box, un-coin the inputs.'},
            {type: 'quiz', q: 'Deutsch-Jozsa reads the inputs as 00. The box is...',
                options: ['CONSTANT', 'BALANCED', 'CANNOT TELL'], answer: 0,
                why: 'For a balanced f the amplitude of 00 is exactly 0, so 00 means constant, with certainty.'},
        ],
    },
    {
        id: 'bv', world: 6, title: 'BERNSTEIN-VAZIRANI', code: '35_bv', origin: 'bv1997',
        refs: ['bv1997', 'nc2010 §1.4.4'],
        steps: [
            {type: 'text', title: 'A HIDDEN STRING', body:
                'The box hides a secret bit string s and computes\n' +
                '  f(x) = s·x mod 2\n' +
                '(the parity of the bits where both x and s have a 1). Classically one question reveals one bit of s, so n questions for n bits.\n' +
                'Bernstein and Vazirani: the same circuit as Deutsch-Jozsa reveals ALL of s with one question.',
            eli5: 'The box hides a secret password of n switches. Normally you test one switch per try. The quantum way reads the whole password in one try.'},
            {type: 'text', title: 'WHY', body:
                'After the oracle the inputs hold Σ (−1)^(s·x) |x>, which is exactly H on every qubit of |s>. One more layer of H undoes it and leaves |s>.',
            eli5: 'The box writes the password as a pattern of twists. The H layer turns the twists back into the password.'},
            {type: 'circuit', goal: 'THE BOX HIDES A 2-BIT SECRET S. READ IT IN ONE QUESTION.', qubits: 3,
                setup: [['X', 2]], boxes: {F: [['CX', 0, 2]], W: [['H', 0], ['H', 1]]},
                gates: ['W', 'H', 'F'], limits: {F: 1}, allow: {H: [2]}, allowText: 'H HERE IS FOR THE HELPER Q2. USE W FOR THE INPUTS.',
                goalQubits: [0, 1], par: 4,
                solution: [['W'], ['H', 2], ['F'], ['W']],
                hint: 'The same four steps as Deutsch-Jozsa. The inputs then show s.',
                eli5: 'Same recipe as before. This time the answer you read IS the password.'},
            {type: 'quiz', q: 'The circuit above reads the inputs as |10>. So the secret s is...',
                options: ['00', '01', '10', '11'], answer: 2,
                why: 'Bernstein-Vazirani outputs s itself: this box computes f(x) = x0, which is s·x for s = 10. (The Deutsch-Jozsa box, x0 XOR x1, was s = 11.)'},
        ],
    },
    {
        id: 'simon', world: 6, title: 'SIMON', code: '36_simon', origin: 'simon1997',
        refs: ['simon1997', 'mermin2007 ch. 2'],
        steps: [
            {type: 'text', title: 'A HIDDEN PERIOD', body:
                'Simon\'s problem (1994, journal 1997): f maps n bits to n bits and there is a secret s ≠ 0 with\n' +
                '  f(x) = f(y) EXACTLY WHEN\n' +
                '  y = x   OR   y = x XOR s\n' +
                'Classically you need about 2^(n/2) questions to find a matching pair. Simon\'s quantum algorithm needs about n.',
            eli5: 'The box gives every input a twin that gets the same answer, and the twins always differ by the same secret pattern. Finding the pattern normally takes ages.'},
            {type: 'text', title: 'HOW', body:
                'Each round: H on the inputs, one question, H again, measure. The result y always satisfies\n' +
                '  y·s = 0 (mod 2)\n' +
                'After about n rounds the equations pin down s by ordinary linear algebra.\n' +
                '>This exponential speed-up inspired Shor\'s factoring algorithm.',
            eli5: 'Each quantum try gives one clue about the secret. A handful of clues, solved like a school equation puzzle, give the whole secret.'},
            {type: 'quiz', q: 'A Simon round gives y with y·s = 0. For s = 11, which y can appear?',
                options: ['01 OR 10', '00 OR 11', 'ANY'], answer: 1,
                why: '00·11 = 0 and 11·11 = 1 + 1 = 0 (mod 2). 01·11 = 1, so 01 and 10 never appear.'},
            {type: 'quiz', q: 'How does the number of questions grow with n?',
                options: ['QUANTUM ~n, CLASSICAL ~2^(N/2)', 'BOTH ~n', 'BOTH ~2^n'], answer: 0,
                why: 'That gap, polynomial against exponential, was the first strong evidence that quantum computers can be exponentially faster (relative to an oracle).'},
        ],
    },
    {
        id: 'grover', world: 6, title: 'GROVER SEARCH', code: '37_grover', origin: 'grover1996',
        refs: ['grover1996', 'bbht1998', 'nc2010 ch. 6'],
        steps: [
            {type: 'text', title: 'FINDING A NEEDLE', body:
                'Grover (1996): find the one marked item among N with about (π/4)√N questions instead of about N.\n' +
                'Start with all items equally likely. The ORACLE flips the sign of the marked one. The DIFFUSER reflects every amplitude about the average, and the marked one grows. Repeat.\n' +
                '>With 4 items, one round finds it for certain.',
            eli5: 'All boxes start equally loud. The oracle secretly turns the right box upside down. The diffuser then makes the upside-down box louder and the others quieter. Repeat until it is shouting.'},
            {type: 'text', title: 'THE DIFFUSER', body:
                'For two qubits the diffuser is\n' +
                '  H H, Z Z, CZ, H H\n' +
                'CZ flips the sign of |11> only. Here the oracle is also a CZ: it marks |11>.\n' +
                'Too many rounds overshoot and the chance drops again; Boyer, Brassard, Høyer and Tapp worked out the exact numbers (1998).',
            eli5: 'There is a best number of repeats. Too few and the answer is still quiet, too many and you go past it.'},
            {type: 'circuit', goal: 'THE ORACLE MARKED |11>. BUILD THE DIFFUSER AND FIND IT.', qubits: 2,
                setup: [['H', 0], ['H', 1], ['CZ', 0, 1]], gates: ['H', 'Z', 'X', 'CZ'], par: 5,
                solution: [['H', 0], ['H', 1], ['Z', 0], ['Z', 1], ['CZ', 0, 1], ['H', 0], ['H', 1]],
                hint: 'The diffuser from the lesson works (7 gates). For three stars: the H H at its start does nothing here...',
                eli5: 'Build the "make the right one louder" machine from the lesson. Watch |11> grow to 1.'},
            {type: 'quiz', q: 'Searching 1,000,000 items, Grover needs about how many oracle calls?',
                options: ['1,000,000', '500,000', '800', '20'], answer: 2,
                why: '(π/4)·√1,000,000 ≈ 0.785 x 1000 ≈ 785. A classical search needs about 500,000 on average.'},
        ],
    },
    {
        id: 'qft', world: 6, title: 'FOURIER TRANSFORM', code: '38_qft',
        refs: ['coppersmith1994', 'nc2010 §5.1'],
        steps: [
            {type: 'text', title: 'THE QFT', body:
                'The quantum Fourier transform on n qubits (N = 2^n) maps each basic state to an even superposition with turning phases:\n' +
                '  QFT|x> = (1/√N) Σ e^(2πI·xk/N) |k>\n' +
                'It is the discrete Fourier transform applied to the amplitudes. It needs only about n^2/2 gates (Coppersmith, 1994), against about n·2^n operations for the classical fast Fourier transform on 2^n numbers.',
            eli5: 'The Fourier transform finds the rhythm hidden in a signal. The quantum version finds rhythms in the amplitudes, and does it with very few gates.'},
            {type: 'text', title: 'TWO QUBITS', body:
                'For two qubits (q0 the high bit):\n' +
                '  H on q0\n' +
                '  CS between q0 and q1\n' +
                '  H on q1\n' +
                '  SWAP q0, q1\n' +
                'CS is a controlled quarter turn. Larger QFTs use smaller and smaller controlled turns, then reverse the qubit order.',
            eli5: 'A coin, a small twist that depends on the other qubit, another coin, and then swap the two qubits round.'},
            {type: 'circuit', goal: 'APPLY THE QFT TO |01>. GOAL: (|00> + I|01> − |10> − I|11>)/2.', qubits: 2,
                setup: [['X', 1]], gates: ['H', 'CS', 'SWAP'], par: 4,
                solution: [['H', 0], ['CS', 0, 1], ['H', 1], ['SWAP', 0, 1]],
                hint: 'H on q0, CS, H on q1, SWAP.',
                eli5: 'Follow the four-step recipe. The colours of the four amplitudes should go green, blue, red, gold: a quarter turn more each time.'},
            {type: 'quiz', q: 'QFT|0..0> gives...',
                options: ['|0..0>', 'AN EVEN SUPERPOSITION, ALL PHASES +', 'A RANDOM STATE'], answer: 1,
                why: 'With x = 0 every phase e^0 = 1: the QFT of |0..0> is the same as H on every qubit.'},
        ],
    },
    {
        id: 'qpe', world: 6, title: 'PHASE ESTIMATION', code: '39_qpe',
        refs: ['kitaev1995', 'cleve1998', 'nc2010 §5.2'],
        steps: [
            {type: 'text', title: 'READING AN EIGENVALUE', body:
                'A unitary U and its eigenvector |u>: U|u> = e^(2πI·φ)|u>. Phase estimation (Kitaev, 1995) finds φ.\n' +
                'Counting qubits in |+> control U, U^2, U^4, ... on |u>. By kickback the k-th counting qubit picks up the phase 2^k·φ. The inverse QFT then turns those phases into the binary digits of φ.',
            eli5: 'A gate secretly turns its favourite state by some angle. Phase estimation reads that angle, one binary digit per helper qubit.'},
            {type: 'text', title: 'THIS PUZZLE', body:
                'U = S and |u> = |1>: S|1> = I|1> = e^(2πI·1/4)|1>, so φ = 1/4 = 0.01 in binary.\n' +
                'The grey gates did the kickback: q0 controls U^2 = Z, q1 controls U = S. Now q0 = |−> and q1 = |+I>.\n' +
                'Inverse QFT for two qubits:\n' +
                '  SWAP, H on q1, CS† , H on q0',
            eli5: 'The angle is already hidden in the two helper qubits as twists. Run the Fourier recipe backwards to read it as the number 01.'},
            {type: 'circuit', goal: 'FINISH PHASE ESTIMATION: Q0 Q1 MUST READ 01 (φ = 0.01 IN BINARY).', qubits: 3,
                setup: [['H', 0], ['H', 1], ['X', 2], ['CZ', 0, 2], ['CS', 1, 2]],
                gates: ['H', 'SWAP', 'CSDG', 'SDG'], goalQubits: [0, 1], par: 4,
                solution: [['SWAP', 0, 1], ['H', 1], ['CSDG', 0, 1], ['H', 0]],
                hint: 'SWAP, H on q1, CS† between q0 and q1, H on q0.',
                eli5: 'Run the backwards Fourier recipe on the two helper wires. Do not touch q2.'},
            {type: 'quiz', q: 'With t counting qubits, phase estimation gives φ to about...',
                options: ['t DECIMAL DIGITS', 't BINARY DIGITS', 'ONE BIT'], answer: 1,
                why: 'Each counting qubit carries one binary digit of φ.'},
        ],
    },
    {
        id: 'shor', world: 6, title: 'SHOR FACTORING', code: '40_shor', origin: 'shor1997',
        refs: ['shor1997', 'nc2010 §5.3', 'hardy2008 ch. 10'],
        steps: [
            {type: 'text', title: 'FACTORING VIA A PERIOD', body:
                'Shor (1994; journal 1997): factor N in time polynomial in its number of digits. No such classical algorithm is known, and RSA encryption relies on that.\n' +
                'Pick a random a < N. The powers a^1, a^2, a^3, ... mod N repeat with some PERIOD r: a^r = 1 mod N. If r is even and a^(r/2) ≠ −1 mod N, then\n' +
                '  GCD(a^(r/2) ± 1, N)\n' +
                'are factors of N.',
            eli5: 'Breaking a big number into its prime pieces is very hard. Shor turns it into finding the rhythm of a repeating pattern, and quantum computers are good at rhythms.'},
            {type: 'text', title: 'N = 15, A = 7', body:
                '  7^1 = 7    7^2 = 49 = 4 MOD 15\n' +
                '  7^3 = 13   7^4 = 1 MOD 15\n' +
                'So r = 4 and 7^2 = 49:\n' +
                '  GCD(48, 15) = 3   GCD(50, 15) = 5\n' +
                'The quantum part finds r: phase estimation of "multiply by a mod N" gives φ = k/r, and continued fractions turn φ into r.',
            eli5: 'For 15 the pattern repeats every 4 steps. Half of 4 is 2, and 7 squared, minus one and plus one, shares the pieces 3 and 5 with 15.'},
            {type: 'quiz', q: 'For N = 21 and a = 2 the powers mod 21 are 2, 4, 8, 16, 11, 1. The period r is...',
                options: ['2', '4', '6', '21'], answer: 2,
                why: '2^6 = 64 = 3 x 21 + 1. Then 2^3 = 8: GCD(7, 21) = 7 and GCD(9, 21) = 3, and 21 = 3 x 7.'},
            {type: 'quiz', q: 'Which step of Shor\'s algorithm needs the quantum computer?',
                options: ['PICKING A', 'FINDING THE PERIOD R', 'THE GCD'], answer: 1,
                why: 'Everything else is fast on an ordinary computer. Finding r is the hard part.'},
        ],
    },
);
