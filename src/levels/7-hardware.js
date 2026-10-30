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
        id: 'chip', world: 7, title: 'THE QUBIT CHIP', code: '43_chip',
        refs: ['krantz2019', 'kjaergaard2020', 'dolan1977', 'place2021'],
        steps: [
            {type: 'text', title: 'WHAT IT IS MADE OF', body:
                'The chip is a polished slice of very pure silicon or of sapphire. On it lies a thin film of a superconducting metal, usually aluminium, niobium or tantalum, patterned like a printed circuit: capacitor pads, wires, resonators, control lines.\n' +
                'The substrate must insulate perfectly and absorb almost no microwaves: every bit of loss in the materials shortens the qubit\'s life.',
            eli5: 'The chip is a tiny, super-clean slab of crystal with a pattern of special metal drawn on it, like a very small, very cold circuit board.'},
            {type: 'text', title: 'THE JOSEPHSON JUNCTION', body:
                'The junction is a sandwich: aluminium, a very thin barrier of aluminium oxide, aluminium again (Al/AlOx/Al). Cooper pairs of electrons tunnel through the barrier.\n' +
                'It is made by evaporating aluminium at two angles through a mask that hangs above the chip on a small bridge (Dolan, 1977), letting in oxygen in between so that the first layer grows its oxide.',
                pic: 'junction',
                eli5: 'Two strips of metal overlap with a wall only a few atoms thick between them. The electron pairs sneak through the wall, and that sneaking is what makes the qubit work.'},
            {type: 'text', title: 'WHERE THE LOSS HIDES', body:
                'Most of a qubit\'s energy loss happens at surfaces and interfaces: thin native oxides, residues and defects that absorb microwave energy.\n' +
                'Place et al. (2021) replaced niobium by tantalum, whose oxide is less lossy, and measured transmon lifetimes T1 above 0.3 ms.\n' +
                'The finished chip is glued into a metal package and wire-bonded to a circuit board with coaxial connectors.',
            eli5: 'Dirt and rust on the surfaces "eat" the qubit\'s energy. Cleaner surfaces and better metals make it last longer.'},
            {type: 'quiz', q: 'The barrier inside the Josephson junction is made of...',
                options: ['COPPER', 'ALUMINIUM OXIDE', 'SILICON', 'GOLD'], answer: 1,
                why: 'A very thin film of aluminium oxide between two aluminium layers: Al/AlOx/Al.'},
            {type: 'quiz', q: 'Why did tantalum improve the qubits of Place et al.?',
                options: ['IT IS HEAVIER', 'ITS SURFACE OXIDE LOSES LESS ENERGY', 'IT IS MAGNETIC'], answer: 1,
                why: 'Losses come mostly from surfaces; tantalum\'s oxide absorbs less microwave energy than niobium\'s.'},
        ],
    },
    {
        id: 'fridge', world: 7, title: 'THE DILUTION FRIDGE', code: '44_fridge',
        refs: ['krinner2019', 'pobell2007', 'radebaugh2009', 'dewit2019'],
        steps: [
            {type: 'text', title: 'COLDER THAN SPACE', body:
                'Superconducting qubits sit in a DILUTION REFRIGERATOR at about 0.01 K, a hundredth of a degree above absolute zero. Space itself is about 2.7 K.\n' +
                'Stacked plates get colder from top to bottom. The chip hangs at the bottom, below the mixing chamber.',
                pic: 'fridge',
                eli5: 'The qubit chip lives at the bottom of a big golden chandelier. Each floor is colder than the one above, and the bottom is colder than outer space.'},
            {type: 'text', title: 'WHY SO COLD', body:
                'A 5 GHz qubit has an energy of h·f, which matches the heat energy k·T at only about 0.24 K. At room temperature heat would flip the qubit at random all the time; at 0.01 K the chance of a heat flip is tiny.\n' +
                'The metals must also be superconducting, which needs low temperatures.',
            eli5: 'Heat is jiggling. The qubit\'s 0 and 1 are so close in energy that any warmth jiggles it between them. Very cold means very still.'},
            {type: 'text', title: 'THE CAN AND THE SHIELDS', body:
                'Everything hangs inside a vacuum can: with the air pumped out, no gas carries heat in. Nested shields around the colder plates stop heat RADIATION, which grows like T^4:\n' +
                '  300 K WALL: ~460 W PER M^2\n' +
                '  4 K WALL:   ~15 µW PER M^2\n' +
                'So each cold part only "sees" surfaces that are almost as cold as itself.',
                pic: 'shields',
                eli5: 'Like Russian dolls: a can inside a can inside a can, each colder than the last, so warm light from the room never reaches the middle.'},
            {type: 'text', title: 'THE PULSE TUBE', body:
                'The upper plates are cooled by a PULSE-TUBE cryocooler: a compressor in the room pushes helium gas back and forth through a regenerator and a tube. Its cold end has no moving parts, so it shakes little and lasts long (Radebaugh). Its two stages reach about 50 K and about 4 K.\n' +
                'Its rhythmic pumping still shakes the fridge a little; sensitive experiments isolate that vibration (de Wit et al., 2019).',
            eli5: 'A machine in the room squeezes and relaxes helium gas like a pump, and that gas carries heat away from the top floors.'},
            {type: 'text', title: 'THE PLATES', body:
                'The plates are thick discs of very pure, oxygen-free copper, which carries heat well even when cold, usually gold-plated so that no oxide spoils the thermal contact at joints (Pobell). Supports between the plates are thin and made of poor heat conductors, so little heat leaks down.\n' +
                'Cables, attenuators and amplifiers are clamped to the plate whose temperature they need.',
            eli5: 'Copper floors spread the cold evenly. Gold keeps them from rusting where they touch. The legs between the floors are thin so warmth cannot climb down.'},
            {type: 'quiz', q: 'Roughly how cold is the mixing chamber where the chip sits?',
                options: ['4 K', '1 K', '0.01 K', '300 K'], answer: 2,
                why: 'About 10 millikelvin, 0.01 K. 4 K is the second pulse-tube stage.'},
            {type: 'quiz', q: 'What are the radiation shields for?',
                options: ['MAGNETIC FIELDS', 'HEAT RADIATION FROM WARMER PARTS', 'HOLDING THE PLATES'], answer: 1,
                why: 'Warm surfaces glow in the infrared (σT^4). Each shield is cold, so the parts inside only see cold surfaces.'},
            {type: 'quiz', q: 'Why are the copper plates often gold-plated?',
                options: ['TO LOOK GOOD', 'SO NO OXIDE SPOILS THE THERMAL CONTACT', 'GOLD IS A SUPERCONDUCTOR'], answer: 1,
                why: 'Copper oxide conducts heat poorly; gold does not oxidize, so joints stay good. (Gold is not a superconductor.)'},
        ],
    },
    {
        id: 'dilution', world: 7, title: 'HELIUM DILUTION', code: '45_dilution', origin: 'london1962',
        refs: ['london1962', 'pobell2007'],
        steps: [
            {type: 'text', title: 'TWO KINDS OF HELIUM', body:
                'Helium-4 is the common kind; helium-3 is a rare, lighter isotope. Cool a mixture of the two below about 0.87 K and it separates, like oil and water: a helium-3-RICH phase floats on top of a helium-3-POOR (dilute) phase.\n' +
                'Even at absolute zero the dilute phase keeps about 6.6% helium-3. That fact is what makes the dilution refrigerator work (proposed by London, Clarke and Mendoza, 1962).',
                pic: 'dilution',
                eli5: 'Two kinds of helium that, when very cold, sit in two layers like oil on water. The bottom layer always wants a little of the top kind mixed in.'},
            {type: 'text', title: 'HOW THE COOLING WORKS', body:
                'In the MIXING CHAMBER helium-3 is drawn from the rich phase across the boundary into the dilute phase. Crossing costs energy, which it takes as heat from its surroundings, much like evaporation.\n' +
                'With good heat exchangers the cooling power is about\n' +
                '  Q ≈ 84 · n · T^2 WATTS\n' +
                'for n moles of helium-3 per second at temperature T (Pobell): it falls fast as T drops.',
            eli5: 'When the top kind of helium dives into the bottom layer it needs energy, so it steals heat. Stealing heat means cooling.'},
            {type: 'text', title: 'THE STILL AND THE LOOP', body:
                'The dilute phase connects up to the STILL, held below 1 K and gently heated. There helium-3 evaporates far more readily than helium-4, so pumping on the still removes almost pure helium-3 and keeps helium-3 flowing out of the mixing chamber.\n' +
                'Pumps at room temperature compress it, cold traps clean it, the 4 K stage and a flow impedance help condense it, and heat exchangers cool it on its way back down: a closed loop.',
            eli5: 'A pump keeps sucking the special helium out of the bottom layer and puts it back on top, round and round, and every round steals a little more heat.'},
            {type: 'text', title: 'HEAT EXCHANGERS', body:
                'Near millikelvin temperatures heat hardly crosses from a metal into liquid helium: the KAPITZA boundary resistance grows like 1/T^3.\n' +
                'So the coldest heat exchangers are SINTERED SILVER: very fine silver powder pressed and baked into a sponge with an enormous inner surface, to give the heat enough area to cross (Pobell).',
            eli5: 'At very low temperatures heat is shy about jumping from metal into the liquid. A metal sponge with a huge hidden surface gives it many places to jump.'},
            {type: 'quiz', q: 'Even at absolute zero, the dilute phase still holds about how much helium-3?',
                options: ['0%', 'ABOUT 6.6%', '50%', '100%'], answer: 1,
                why: 'About 6.6%. That finite solubility is why helium-3 keeps crossing into it, and so the cooling keeps working down to millikelvin.'},
            {type: 'quiz', q: 'If the mixing chamber is twice as cold, its cooling power (same flow) is...',
                options: ['TWICE AS BIG', 'THE SAME', 'A QUARTER'], answer: 2,
                why: 'Q is about 84·n·T^2, so halving T divides Q by 4.'},
            {type: 'quiz', q: 'Why are the coldest heat exchangers made of sintered silver?',
                options: ['SILVER IS CHEAP', 'A HUGE SURFACE AGAINST THE KAPITZA RESISTANCE', 'SILVER IS A SUPERCONDUCTOR'], answer: 1,
                why: 'The boundary resistance grows like 1/T^3, so only an enormous contact area lets enough heat across.'},
        ],
    },
    {
        id: 'wiring', world: 7, title: 'WIRES, FILTERS, SHIELDS', code: '46_wiring',
        refs: ['krinner2019', 'krantz2019', 'macklin2015', 'barends2011'],
        steps: [
            {type: 'text', title: 'A WIRE IS A HEAT LEAK', body:
                'Every cable from the room into the fridge carries heat down. Control (drive) lines use coax of stainless steel or similar alloys, which conduct heat poorly. Output lines below 4 K use superconducting niobium-titanium (NbTi) coax: microwaves pass with little loss, heat hardly at all (Krinner et al., 2019).\n' +
                'Each line is clamped to every plate it passes.',
                pic: 'wiring',
                eli5: 'Wires are like straws for heat. So the fridge uses wires made of metals that let very little heat through.'},
            {type: 'text', title: 'ATTENUATORS', body:
                'A room-temperature cable also carries thermal noise: at 5 GHz about kT/hf ≈ 1250 noise photons per mode. An attenuator clamped to a plate absorbs most of the signal AND that noise, and adds only the much smaller noise of its own cold plate.\n' +
                'Spread over the plates, about 60 dB of attenuation (a factor of a million) brings the noise at the qubit far below one photon. The control pulses are simply sent stronger.',
            eli5: 'The control wire is too "loud" with warm noise. Turning the volume down on every floor quiets the noise, and you just shout the real message louder.'},
            {type: 'text', title: 'THE WAY OUT', body:
                'Readout signals are tiny. On the way up they pass CIRCULATORS and ISOLATORS, one-way microwave devices that stop amplifier noise from flowing back down to the qubits, then a near quantum-limited Josephson parametric amplifier (TWPA, Macklin et al., 2015) and a HEMT transistor amplifier on the 4 K plate (Krantz et al., 2019).',
            eli5: 'The answer from the qubit is a whisper. One-way doors keep noise from going down, and two amplifiers turn the whisper into something the room can hear.'},
            {type: 'text', title: 'STRAY LIGHT', body:
                'Even infrared light leaking in hurts: absorbed in the superconductor it breaks Cooper pairs into QUASIPARTICLES that steal energy from qubits. Aluminium absorbs most of the radiation of a 4 K surface.\n' +
                'Light-tight sample boxes with black absorbing coatings remove the effect (Barends et al., 2011).',
            eli5: 'Even invisible warm light is too much. The chip lives in a sealed black box.'},
            {type: 'quiz', q: 'Why are drive lines made of stainless steel?',
                options: ['IT IS SUPERCONDUCTING', 'IT CONDUCTS HEAT POORLY', 'IT IS MAGNETIC'], answer: 1,
                why: 'Poor heat conduction keeps the heat load on the cold plates small. Below 4 K the output lines use superconducting NbTi.'},
            {type: 'quiz', q: 'An attenuator on the 4 K plate receives room-temperature noise. It passes on...',
                options: ['ALL OF IT', 'A SMALL PART, PLUS ITS OWN 4 K NOISE', 'NOTHING AT ALL'], answer: 1,
                why: 'It absorbs most of the incoming noise and emits thermal noise at its own, much lower temperature.'},
            {type: 'quiz', q: 'What do circulators and isolators do on the output line?',
                options: ['COOL THE SIGNAL', 'LET MICROWAVES PASS ONE WAY ONLY', 'MEASURE THE QUBIT'], answer: 1,
                why: 'They are non-reciprocal: the signal goes up, amplifier noise cannot come back down.'},
        ],
    },
    {
        id: 'readout', world: 7, title: 'CONTROL AND READOUT', code: '47_readout',
        refs: ['krantz2019', 'motzoi2009', 'macklin2015'],
        steps: [
            {type: 'text', title: 'PLAYING THE QUBIT', body:
                'Room-temperature electronics shape every gate: an arbitrary waveform generator draws the pulse envelope, and an IQ mixer moves it up to the qubit frequency of a few GHz.\n' +
                'The shape matters. A smooth pulse plus a correction proportional to its derivative (DRAG, Motzoi et al., 2009) stops the transmon from leaking into its third level |2>.',
            eli5: 'A computer draws the shape of each microwave "note", and a mixer moves it to the right pitch. A clever shape stops the qubit from slipping to a third step.'},
            {type: 'text', title: 'DISPERSIVE READOUT', body:
                'Each qubit is coupled to a READOUT RESONATOR whose frequency shifts slightly up or down depending on whether the qubit is 0 or 1. A short microwave tone at the resonator comes back with a different phase and size for 0 and 1.\n' +
                'Plotted in the IQ plane, every shot lands in one of two clouds; a line between them decides. A Purcell filter stops the qubit from leaking its energy out through the readout line.',
                pic: 'readout',
                eli5: 'The qubit slightly changes the "ring" of a little bell next to it. Ping the bell and listen: one kind of ring means 0, the other means 1.'},
            {type: 'text', title: 'FROM WAVES TO BITS', body:
                'The returning tone is amplified (parametric amplifier, HEMT, room-temperature amplifiers), mixed back down, digitized, integrated over the readout time and compared with the threshold.\n' +
                'Longer readout or better amplifiers separate the two clouds more, so fewer shots are read wrong.',
            eli5: 'The faint answer is made louder, turned into numbers, and a computer checks which side of the line it falls on.'},
            {type: 'quiz', q: 'What does the DRAG correction prevent?',
                options: ['HEATING', 'LEAKAGE INTO THE LEVEL |2>', 'MEASUREMENT'], answer: 1,
                why: 'The transmon is only weakly anharmonic, so a sharp pulse would also drive 1 → 2. DRAG cancels that.'},
            {type: 'quiz', q: 'In dispersive readout, what reveals the qubit state?',
                options: ['THE RESONATOR\'S RESPONSE', 'THE CHIP\'S TEMPERATURE', 'A CAMERA'], answer: 0,
                why: 'The qubit shifts the resonator frequency, which changes the phase and amplitude of the reflected tone.'},
        ],
    },
    {
        id: 'ions', world: 7, title: 'TRAPPED IONS AND LASERS', code: '48_ions',
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
        id: 'iontrap', world: 7, title: 'ION TRAP HARDWARE', code: '49_iontrap',
        refs: ['olmschenk2007', 'haffner2008', 'sorensen1999', 'kielpinski2002', 'bruzewicz2019'],
        steps: [
            {type: 'text', title: 'CHOOSING AN ION', body:
                'YTTERBIUM-171 stores its qubit in two hyperfine levels of its ground state, 12.6 GHz apart. Laser light at 369.5 nm cools the ion and reads it out: |1> scatters the light and glows, |0> stays dark. Olmschenk et al. (2007) measured a coherence time of 2.5 s for this qubit.\n' +
                'CALCIUM-40 is used with an "optical" qubit: the ground level and a long-lived excited level, driven by a 729 nm laser (Häffner, Roos, Blatt 2008).',
                pic: 'ionlevels',
                eli5: 'Each kind of atom has its own ladder of energy steps. Scientists pick an atom whose two steps hold a qubit for a long time and can be read with a laser.'},
            {type: 'text', title: 'THE TRAP', body:
                'Electrodes carry a radio-frequency voltage plus static voltages. The fast-changing saddle-shaped field cannot hold a charge still at any one instant, but on average it pushes the ion back to the centre.\n' +
                'Modern traps are chips with the electrodes on their surface, inside an ultra-high vacuum chamber so that no stray gas atom knocks the ions (Bruzewicz et al., 2019).',
            eli5: 'A saddle that keeps flipping its shape very fast: a marble on it would roll off a still saddle, but on the flipping one it stays in the middle.'},
            {type: 'text', title: 'GATES AND SCALE', body:
                'One-qubit gates use microwaves or pairs of laser beams. The two-qubit MØLMER-SØRENSEN gate (1999) uses two laser frequencies to push the ions\' shared motion around a closed loop: the ions end up entangled and the motion returns to where it was, so the gate works even while the ions still jiggle a little.\n' +
                'Larger machines move ions between zones of a chip: the QCCD design (Kielpinski, Monroe, Wineland 2002).',
            eli5: 'Lasers give the ion string a gentle push that goes round in a circle and comes back. On the way, the ions get tied together.'},
            {type: 'quiz', q: 'In ytterbium-171, how are |0> and |1> told apart?',
                options: ['BY THEIR WEIGHT', '|1> GLOWS UNDER 369.5 NM LIGHT, |0> STAYS DARK', 'BY THEIR CHARGE'], answer: 1,
                why: 'State-dependent fluorescence: only one of the two hyperfine levels scatters the detection laser.'},
            {type: 'quiz', q: 'Why does the Mølmer-Sørensen gate tolerate warm ions?',
                options: ['THE MOTION RETURNS TO ITS START', 'IT NEEDS NO LASERS', 'IT COOLS THE IONS'], answer: 0,
                why: 'The motion is only borrowed: it goes round a closed loop, so its starting state does not matter.'},
        ],
    },
    {
        id: 'photons', world: 7, title: 'OPTICS AND PHOTONS', code: '50_photons',
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
        id: 'photonhw', world: 7, title: 'PHOTON SOURCES, DETECTORS', code: '51_photonhw',
        refs: ['kwiat1995', 'senellart2017', 'goltsman2001', 'marsili2013', 'carolan2015'],
        steps: [
            {type: 'text', title: 'MAKING SINGLE PHOTONS', body:
                'Shine a laser into a NONLINEAR CRYSTAL and once in a while one pump photon splits into two (spontaneous parametric down-conversion), keeping the energy:\n' +
                '  1/λ PUMP = 1/λ1 + 1/λ2\n' +
                'Kwiat et al. (1995) made polarization-entangled pairs this way. Detecting one photon of a pair HERALDS the other. Semiconductor QUANTUM DOTS can emit one photon at a time on demand (review: Senellart, Solomon, White 2017).',
                pic: 'spdc',
                eli5: 'A special crystal sometimes splits one light particle into two twins. Catch one twin and you know its sibling is on its way.'},
            {type: 'text', title: 'COUNTING PHOTONS', body:
                'A superconducting nanowire single-photon detector (SNSPD) is a wire a few nanometres thick, cooled below its superconducting temperature and carrying a current just below the critical one. An absorbed photon makes a small normal "hot spot" that blocks the current: a click.\n' +
                'Gol\'tsman et al. (2001): a niobium nitride strip 0.2 µm wide at 4.2 K. Tungsten silicide detectors reached 93% system efficiency at 1550 nm (Marsili et al., 2013).',
                pic: 'snspd',
                eli5: 'A super-thin wire that is cold and carrying as much current as it can. One photon warms a tiny spot, the current stumbles, and that stumble is the click.'},
            {type: 'text', title: 'PHOTONIC CHIPS', body:
                'Instead of mirrors on a table, WAVEGUIDES etched into a chip guide the light. Meshes of Mach-Zehnder interferometers with heated phase shifters can be programmed into any linear-optics circuit: Carolan et al. (2015) put 15 interferometers and 30 thermo-optic phase shifters on one chip.',
            eli5: 'All the mirrors and half-mirrors shrunk onto one chip, with tiny heaters to tune them.'},
            {type: 'quiz', q: 'A 405 nm pump photon splits into two equal photons. Their wavelength is...',
                options: ['202.5 NM', '405 NM', '810 NM'], answer: 2,
                why: '1/405 = 1/λ + 1/λ gives λ = 810 nm: each daughter has half the energy, so twice the wavelength.'},
            {type: 'quiz', q: 'A 10-photon experiment with detectors of efficiency 0.93: chance all 10 click?',
                options: ['ABOUT 93%', 'ABOUT 48%', 'ABOUT 9%'], answer: 1,
                why: '0.93^10 ≈ 0.48. With 20% detectors it would be 0.2^10 ≈ 1 in 10 million: efficiency is everything.'},
        ],
    },
    {
        id: 'atoms', world: 7, title: 'NEUTRAL ATOMS', code: '52_atoms',
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
        id: 'atomhw', world: 7, title: 'ATOM ARRAY HARDWARE', code: '53_atomhw',
        refs: ['raab1987', 'endres2016', 'barredo2016', 'evered2023', 'saffman2010'],
        steps: [
            {type: 'text', title: 'FIRST, A COLD CLOUD', body:
                'A MAGNETO-OPTICAL TRAP (Raab et al., 1987): three pairs of counter-propagating laser beams tuned just below an atomic resonance, plus a weak magnetic field gradient from two coils, slow atoms from a vapour and gather them in the middle. Their sodium cloud was below a millikelvin and under 0.5 mm across.',
                pic: 'mot',
                eli5: 'Six laser beams push atoms from all sides, like a crowd gently shoving towards the middle, and the atoms slow down until they are very cold.'},
            {type: 'text', title: 'FILLING THE TWEEZERS', body:
                'Tweezers focused into the cloud catch atoms. Light-assisted collisions throw out pairs, so each tweezer ends up with exactly 0 or 1 atom.\n' +
                'Endres et al. (2016) made 100 tweezers with an ACOUSTO-OPTIC DEFLECTOR, imaged the atoms, then steered moving tweezers to fill the gaps: the occupation rose from about 0.6 to 0.988, over 50 atoms in under 0.4 s. Barredo et al. (2016) did it in two dimensions.',
            eli5: 'Each light tweezer grabs either nothing or exactly one atom. A camera checks, and a moving tweezer slides atoms into the empty places.'},
            {type: 'text', title: 'GOOD GATES', body:
                'Rydberg CZ gates on neutral atoms now reach 99.5% fidelity, done in parallel on up to 60 atoms (Evered et al., 2023), better than the threshold of the surface code.\n' +
                'Atoms can also be moved during a computation, which lets any atom meet any other.',
            eli5: 'The two-atom "tie them together" move now works 995 times out of 1000, good enough for error correction.'},
            {type: 'quiz', q: 'Which ingredients make a magneto-optical trap?',
                options: ['ELECTRODES AND RF VOLTAGE', 'LASER BEAMS AND A MAGNETIC FIELD GRADIENT', 'A DILUTION FRIDGE'], answer: 1,
                why: 'Three pairs of beams plus a weak quadrupole magnetic field, as in Raab et al. (1987).'},
            {type: 'quiz', q: 'After loading, a tweezer holds...',
                options: ['MANY ATOMS', 'EXACTLY 0 OR 1 ATOM', 'ALWAYS 1 ATOM'], answer: 1,
                why: 'Collisions remove pairs, so it is 0 or 1, roughly at random: hence the rearranging.'},
        ],
    },
    {
        id: 'spins', world: 7, title: 'SPINS IN SILICON', code: '54_spins',
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
    {
        id: 'spinhw', world: 7, title: 'SPIN QUBIT DEVICES', code: '55_spinhw',
        refs: ['tyryshkin2012', 'elzerman2004', 'veldhorst2015', 'burkard2023'],
        steps: [
            {type: 'text', title: 'QUIET SILICON', body:
                'Natural silicon contains some silicon-29, whose nuclei are tiny magnets that disturb electron spins. Purifying the crystal to silicon-28 removes them: in silicon with less than 50 ppm of silicon-29, donor electron spins stayed coherent for up to 2 s (Tyryshkin et al., 2012).',
            eli5: 'Some silicon atoms are little magnets that jostle the electron. Using only the non-magnetic kind of silicon makes the electron\'s home very quiet.'},
            {type: 'text', title: 'READING ONE SPIN', body:
                'A single spin is read by turning spin into CHARGE: the dot is tuned so that only a spin-up electron has enough energy to tunnel out to a nearby reservoir. A charge sensor next to the dot notices when the electron leaves.\n' +
                'Elzerman et al. (2004) read a single electron spin this way in one shot.',
            eli5: 'Only an "up" electron can jump out of its box. A tiny detector next to the box notices if the box suddenly became empty.'},
            {type: 'text', title: 'TWO QUBITS IN SILICON', body:
                'Veldhorst et al. (2015) made the first two-qubit logic gate in silicon: two spins in isotopically enriched silicon, coupled by the exchange interaction between neighbouring quantum dots.\n' +
                'Since the devices are made like transistors, the hope is to put very many on one chip (Burkard et al., 2023).',
            eli5: 'Two electrons in neighbouring boxes are allowed to "talk" for a moment, and that conversation is the two-qubit gate.'},
            {type: 'quiz', q: 'Why purify silicon to silicon-28?',
                options: ['IT IS CHEAPER', 'IT HAS NO NUCLEAR SPINS TO DISTURB THE QUBIT', 'IT CONDUCTS BETTER'], answer: 1,
                why: 'Silicon-28 nuclei have no spin; silicon-29 nuclei do, and their random magnetism dephases the electron spin.'},
            {type: 'quiz', q: 'In spin-to-charge readout, the charge sensor detects...',
                options: ['A PHOTON', 'AN ELECTRON LEAVING THE DOT', 'THE TEMPERATURE'], answer: 1,
                why: 'Only spin-up can tunnel out, so a change of charge reveals the spin.'},
        ],
    },
);
