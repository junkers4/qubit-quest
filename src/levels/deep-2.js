// Deep dives (the MORE button) for worlds 5 to 8: protocols, algorithms, hardware and
// real machines in detail. Every page cites its sources.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.addDeep({
    // ---------------------------------------------------------------- world 5
    superdense: [
        {title: 'THE ALGEBRA', refs: ['nc2010 §2.3'], body:
            'Alice applies I, X, Z or ZX to her half of Φ+, giving the four orthogonal Bell states. Bob\'s decoder (CNOT, then H on the first qubit) is the Bell measurement, so he reads 00, 01, 10 or 11 with certainty.'},
        {title: 'THE PRICE', refs: ['bennett1992', 'nc2010 ch. 12'], body:
            'Without shared entanglement one qubit carries at most one classical bit (Holevo). With one shared Bell pair (one EBIT) plus one sent qubit, two bits arrive. The entanglement had to be delivered earlier, so nothing comes for free.'},
    ],
    teleport: [
        {title: 'THE ALGEBRA', refs: ['nc2010 §1.3.7'], body:
            'Rewrite |ψ>|Φ+> in the Bell basis of Alice\'s two qubits:\n' +
            '  1/2 · SUM over i, j\n' +
            '      |Bij> ⊗ (Xj Zi)|ψ>\n' +
            '(up to signs). Each of the four results comes with probability 1/4, and tells Bob which Pauli correction turns his qubit into |ψ>.'},
        {title: 'WHY TWO BITS ARE NEEDED', refs: ['bennett1993'], body:
            'Averaged over Alice\'s four results, Bob\'s qubit is I/2 whatever |ψ> was. So until the two bits arrive, Bob cannot learn anything, and no signal travels faster than light. Two classical bits per teleported qubit are also the minimum.'},
    ],
    bb84: [
        {title: 'FROM RAW BITS TO A KEY', refs: ['nc2010 §12.6', 'bb84'], body:
            '  1. SIFTING: keep same bases (~1/2)\n' +
            '  2. ESTIMATE ERRORS on a sample\n' +
            '  3. ERROR CORRECTION (classical)\n' +
            '  4. PRIVACY AMPLIFICATION: hash\n' +
            'The last step shrinks the key so that whatever Eve learned about it becomes negligible.'},
        {title: 'E91', refs: ['ekert1991'], body:
            'Ekert\'s version starts from Bell pairs. Alice and Bob measure in randomly chosen bases; some rounds give key bits, the others are a Bell (CHSH) test. A full violation proves no eavesdropper holds a copy of the correlations.'},
    ],

    // ---------------------------------------------------------------- world 6
    kickback: [
        {title: 'EIGENVALUE KICKBACK', refs: ['cleve1998', 'nc2010 §5.2'], body:
            'If U|u> = e^(Iφ)|u>, a controlled-U acting on (α|0> + β|1>)|u> gives\n' +
            '  (α|0> + β·e^(Iφ)|1>)|u>\n' +
            'The target is untouched; the eigenvalue\'s phase moved onto the control. Phase estimation reads φ this way.'},
        {title: 'THE PHASE ORACLE', refs: ['nc2010 §1.4.3'], body:
            'With the target in |->, the oracle |x>|y> → |x>|y XOR f(x)> becomes\n' +
            '  |x>|-> → (-1)^f(x) |x>|->\n' +
            'a sign that depends on f. Deutsch, Deutsch-Jozsa, Bernstein-Vazirani and Grover all use this form.'},
    ],
    deutsch: [
        {title: 'STEP BY STEP', refs: ['nc2010 §1.4.3'], body:
            '  START: |0>|1>\n' +
            '  H H:   |+>|->\n' +
            '  BOX:   SUM (-1)^f(x)|x> ⊗ |-> / √2\n' +
            '  H:     ±|f(0) XOR f(1)> ⊗ |->\n' +
            'The first qubit ends in |0> exactly when f(0) = f(1).'},
        {title: 'THE 1985 VERSION', refs: ['deutsch1985', 'cleve1998'], body:
            'Deutsch\'s original algorithm answered correctly only half of the time, and said when it had failed. The version with the second qubit prepared in |-> (Cleve, Ekert, Macchiavello and Mosca, 1998) always succeeds with one query.'},
    ],
    dj: [
        {title: 'THE AMPLITUDE FORMULA', refs: ['nc2010 §1.4.4'], body:
            'After the last H layer the amplitude of |y> is\n' +
            '  (1/2^n) SUM over x (-1)^(f(x)+x·y)\n' +
            'For y = 0 this is the average of (-1)^f(x): ±1 if f is constant, exactly 0 if balanced.'},
        {title: 'A FAIR COMPARISON?', refs: ['dj1992', 'nc2010 §1.4.4'], body:
            'The exponential gap is against DETERMINISTIC classical algorithms (2^(n-1) + 1 queries in the worst case). A randomized classical algorithm can be confident after a few queries, so Deutsch-Jozsa is a proof of principle rather than a practical speed-up.'},
    ],
    bv: [
        {title: 'WHY IT OUTPUTS S', refs: ['bv1997'], body:
            'After the oracle the inputs hold\n' +
            '  SUM (-1)^(s·x)|x> / √2^n = H|s>\n' +
            'so one more H layer returns |s>. One query reads all n bits; a classical algorithm needs n queries, one per bit.'},
        {title: 'THE BIGGER RESULT', refs: ['bv1997'], body:
            'Bernstein and Vazirani used a recursive version of this problem to separate quantum from classical probabilistic computation relative to an oracle (super-polynomially), the first such separation, before Simon\'s exponential one.'},
    ],
    simon: [
        {title: 'SOLVING FOR S', refs: ['simon1997'], body:
            'Each round gives a random y with y·s = 0 (mod 2). Collect n - 1 independent such y and solve the linear system over the bits {0, 1} (Gaussian elimination with XOR) to get s. On average O(n) rounds suffice.'},
        {title: 'HIDDEN SUBGROUPS', refs: ['simon1997', 'nc2010 §5.4'], body:
            'Simon\'s function is constant on pairs {x, x XOR s}; Shor\'s a^x MOD N is constant on x, x + r, x + 2r... Both are HIDDEN SUBGROUP problems, and the same idea (superpose, query, Fourier transform, measure) solves both.'},
    ],
    grover: [
        {title: 'THE GEOMETRY', refs: ['nc2010 §6.1', 'bbht1998'], body:
            'Everything happens in the plane of the marked state |w> and the rest. With SIN θ = 1/√N each round turns the state by 2θ, so after k rounds\n' +
            '  P(w) = SIN^2((2k+1)θ)\n' +
            'which peaks near k = (π/4)√N. Rounding k matters; going further turns past the target.'},
        {title: 'IT CANNOT BE BEATEN', refs: ['nc2010 §6.6'], body:
            'Any quantum algorithm needs on the order of √N oracle queries for unstructured search (Nielsen and Chuang, section 6.6). Grover is optimal: the speed-up is quadratic, not exponential.'},
    ],
    qft: [
        {title: 'THE PRODUCT FORM', refs: ['nc2010 §5.1'], body:
            'QFT|j1 j2 .. jn> is a product of one-qubit states\n' +
            '  (|0> + e^(2πI·0.jn)|1>)\n' +
            '  ⊗ (|0> + e^(2πI·0.jn-1 jn)|1>) ...\n' +
            '(over √2^n), with 0.j.. a binary fraction. Each factor needs one H and controlled phase turns R2, R3, ...'},
        {title: 'GATE COUNT', refs: ['nc2010 §5.1', 'coppersmith1994'], body:
            'n Hadamards, n(n-1)/2 controlled phases and about n/2 swaps: O(n^2) gates. The tiniest phase turns barely matter; dropping them gives Coppersmith\'s approximate QFT with far fewer gates and little error.'},
    ],
    qpe: [
        {title: 'HOW MANY COUNTING QUBITS', refs: ['nc2010 §5.2'], body:
            'To get φ to n bits with success probability at least 1 - ε, use\n' +
            '  t = n + CEIL(LOG2(2 + 1/(2ε)))\n' +
            'counting qubits (Nielsen and Chuang, eq. 5.35). When φ has an exact t-bit expansion, as in the puzzle, the answer is certain.'},
        {title: 'WHAT IT IS FOR', refs: ['kitaev1995', 'nc2010 §5.2'], body:
            'Phase estimation turns "find an eigenvalue of U" into measuring bits. It is the core of order finding and factoring, and of quantum algorithms for the energies of molecules.'},
    ],
    shor: [
        {title: 'CONTINUED FRACTIONS', refs: ['nc2010 §5.3', 'hardy2008 ch. 10'], body:
            'The measurement gives y with y/2^t close to k/r. The continued fraction expansion of y/2^t has the fraction k/r among its convergents when t ≈ 2·LOG2(N). Example 40 does this in Python: 64/256, 128/256, 192/256 give r = 4.'},
        {title: 'THE COST', refs: ['shor1997', 'nc2010 §5.3'], body:
            'The expensive part is modular exponentiation, a reversible arithmetic circuit; with schoolbook methods it takes O((LOG N)^3) gates, polynomial in the number of digits. The best known classical methods are super-polynomial.'},
    ],

    // ---------------------------------------------------------------- world 7
    divincenzo: [
        {title: 'T1 AND T2', refs: ['krantz2019'], body:
            'T1: how long |1> takes to decay to |0> (energy relaxation).\n' +
            'T2: how long a superposition keeps its phase (dephasing).\n' +
            'Always T2 ≤ 2·T1. Both are measured with simple pulse sequences: wait and measure, or Ramsey and echo.'},
        {title: 'A QUALITY SCORECARD', refs: ['krantz2019', 'preskill2018'], body:
            'What decides a platform: one- and two-qubit gate error, readout error, gate time against coherence time, how many qubits connect to each other, and how well it all scales. Preskill (2018) stresses that the gate error limits the useful circuit size.'},
    ],
    superconducting: [
        {title: 'THE JOSEPHSON RELATIONS', refs: ['krantz2019'], body:
            '  I = Ic·SIN φ\n' +
            '  V = (ħ/2e)·dφ/dt\n' +
            'Together they make the junction an inductor whose inductance depends on the current: a NONLINEAR inductor, the source of the uneven energy steps.'},
        {title: 'TUNING THE FREQUENCY', refs: ['krantz2019', 'koch2007'], body:
            'Two junctions in a small loop (a SQUID) act like one junction whose EJ depends on the magnetic flux through the loop. A current in a nearby line changes the flux and so the qubit frequency: useful for gates, but flux noise then dephases the qubit.'},
    ],
    chip: [
        {title: 'HOW A CHIP IS MADE', refs: ['dolan1977', 'krantz2019'], body:
            '  1. deposit the base film\n' +
            '  2. pattern it: lithography + etching\n' +
            '  3. junction pattern in e-beam resist\n' +
            '     with a hanging bridge\n' +
            '  4. aluminium at angle 1, oxidize,\n' +
            '     aluminium at angle 2\n' +
            '  5. lift off the resist'},
        {title: 'TWO-LEVEL DEFECTS', refs: ['kjaergaard2020', 'place2021'], body:
            'Amorphous oxides and interfaces host microscopic TWO-LEVEL SYSTEMS (TLS) that absorb microwave energy at random frequencies. They are a leading cause of energy loss in today\'s transmons, which is why materials and cleaning steps are studied so closely.'},
    ],
    fridge: [
        {title: 'COOLING POWER PER STAGE', refs: ['krinner2019'], body:
            'The colder a stage, the less heat it can remove: the pulse-tube stages handle watts, the mixing chamber only microwatts. That budget limits how many cables, and so how many qubits, one fridge can serve (Krinner et al., 2019).'},
        {title: 'VIBRATION', refs: ['dewit2019'], body:
            'The pulse tube shakes the whole cryostat a little. De Wit et al. (2019) hung an experiment on a soft spring system with high thermal conductance: from an 8 mK base it reached 10.5 mK, with 113 µW of cooling power at 100 mK.'},
    ],
    dilution: [
        {title: 'WHY CROSSING COOLS', refs: ['pobell2007'], body:
            'Helium-3 has a higher enthalpy dissolved in the dilute phase than in the concentrated phase. Moving it across the boundary therefore needs heat, taken from the mixing chamber. Both phases behave as Fermi liquids, whose heat capacity grows like T, so the cooling grows like T^2.'},
        {title: 'THE STILL HEATER', refs: ['pobell2007'], body:
            'A heater on the still raises the helium-3 evaporation rate and so the circulation n. More flow means more cooling power, up to the point where the heat brought down by the extra flow wins.'},
    ],
    wiring: [
        {title: 'THE HEAT BUDGET', refs: ['krinner2019'], body:
            'Krinner et al. measured the passive heat each line brings: at the 4 K stage tens of microwatts for a stainless-steel drive line, a few microwatts or less for an NbTi output line. Multiply by hundreds of lines and wiring becomes a main obstacle to scaling.'},
        {title: 'ACTIVE HEATING', refs: ['krinner2019'], body:
            'Control pulses dissipate in the attenuators that tame their noise, so busy lines heat the cold plates. Designs balance where to attenuate: enough to keep noise out, not so much that the coldest stages overheat.'},
    ],
    readout: [
        {title: 'THE DISPERSIVE SHIFT', refs: ['krantz2019'], body:
            'With the qubit detuned by Δ from a resonator coupled with strength g, the resonator frequency moves by ±χ depending on the qubit state, with\n' +
            '  χ ≈ g^2/Δ\n' +
            'for a two-level system (the transmon\'s third level corrects this). The readout tone probes that shift without flipping the qubit.'},
        {title: 'MANY AT ONCE', refs: ['macklin2015', 'krantz2019'], body:
            'Each qubit gets a resonator at its own frequency on a shared line, so one tone comb reads many qubits together (MULTIPLEXING). A broadband amplifier like the TWPA amplifies them all with near quantum-limited noise.'},
    ],
    ions: [
        {title: 'LASER COOLING', refs: ['wineland1978'], body:
            'Tune a laser slightly below an atomic resonance. An ion moving towards the beam sees it Doppler-shifted onto resonance, absorbs, and gets a kick against its motion; spontaneous emission goes in random directions. Net effect: friction. Wineland et al. (1978) cooled magnesium ions below 40 K this way.'},
        {title: 'STRENGTHS AND LIMITS', refs: ['bruzewicz2019', 'olmschenk2007'], body:
            'Ions are identical, very long-lived (2.5 s coherence for Yb-171) and give very high gate and readout fidelities. Their gates are slower than superconducting ones, and long chains get harder to control, which is why traps are split into zones.'},
    ],
    iontrap: [
        {title: 'LOADING ONE ION', refs: ['bruzewicz2019'], body:
            'A small oven sends a beam of neutral atoms through the trap; lasers ionize just one of them inside the trapping region, and it is caught. The vacuum must be so good that collisions with stray gas are rare.'},
        {title: 'SHUTTLING', refs: ['kielpinski2002'], body:
            'In the QCCD design ions are moved between memory and interaction zones by changing the electrode voltages, carried along like cars on a track. Only the ions that must interact are brought together.'},
    ],
    photons: [
        {title: 'POLARIZATION OPTICS', refs: ['kok2007'], body:
            'A HALF-WAVE PLATE rotates polarization; at 22.5° it acts like a Hadamard on H/V polarization. A QUARTER-WAVE PLATE adds a quarter-wave phase. A POLARIZING BEAM SPLITTER sends H one way and V the other: with two detectors that is a measurement.'},
        {title: 'KLM IN SHORT', refs: ['klm2001', 'kok2007'], body:
            'Two-qubit gates come from extra photons, beam splitters, detection and feed-forward: they work only sometimes, but you know when. Teleportation lifts the success rate. The overhead is large, and measurement-based (cluster state) schemes reduce it.'},
    ],
    photonhw: [
        {title: 'MULTI-PAIR NOISE', refs: ['kok2007', 'senellart2017'], body:
            'Down-conversion is random: occasionally two pairs come at once and fake a single photon. Pumping more weakly reduces such doubles but also the rate. On-demand quantum dot sources aim to give exactly one photon per trigger.'},
        {title: 'WHY DETECTORS ARE COLD', refs: ['goltsman2001', 'marsili2013'], body:
            'The nanowire must be superconducting so that one photon\'s energy can tip it: niobium nitride at 4.2 K in 2001, tungsten silicide in the 93% detector. In exchange the dark-count rate is low and the timing precise.'},
    ],
    atoms: [
        {title: 'RYDBERG ATOMS', refs: ['saffman2010'], body:
            'In a Rydberg state the outer electron is in an orbit with a very high principal quantum number n. The atom becomes huge and extremely sensitive to its neighbours, which gives strong interactions over micrometres: exactly what a two-qubit gate needs.'},
        {title: 'MORE THAN TWO QUBITS', refs: ['evered2023'], body:
            'Because the blockade acts on every atom within its range, several atoms can take part in one gate. Evered et al. (2023) also showed low-error three-qubit gates, next to their 99.5% two-qubit CZ.'},
    ],
    atomhw: [
        {title: 'ACOUSTO-OPTIC DEFLECTORS', refs: ['endres2016'], body:
            'An AOD is a crystal with a sound wave running through it. Light passing through is deflected by an angle set by the sound frequency; several radio tones give several beams at once. Changing the tones moves the tweezers, fast feedback steered Endres et al.\'s rearrangement.'},
        {title: 'SEEING SINGLE ATOMS', refs: ['endres2016', 'barredo2016'], body:
            'The atoms are imaged by their fluorescence on a sensitive camera. One image tells which tweezers are filled; the rearrangement is computed and done; a second image checks the result.'},
    ],
    spins: [
        {title: 'ZEEMAN SPLITTING', refs: ['burkard2023'], body:
            'An electron spin in a field B has two levels split by\n' +
            '  f = g·µB·B / h ≈ 28 GHZ PER TESLA\n' +
            '(g ≈ 2). A microwave magnetic field at f flips it (ESR); with a micromagnet, an oscillating ELECTRIC field can do it too (EDSR).'},
        {title: 'EXCHANGE GATES', refs: ['loss1998'], body:
            'Lowering the barrier between two dots turns on the exchange coupling J between their spins. Left on for the right time, the evolution e^(-IJt(XX+YY+ZZ)/4) gives a SWAP, and half that time a √SWAP, which together with one-qubit gates is universal (example 54 checks the SWAP).'},
    ],
    spinhw: [
        {title: 'HETEROSTRUCTURES', refs: ['burkard2023'], body:
            'Electrons are confined in a thin silicon layer, either in a silicon / silicon-germanium quantum well or under a gate oxide (Si-MOS). Metal gate electrodes on top shape the dots and the barriers between them.'},
        {title: 'THE CHARGE SENSOR', refs: ['elzerman2004'], body:
            'A tiny conductor next to the dot, whose current changes when a single electron leaves or enters the dot, works as the "eye" of spin-to-charge readout. Elzerman et al. used a quantum point contact.'},
    ],

    // ---------------------------------------------------------------- world 8
    noise: [
        {title: 'NOISE CHANNELS', refs: ['nc2010 ch. 8'], body:
            '  BIT FLIP:   ρ → (1-p)ρ + p·XρX\n' +
            '  PHASE FLIP: ρ → (1-p)ρ + p·ZρZ\n' +
            '  DEPOLARIZE: ρ → (1-p)ρ + p·I/2\n' +
            'Amplitude damping (energy loss, T1) is another; each is described by Kraus operators.'},
        {title: 'MEASURING T1 AND T2', refs: ['krantz2019'], body:
            'T1: π pulse, wait t, measure: P(1) decays as e^(-t/T1).\n' +
            'T2*: π/2, wait, π/2 (RAMSEY): fringes decay.\n' +
            'T2 echo: add a π pulse half way (HAHN ECHO) to cancel slow drifts.'},
    ],
    qec: [
        {title: 'SYNDROMES WITHOUT LOOKING', refs: ['nc2010 §10.1'], body:
            'Measuring the parities Z1Z2 and Z2Z3 with helper qubits tells WHERE a bit flip happened (00: none, 10: qubit 1, 11: qubit 2, 01: qubit 3) but nothing about α and β, so the encoded superposition survives.'},
        {title: 'THE THRESHOLD', refs: ['google2025'], body:
            'Below a threshold error rate, a bigger code makes the logical qubit better, exponentially. Google Quantum AI\'s distance-7 surface code memory (101 qubits) had 0.143% error per cycle, about 2.14 times less for each step in code distance.'},
    ],
    variational: [
        {title: 'QAOA', refs: ['farhi2014'], body:
            'QAOA alternates a cost step e^(-IγC) and a mixing step e^(-IβΣX), p times, with 2p angles tuned classically. For MaxCut on 3-regular graphs, p = 1 already guarantees a cut of at least 0.6924 times the best.'},
        {title: 'THE MEASUREMENT BILL', refs: ['peruzzo2014'], body:
            'Each energy <H> is estimated from shots, with an error falling like 1/√shots: to halve the error, four times the shots. A Hamiltonian with many terms needs many such estimates per step of the optimizer.'},
    ],
    qiskit: [
        {title: 'THE TRANSPILER', refs: ['qiskit2024'], body:
            'transpile() runs in stages: choose a LAYOUT (which physical qubit plays each virtual one), ROUTE (insert SWAPs for missing connections), TRANSLATE to the native gates, OPTIMIZE (merge and cancel gates), and SCHEDULE in time.'},
        {title: 'PRIMITIVES', refs: ['qiskitdocs'], body:
            'Qiskit offers two primitives: a SAMPLER (counts of measured bits) and an ESTIMATOR (expectation values). The examples here use the exact local ones, StatevectorSampler; on IBM hardware the same code runs through the runtime service.'},
    ],
    beyond: [
        {title: 'OPEN QUESTIONS', refs: ['preskill2018'], body:
            'Which useful problems give a real quantum advantage? How fast can error-corrected machines be built? How far can noisy machines go? These are open, and active research.'},
        {title: 'HOW TO KEEP LEARNING', refs: ['nc2010', 'watrous2025', 'ibmbasics'], body:
            'Work through a textbook with its exercises, take the free course, and run and change code. New results appear daily in the quant-ph section of arXiv: every arXiv id in SOURCES points there.'},
    ],
});
