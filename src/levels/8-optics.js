// World 8: lasers and optics: how a laser works, polarization qubits and wave plates,
// interferometers and photonic hardware, laser cooling, trapped ions and neutral atoms,
// which are all held, cooled, driven and read with light.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.LEVELS.push(
    {
        id: 'laser', world: 8, title: 'HOW A LASER WORKS', code: '50_laser',
        refs: ['einstein1917', 'schawlow1958', 'maiman1960'],
        steps: [
            {type: 'text', title: 'LIGHT FROM ATOMS', body:
                'An atom in an excited level can drop to a lower one and give out a photon of energy E2 - E1 = hν. It can happen by itself, at a random time and in a random direction (SPONTANEOUS EMISSION), or be triggered by a passing photon of the same energy (STIMULATED EMISSION, Einstein 1917): the new photon is a copy of the first, with the same direction, frequency, phase and polarization.\n' +
                '>Stimulated emission is the SE in LASER: light amplification by stimulated emission of radiation.',
                pic: 'laser',
                eli5: 'An excited atom is like a full bucket. A passing photon can tip it over, and what pours out moves exactly in step with the photon that tipped it.'},
            {type: 'text', title: 'POPULATION INVERSION', body:
                'A photon can also be absorbed and lift an atom up. Light grows only if more atoms are up than down: a POPULATION INVERSION. In thermal equilibrium that never happens:\n' +
                '  N2 / N1 = exp(-hν / kT)\n' +
                'For red light (633 nm) at room temperature this is about 10^-33. So a laser is PUMPED: a flash lamp, an electric current or another laser keeps putting energy in, usually through a third level, so that more atoms are up than down.',
            eli5: 'Normally almost every atom rests at the bottom. A laser keeps pushing them up, so more are ready to give light than to soak it up.'},
            {type: 'text', title: 'THE MIRRORS', body:
                'The gain medium sits between two mirrors, an OPTICAL RESONATOR (proposed for light by Schawlow and Townes, 1958). Light running back and forth grows on every pass; one mirror lets a few percent out as the beam.\n' +
                'Only waves that fit a whole number of half wavelengths between the mirrors survive, so the beam is very pure in colour and very straight.\n' +
                'Maiman built the first laser in 1960: a ruby rod pumped by a flash lamp, shining red at 694.3 nm.',
            eli5: 'Two mirrors make the light run back and forth through the atoms and grow each time, like a shout in a canyon that keeps getting louder. A little leaks out as the beam.'},
            {type: 'text', title: 'WHY QUANTUM LABS NEED LASERS', body:
                'Laser light is COHERENT: one well-defined wave over a long stretch. The coherence length is about the speed of light over the linewidth:\n' +
                '  L = c / Δν\n' +
                'A laser 1 kHz wide stays in step over 300 km; white light, hundreds of THz wide, over about a micrometre.\n' +
                'So a laser can address one atomic transition and drive it precisely: lasers cool ions and atoms, turn their qubits, read them out, and pump the crystals that make entangled photons.',
            eli5: 'Laser light marches in step for miles, so it can play exactly one note of an atom, like a tuning fork, and push the qubit just right.'},
            {type: 'quiz', q: 'Which process makes a photon that copies another one?',
                options: ['SPONTANEOUS EMISSION', 'STIMULATED EMISSION', 'ABSORPTION'], answer: 1,
                why: 'The passing photon triggers the drop, and the new photon matches it in direction, frequency, phase and polarization (Einstein 1917).'},
            {type: 'quiz', q: 'Why must a laser be pumped?',
                options: ['TO COOL THE MIRRORS', 'TO KEEP MORE ATOMS UP THAN DOWN', 'TO MAKE THE BEAM WIDER'], answer: 1,
                why: 'Without a population inversion, absorption beats stimulated emission and the light dies out.'},
            {type: 'quiz', q: 'A laser has a linewidth of 1 MHz. Its coherence length is about...',
                options: ['3 MM', '300 M', '3000 KM'], answer: 1,
                why: 'L = c / Δν = (3 × 10^8 m/s) / (10^6 /s) = 300 m.'},
        ],
    },
    {
        id: 'polarization', world: 8, title: 'POLARIZATION QUBITS', code: '51_polarization',
        refs: ['jones1941', 'kok2007', 'kwiat1995'],
        steps: [
            {type: 'text', title: 'LIGHT HAS A DIRECTION', body:
                'Light is a wave of electric field, and the field points across the beam: horizontally, vertically or anything in between. That direction is its POLARIZATION.\n' +
                'The polarization of one photon is a qubit:\n' +
                '  |0> = |H>     |1> = |V>\n' +
                '  |+> = |D>     |-> = |A>\n' +
                'D and A are the two diagonals; (|H> + i|V>)/√2 and (|H> - i|V>)/√2 are the two circular polarizations.',
                pic: 'waveplates',
                eli5: 'A rope shaken up and down makes upright waves, side to side makes flat ones. A photon can wiggle either way, or both at once.'},
            {type: 'text', title: 'WAVE PLATES ARE GATES', body:
                'A WAVE PLATE is a crystal that slows light polarized along one axis more than along the other. Jones (1941) wrote every such optical element as a 2 x 2 matrix acting on the polarization: exactly a one-qubit gate.\n' +
                '  half-wave at 45°   = X\n' +
                '  half-wave at 22.5° = H\n' +
                '  quarter-wave at 0° = S\n' +
                '(up to a global phase). A POLARIZING BEAM SPLITTER sends |H> one way and |V> the other: with a detector behind each output it measures the qubit.',
            eli5: 'Special see-through crystals turn the wiggle direction by a set amount. Each crystal is a quantum gate you can hold in your hand.'},
            {type: 'circuit', goal: 'TURN |H> LIGHT INTO CIRCULAR LIGHT (|H>+i|V>)/√2. H IS A HALF-WAVE PLATE AT 22.5°, S A QUARTER-WAVE PLATE.',
                qubits: 1, gates: ['H', 'S', 'X'], par: 2,
                solution: [['H', 0], ['S', 0]], hint: 'First make it diagonal (H), then delay V by a quarter wave against H (S).',
                eli5: 'Tilt the wiggle half way between flat and upright, then hold back the upright part a little, so the wiggle goes round in a circle.'},
            {type: 'text', title: 'GOOD TRAVELLERS', body:
                'Photons hardly interact with their surroundings, so a polarization qubit keeps over long distances; photons carry quantum keys and link distant labs. The hard part is the reverse: two photons do not interact with each other either, so there is no direct two-photon gate. Linear-optics quantum computing uses extra photons, beam splitters and detection instead, and its gates work only with some probability (Kok et al. 2007).\n' +
                'Entangled polarization pairs come from down-conversion in a crystal (Kwiat et al. 1995).',
            eli5: 'Light qubits are great travellers but shy: two photons fly through each other without noticing, so making them work together takes tricks.'},
            {type: 'quiz', q: 'A polarizing beam splitter with a detector behind each output...',
                options: ['MEASURES THE H/V POLARIZATION', 'MAKES NEW PHOTONS', 'ACTS LIKE A HADAMARD'], answer: 0,
                why: '|H> reaches one detector and |V> the other: a measurement in the H/V basis.'},
            {type: 'quiz', q: 'A half-wave plate at 22.5° acts on the polarization like...',
                options: ['X', 'H', 'S'], answer: 1,
                why: 'Its Jones matrix is (1/√2)[[1, 1], [1, -1]]: the Hadamard gate.'},
        ],
    },
    {
        id: 'photons', world: 8, title: 'OPTICS AND PHOTONS', code: '52_photons',
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
        id: 'photonhw', world: 8, title: 'PHOTON SOURCES, DETECTORS', code: '53_photonhw',
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
        id: 'cooling', world: 8, title: 'LASER COOLING', code: '54_cooling',
        refs: ['hansch1975', 'wineland1979', 'lett1988', 'steck87'],
        steps: [
            {type: 'text', title: 'LIGHT CAN PUSH', body:
                'Every absorbed photon gives an atom a tiny kick, ħk, along the beam. Tune a laser a little BELOW an atomic resonance (red detuning). An atom moving towards the beam sees the light Doppler-shifted up onto resonance, absorbs it and is slowed; an atom moving away sees it shifted further off and hardly absorbs. The photons it gives out again go in random directions and average out.\n' +
                'With beams from all six directions an atom moves as if through syrup: OPTICAL MOLASSES (proposed by Hänsch and Schawlow, 1975).',
                pic: 'cooling',
                eli5: 'Imagine running into a hail of ping-pong balls that only hits you when you run towards it. Whichever way you run, you get slowed down.'},
            {type: 'text', title: 'HOW COLD', body:
                'Cooling stops where the random kicks of the light given out heat the atom as fast as the beams cool it. For a two-level atom this DOPPLER LIMIT depends only on the natural linewidth γ of the transition (Wineland and Itano, 1979):\n' +
                '  T = ħγ / (2 kB)\n' +
                'kB is Boltzmann\'s constant. For rubidium-87, γ = 2π × 6.07 MHz and T is about 146 µK (Steck\'s data tables).\n' +
                'Lett et al. (1988) then measured sodium atoms at 43 µK, far below its Doppler limit of 240 µK: the light\'s changing polarization cools further (SUB-DOPPLER COOLING).',
            eli5: 'Even the cooling light keeps nudging the atoms a little at random, so there is a floor to how cold it gets. Clever tricks with the light\'s wiggle get below that floor.'},
            {type: 'text', title: 'WHAT QUBITS GET', body:
                'Cold atoms move slowly enough for optical tweezers to catch them one by one. Cold ions sit so still in their trap that their shared motion can carry gates between them.\n' +
                'The size of one kick: a single 780 nm photon changes a rubidium atom\'s speed by about 6 mm/s, and the matching RECOIL TEMPERATURE is about 0.36 µK (Steck).',
            eli5: 'Cold atoms are slow enough to grab with beams of light, and cold ions are calm enough to be used as one shared quantum wire.'},
            {type: 'quiz', q: 'Why is the laser tuned a little below the atom\'s resonance?',
                options: ['SO ONLY ATOMS MOVING INTO IT ABSORB', 'TO HEAT THE ATOMS', 'RED LIGHT IS CHEAPER'], answer: 0,
                why: 'The Doppler shift brings the light onto resonance only for atoms moving into the beam, and their kicks slow them.'},
            {type: 'quiz', q: 'For a two-level atom, the Doppler limit is set by...',
                options: ['THE LASER POWER', 'THE NATURAL LINEWIDTH', 'THE ROOM TEMPERATURE'], answer: 1,
                why: 'T = ħγ / (2 kB): only the linewidth γ of the transition enters.'},
        ],
    },
    {
        id: 'ions', world: 8, title: 'TRAPPED IONS AND LASERS', code: '55_ions',
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
        id: 'iontrap', world: 8, title: 'ION TRAP HARDWARE', code: '56_iontrap',
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
        id: 'atoms', world: 8, title: 'NEUTRAL ATOMS', code: '57_atoms',
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
        id: 'atomhw', world: 8, title: 'ATOM ARRAY HARDWARE', code: '58_atomhw',
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
);
