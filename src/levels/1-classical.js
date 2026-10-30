// World 1: classical bits, binary numbers, logic gates, reversible computing.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.LEVELS.push(
    {
        id: 'bits', world: 1, title: 'BITS', code: '01_bits',
        refs: ['shannon1948', 'nc2010 §1.2'],
        steps: [
            {type: 'text', title: 'WHAT IS A BIT?', body:
                'Every computer stores everything as bits. A bit has exactly two states, written 0 and 1: off and on, low and high voltage, no and yes.\n' +
                'Text, photos, music and this game are all long rows of zeros and ones.\n' +
                'Shannon\'s 1948 paper, which founded information theory, named it: "binary digits, or more briefly bits", a word he credits to John Tukey.',
            eli5: 'A bit is a light switch. It is either off (0) or on (1). Nothing in between. A computer is billions of tiny switches.'},
            {type: 'text', title: 'MANY BITS', body:
                'One bit has 2 patterns: 0, 1.\nTwo bits have 4: 00, 01, 10, 11.\n' +
                'Each new bit doubles the count, so n bits have 2^n patterns. 8 bits (a byte) have 256.\n' +
                '>A classical register always holds exactly ONE of its patterns at a time. Keep this in mind: quantum computers change it.',
            eli5: 'Two switches can be off-off, off-on, on-off or on-on: 4 ways. Every extra switch doubles the number of ways. But at any moment the switches show only one of those ways.'},
            {type: 'quiz', q: 'How many different patterns can 3 bits hold?',
                options: ['3', '6', '8', '9'], answer: 2,
                why: '2 x 2 x 2 = 8, from 000 to 111.'},
            {type: 'quiz', q: 'How many of those 8 patterns does a 3-bit register hold at one moment?',
                options: ['ONE', 'THREE', 'ALL EIGHT'], answer: 0,
                why: 'A classical register is always in exactly one pattern.'},
        ],
    },
    {
        id: 'binary', world: 1, title: 'BINARY NUMBERS', code: '02_binary',
        refs: ['shannon1948', 'nc2010 §1.2.1'],
        steps: [
            {type: 'text', title: 'COUNTING WITH TWO DIGITS', body:
                'In decimal each place is worth 10 times the one to its right: 1, 10, 100. In binary each place is worth 2 times: 1, 2, 4, 8, 16...\n' +
                '  101 = 1x4 + 0x2 + 1x1 = 5\n' +
                '  1111 = 8 + 4 + 2 + 1 = 15\n' +
                'n bits count from 0 to 2^n - 1.',
            eli5: 'Binary is counting with only two fingers on each hand position: 0 and 1. When a place is full, it goes back to 0 and you carry one to the left, just like 9 + 1 = 10 in normal numbers.'},
            {type: 'text', title: 'WHY IT MATTERS HERE', body:
                'Quantum states are labelled by bit strings: |000>, |001>, ... |111>. The label |101> is just the number 5 in binary.\n' +
                'In this game the LEFT digit belongs to the top wire, q0. (Qiskit, the Python toolkit, writes q0 on the RIGHT. More on that later.)',
            eli5: 'Each box in the list of a quantum state has a name, and the name is a binary number. |101> is box number 5.'},
            {type: 'quiz', q: 'What is the binary number 1011 in decimal?',
                options: ['9', '11', '13', '1011'], answer: 1,
                why: '8 + 0 + 2 + 1 = 11.'},
            {type: 'quiz', q: 'How many bits do you need to count from 0 to 15?',
                options: ['3', '4', '15', '16'], answer: 1,
                why: '4 bits give 2^4 = 16 patterns: 0000 to 1111, which is 0 to 15.'},
        ],
    },
    {
        id: 'gates', world: 1, title: 'LOGIC GATES', code: '03_gates',
        refs: ['nc2010 §3.1', 'shannon1948'],
        steps: [
            {type: 'text', title: 'GATES ARE RULES', body:
                'A gate turns input bits into output bits by a fixed rule, its TRUTH TABLE.\n' +
                '  NOT: 0 → 1, 1 → 0\n' +
                '  AND: 1 only if both inputs are 1\n' +
                '  OR:  1 if at least one input is 1\n' +
                '  XOR: 1 if the two inputs differ\n' +
                'Chain enough gates and you get a whole computer.',
            eli5: 'A gate is a tiny machine with a rule. NOT says "do the opposite". AND says "yes only if both say yes". XOR says "yes if you two disagree".'},
            {type: 'quiz', q: '1 XOR 1 = ?', options: ['0', '1'], answer: 0,
                why: 'XOR is 1 only when the inputs differ. 1 and 1 are the same.'},
            {type: 'text', title: 'ONE GATE FOR EVERYTHING', body:
                'NAND (NOT AND) is UNIVERSAL: every other gate can be built from NANDs alone. For example NOT A = A NAND A.\n' +
                'XOR is addition without carry: 1 + 1 = 10 in binary, and XOR gives the last digit, 0. AND gives the carry, 1.',
            eli5: 'With enough of one simple LEGO brick (NAND) you can build any machine. XOR is how a computer adds the last digit of two bits.'},
            {type: 'quiz', q: 'Adding two bits A + B: which gate gives the carry bit?',
                options: ['OR', 'AND', 'XOR', 'NOT'], answer: 1,
                why: 'There is a carry only for 1 + 1, exactly when A AND B is 1. XOR gives the sum digit.'},
        ],
    },
    {
        id: 'reversible', world: 1, title: 'REVERSIBLE COMPUTING', code: '04_reversible',
        refs: ['landauer1961', 'bennett1973', 'toffoli1980', 'nc2010 §3.2.5'],
        steps: [
            {type: 'text', title: 'UNDO', body:
                'NOT is REVERSIBLE: from the output you always know the input.\n' +
                'AND is not: an output of 0 can come from 00, 01 or 10. Information is lost.\n' +
                'Landauer (1961) showed that erasing one bit costs at least kT ln 2 of energy as heat. Bennett (1973) showed any computation can be done reversibly.',
            eli5: 'If I tell you "the AND gave 0", you cannot know what went in. That forgotten information has to go somewhere, and it goes out as a tiny bit of heat.'},
            {type: 'text', title: 'THE TOFFOLI GATE', body:
                'Toffoli\'s gate (1980) has three bits: it flips the third bit only when the first two are both 1:\n' +
                '  (A, B, C) → (A, B, C XOR (A AND B))\n' +
                'Start with C = 0 and C becomes A AND B, while A and B are kept, so nothing is lost. With spare bits set to 0 or 1, Toffoli gates alone can do any classical computation.\n' +
                '>Quantum gates are always reversible. Every one can be undone.',
            eli5: 'Toffoli is AND with a memory: it writes the answer on a spare bit but keeps the question, so you can always run it backwards.'},
            {type: 'quiz', q: 'Which of these gates is reversible?',
                options: ['AND', 'OR', 'NOT', 'NAND'], answer: 2,
                why: 'Run NOT twice and you are back where you started. The others merge different inputs into one output.'},
            {type: 'quiz', q: 'Toffoli on (1, 1, 1) gives...',
                options: ['(1, 1, 1)', '(1, 1, 0)', '(0, 0, 1)'], answer: 1,
                why: 'Both controls are 1, so the third bit flips: 1 → 0.'},
        ],
    },
);
