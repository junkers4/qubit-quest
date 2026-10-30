// World 7: how qubits are built: DiVincenzo's checklist, superconducting circuits and the
// dilution refrigerator, trapped ions and lasers, optics and photons, neutral atoms in
// optical tweezers, spins in silicon.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.LEVELS.push(
    {
        id: 'divincenzo', world: 7, title: 'WHAT A QUBIT NEEDS', code: '41_divincenzo',
        refs: ['divincenzo2000', 'nc2010 ch. 7'],
        steps: [
            {type: 'text', title: 'DIVINCENZO\'S CHECKLIST', body:
                'DiVincenzo (2000) listed what any quantum computer needs:\n' +
                '  1. many well-defined qubits\n' +
                '  2. a way to reset them to |00..0>\n' +
                '  3. coherence much longer than a gate\n' +
                '  4. a universal set of gates\n' +
                '  5. measurement of each qubit\n' +
                'For quantum networks two more: turn stationary qubits into flying ones (photons), and send those reliably.',
            eli5: 'To build a quantum computer you need: lots of qubits, a "reset" button, qubits that stay quantum long enough, enough kinds of moves, and a way to read the answer.'},
            {type: 'text', title: 'THE CONTENDERS', body:
                'Every hardware platform trades these against each other:\n' +
                '  SUPERCONDUCTING CIRCUITS\n' +
                '  TRAPPED IONS\n' +
                '  PHOTONS\n' +
                '  NEUTRAL ATOMS\n' +
                '  SPINS IN SILICON\n' +
                'This world visits each one: what the qubit is, how gates are done, and why so much of it is about cold, vacuum and lasers.',
            eli5: 'There are several very different ways to make qubits, from tiny cold electric circuits to single atoms held by light. Each has strong and weak points.'},
            {type: 'quiz', q: 'A qubit keeps its state for 100 µs and a gate takes 50 ns. Roughly how many gates fit?',
                options: ['2', '200', '2000', '2 MILLION'], answer: 2,
                why: '100 µs / 50 ns = 100,000 ns / 50 ns = 2000. Criterion 3 asks for that ratio to be large.'},
            {type: 'quiz', q: 'Which criterion is about "flying qubits"?',
                options: ['RESET', 'MEASUREMENT', 'QUANTUM NETWORKS'], answer: 2,
                why: 'The two extra criteria are for communication: converting to photons and sending them.'},
        ],
    },
    {
        id: 'superconducting', world: 7, title: 'SUPERCONDUCTING QUBITS', code: '42_superconducting',
        refs: ['krantz2019', 'koch2007', 'nakamura1999'],
        steps: [
            {type: 'text', title: 'AN ARTIFICIAL ATOM', body:
                'A superconducting qubit is a tiny electric circuit on a chip. Cooled until its metal superconducts, current flows without loss and the circuit behaves like a single quantum object.\n' +
                'Nakamura, Pashkin and Tsai (1999) first controlled such a circuit coherently.',
                pic: 'transmon',
                eli5: 'It is a small electric loop on a chip. When it is cold enough, the whole loop acts like one giant atom that can be in 0, in 1, or in both.'},
            {type: 'text', title: 'WHY A JUNCTION', body:
                'A plain coil and capacitor (an LC circuit) has evenly spaced energy levels, so a pulse tuned to 0→1 also drives 1→2. The JOSEPHSON JUNCTION, a thin insulating gap, makes the levels unevenly spaced (anharmonic), so the lowest two can be used alone as a qubit.',
                pic: 'levels',
                eli5: 'If all the steps of a ladder are the same height, you cannot climb just one step without slipping to the next. The junction makes the steps different heights.'},
            {type: 'text', title: 'THE TRANSMON', body:
                'The TRANSMON (Koch et al., 2007) adds a large capacitor across the junction, which makes it nearly immune to stray charges. It is the most common superconducting qubit.\n' +
                'Qubit frequencies are a few gigahertz (microwaves). Gates are microwave pulses sent down coaxial cables; readout uses a resonator coupled to the qubit.',
            eli5: 'The transmon is the popular model. You play it like a radio: microwave notes flip it, and a second "listening" circuit tells you what state it is in.'},
            {type: 'quiz', q: 'Why does the qubit need the Josephson junction?',
                options: ['TO STORE CHARGE', 'TO MAKE THE ENERGY STEPS UNEVEN', 'TO COOL THE CHIP'], answer: 1,
                why: 'Uneven (anharmonic) levels let a pulse drive 0→1 without also driving 1→2.'},
            {type: 'quiz', q: 'Superconducting qubits are controlled with...',
                options: ['MICROWAVE PULSES', 'VISIBLE LASER LIGHT', 'SOUND'], answer: 0,
                why: 'Their transitions are at a few gigahertz: microwave frequencies.'},
        ],
    },
    {
        id: 'fridge', world: 7, title: 'THE DILUTION FRIDGE', code: '43_fridge',
        refs: ['krinner2019', 'london1962', 'krantz2019'],
        steps: [
            {type: 'text', title: 'COLDER THAN SPACE', body:
                'Superconducting qubits sit in a DILUTION REFRIGERATOR at about 0.01 K, a hundredth of a degree above absolute zero. Space itself is about 2.7 K.\n' +
                'Stacked plates get colder from top to bottom. The chip hangs at the bottom, from the mixing chamber.',
                pic: 'fridge',
                eli5: 'The qubit chip lives at the bottom of a big golden chandelier. Each floor is colder than the one above, and the bottom is colder than outer space.'},
            {type: 'text', title: 'WHY SO COLD', body:
                'A 5 GHz qubit has an energy of h·f, which matches the heat energy k·T at only about 0.24 K. At room temperature the qubit would be flipped at random all the time; at 0.01 K the chance of a heat flip is tiny.\n' +
                'The metals must also be superconducting, which needs low temperatures.',
            eli5: 'Heat is jiggling. The qubit\'s 0 and 1 are so close in energy that any warmth jiggles it between them. Very cold means very still.'},
            {type: 'text', title: 'HOW IT GETS THERE', body:
                'A pulse-tube cooler brings the upper plates to about 50 K and 4 K. Below that a mix of helium-3 and helium-4 does the rest: in the mixing chamber helium-3 crosses from a rich phase into a dilute one and takes heat with it, like evaporation (proposed by London, Clarke and Mendoza, 1962).\n' +
                'Control cables pass attenuators on every plate so that room-temperature noise never reaches the chip; amplifiers boost the faint readout signals on the way back up.',
            eli5: 'A first cooler gets close to the temperature of liquid helium. Then a special helium mixture works like sweat evaporating from skin, but far colder. The wires have "noise filters" on every floor.'},
            {type: 'quiz', q: 'Roughly how cold is the mixing chamber where the chip sits?',
                options: ['4 K', '1 K', '0.01 K', '300 K'], answer: 2,
                why: 'About 10 millikelvin, 0.01 K. 4 K is liquid-helium temperature, one of the upper plates.'},
            {type: 'quiz', q: 'Why are there attenuators on the cables at every plate?',
                options: ['TO SAVE POWER', 'TO STOP WARM NOISE FROM REACHING THE QUBIT', 'TO HOLD THE PLATES'], answer: 1,
                why: 'Each stage absorbs part of the signal together with the thermal noise from warmer stages, so the qubit only sees the cold end.'},
        ],
    },
    {
        id: 'ions', world: 7, title: 'TRAPPED IONS AND LASERS', code: '44_ions',
        refs: ['bruzewicz2019', 'cirac1995', 'paul1990', 'wineland1978'],
        steps: [
            {type: 'text', title: 'ATOMS ON A STRING', body:
                'An ion is an atom with an electron missing, so electric fields can hold it. A PAUL TRAP (Paul\'s Nobel lecture, 1990) uses fast-oscillating fields to hold a line of ions in an ultra-high vacuum.\n' +
                'Two internal energy levels of each ion are its |0> and |1>. Nature makes every ion of a kind identical.',
                pic: 'iontrap',
                eli5: 'Single atoms floating in empty space, held in a line by wiggling electric fields, like beads on an invisible string.'},
            {type: 'text', title: 'LASERS DO EVERYTHING', body:
                'Lasers COOL the ions until they barely move (laser cooling of trapped ions: Wineland, Drullinger and Walls, 1978).\n' +
                'Laser (or microwave) pulses rotate each qubit: a "π pulse" flips |0> to |1>, a "π/2 pulse" makes an even superposition.\n' +
                'Two-qubit gates use the ions\' shared motion (Cirac and Zoller, 1995).\n' +
                'Readout: one state glows under a laser, the other stays dark, and a camera sees which.',
            eli5: 'Lasers slow the atoms down, flip their qubits, tie them together through their wobble, and make the "1" atoms light up so a camera can read them.'},
            {type: 'circuit', goal: 'FLIP THE ION FROM |0> TO |1> WITH LASER PULSES. P IS A π/2 PULSE.', qubits: 1,
                boxes: {P: [['H', 0], ['S', 0], ['H', 0]]}, gates: ['P'], par: 2,
                solution: [['P'], ['P']], hint: 'Two half flips make a whole flip.',
                eli5: 'One pulse tips the arrow half way down, to the side. A second pulse tips it the rest of the way.'},
            {type: 'quiz', q: 'In fluorescence readout, the camera tells the states apart by...',
                options: ['THE ION\'S COLOUR', 'WHETHER THE ION GLOWS', 'THE ION\'S WEIGHT'], answer: 1,
                why: 'One qubit state scatters the readout laser light (bright), the other does not (dark).'},
            {type: 'quiz', q: 'How are two ions in a chain entangled?',
                options: ['THROUGH THEIR SHARED MOTION', 'BY TOUCHING', 'THROUGH THE VACUUM PUMP'], answer: 0,
                why: 'The ions repel each other, so they move together; laser pulses use that common motion as a bus.'},
        ],
    },
    {
        id: 'photons', world: 7, title: 'OPTICS AND PHOTONS', code: '45_photons',
        refs: ['kok2007', 'klm2001', 'reck1994', 'hom1987'],
        steps: [
            {type: 'text', title: 'QUBITS OF LIGHT', body:
                'A single photon can carry a qubit in its POLARIZATION (horizontal |0>, vertical |1>) or in its PATH: which of two beams it travels in.\n' +
                'Optics does one-qubit gates: wave plates turn polarization, BEAM SPLITTERS and PHASE SHIFTERS mix and twist paths. A mesh of beam splitters can make any unitary on many paths (Reck et al., 1994).',
            eli5: 'A photon is a tiny packet of light. Which way it wiggles, or which road it takes, can be its 0 or 1. Glass pieces like half-mirrors are its gates.'},
            {type: 'text', title: 'THE MACH-ZEHNDER', body:
                'A 50/50 beam splitter acts on the two paths as\n' +
                '  B = 1/√2 [1 I]\n' +
                '           [I 1]\n' +
                'Two of them with mirrors make an interferometer. With equal arms B·B = I·X: the photon ALWAYS leaves by the other port. A phase in one arm changes where it goes.',
                pic: 'mzi',
                eli5: 'Split a photon in two with a half-mirror, let both halves travel, and join them at a second half-mirror. Like the H H trick, the halves interfere and choose one exit.'},
            {type: 'circuit', goal: 'THE TWO BEAM SPLITTERS (GREY) ARE FIXED. MAKE THE PHOTON REACH D0 EVERY TIME.', qubits: 1,
                boxes: {B: [['H', 0], ['SDG', 0], ['H', 0]], P: [['Z', 0]], Q: [['S', 0]]},
                setup: [['B']], after: [['B']], gates: ['P', 'Q'], par: 1,
                solution: [['P']], hint: 'P adds a half-wave (π) phase in the lower arm. Q adds a quarter wave.',
                eli5: 'Without anything in the arms, the photon always picks exit D1. Delay one arm by half a wave and the halves meet the other way round.'},
            {type: 'circuit', goal: 'NOW MAKE BOTH DETECTORS CLICK HALF OF THE TIME.', qubits: 1,
                boxes: {B: [['H', 0], ['SDG', 0], ['H', 0]], P: [['Z', 0]], Q: [['S', 0]]},
                setup: [['B']], after: [['B']], gates: ['P', 'Q'], par: 1, probsOnly: true,
                solution: [['Q']], hint: 'A quarter-wave phase sits half way between "always D1" and "always D0".',
                eli5: 'Half way between the two extremes is a 50/50 split.'},
            {type: 'text', title: 'THE HARD PART', body:
                'Photons barely interact, which keeps them coherent over long distances at room temperature: ideal flying qubits. But two-qubit gates are hard. Knill, Laflamme and Milburn (2001) showed that single photons, beam splitters, phase shifters and detectors are enough, using measurement to make probabilistic gates.\n' +
                'Two identical photons meeting at a beam splitter always leave TOGETHER (Hong, Ou and Mandel, 1987).',
            eli5: 'Light beams pass through each other without noticing. That is great for sending qubits far away, but it makes "tying two qubits together" tricky.'},
            {type: 'quiz', q: 'What is the main source of errors for photonic qubits?',
                options: ['HEAT FLIPS', 'LOSING THE PHOTON', 'THE PHOTONS COLLIDING'], answer: 1,
                why: 'A photon absorbed or scattered away is simply gone. Photons hardly ever interact, and do not need cooling to stay coherent.'},
        ],
    },
    {
        id: 'atoms', world: 7, title: 'NEUTRAL ATOMS', code: '46_atoms',
        refs: ['saffman2010', 'jaksch2000', 'endres2016', 'ashkin1986'],
        steps: [
            {type: 'text', title: 'ATOMS HELD BY LIGHT', body:
                'A tightly focused laser beam traps a small particle at its focus: OPTICAL TWEEZERS (Ashkin et al., 1986). Many tweezers hold a grid of single cold atoms in vacuum.\n' +
                'Each tweezer catches an atom only about half of the time, so a camera looks, and moving tweezers rearrange the atoms into a gap-free array (Endres et al., 2016).',
                pic: 'tweezers',
                eli5: 'Beams of light act like tiny tweezers that each hold one atom. Some tweezers come up empty, so other tweezers slide atoms over to fill the holes.'},
            {type: 'text', title: 'RYDBERG GATES', body:
                'For a two-qubit gate a laser lifts atoms into a RYDBERG state: an electron in a huge orbit. Two nearby Rydberg atoms push each other\'s energy away, so only one of them can be excited at a time (the RYDBERG BLOCKADE).\n' +
                'That blockade gives a controlled phase gate, a CZ (Jaksch et al., 2000; review: Saffman, Walker, Mølmer, 2010).',
            eli5: 'Puff an atom up into a giant balloon and its neighbour cannot puff up too. That "only one balloon" rule is used as a guarded gate.'},
            {type: 'circuit', goal: 'THE ATOMS GIVE YOU CZ. BUILD A CNOT FROM Q0 TO Q1 OUT OF CZ AND H.', qubits: 2,
                setup: [['H', 0], ['T', 0], ['H', 0], ['X', 0]], gates: ['H', 'CZ'], par: 3,
                solution: [['H', 1], ['CZ', 0, 1], ['H', 1]], hint: 'H on the target turns a phase flip into a bit flip: H Z H = X.',
                eli5: 'CZ flips a hidden sign. Wrap the target in two H gates and the hidden sign flip becomes a real flip.'},
            {type: 'quiz', q: 'Why do neutral-atom machines rearrange atoms after loading?',
                options: ['TO COOL THEM', 'EACH TWEEZER LOADS ONLY ABOUT HALF OF THE TIME', 'TO MEASURE THEM'], answer: 1,
                why: 'Loading is random, so the empty spots are filled by moving atoms with extra tweezers.'},
        ],
    },
    {
        id: 'spins', world: 7, title: 'SPINS IN SILICON', code: '47_spins',
        refs: ['loss1998', 'burkard2023'],
        steps: [
            {type: 'text', title: 'ONE ELECTRON, ONE QUBIT', body:
                'Loss and DiVincenzo (1998): trap single electrons in QUANTUM DOTS, tiny boxes made by voltages on gate electrodes, and use each electron\'s SPIN as a qubit. In a magnetic field spin up and spin down have different energies: |0> and |1>.\n' +
                'Two-qubit gates come from lowering the barrier between neighbouring dots so the electrons\' spins interact (the exchange interaction).',
                pic: 'spin',
                eli5: 'An electron is like a tiny spinning magnet. Point up is 0, point down is 1. Little metal fingers on a chip hold each electron in place.'},
            {type: 'text', title: 'WHY SILICON', body:
                'Spin qubits are built with the same kind of fabrication as computer chips, and each qubit is tiny, so very many could fit on one chip (review: Burkard et al., 2023).\n' +
                'They need a cryostat and very pure materials; controlling many of them precisely is the current challenge.',
            eli5: 'If qubits can be made in a chip factory, we might one day make millions of them, like the transistors in your phone.'},
            {type: 'quiz', q: 'What makes spin up and spin down have different energies?',
                options: ['A MAGNETIC FIELD', 'GRAVITY', 'THE VACUUM'], answer: 0,
                why: 'A magnetic field splits the two spin states (the Zeeman effect); microwave pulses at that frequency flip the spin.'},
            {type: 'quiz', q: 'Which platform keeps qubits coherent at room temperature on its way through a fibre?',
                options: ['SPINS IN SILICON', 'TRANSMONS', 'PHOTONS'], answer: 2,
                why: 'Photons: that is why they are the qubits of choice for quantum networks.'},
        ],
    },
);
