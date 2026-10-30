// Every source the game cites. A level or step cites one as 'key' or 'key §locator'.
// Only identifiers (DOI, arXiv, ISBN, URL) that were checked against a bibliographic
// record are given; `checked` names the record that confirmed them (looked up 2026-10-29).
// `make check-refs` resolves the DOIs and arXiv ids online again.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.REFS = {
    // ------------------------------------------------------------ textbooks and courses
    nc2010: {
        authors: 'M. A. Nielsen, I. L. Chuang', year: 2010,
        title: 'Quantum Computation and Quantum Information, 10th anniversary edition',
        where: 'Cambridge University Press',
        isbn: '978-1-107-00217-3', url: 'https://michaelnielsen.org/qcqi/',
        checked: 'https://readings.com.au/product/9781107002173/9781107002173',
    },
    mermin2007: {
        authors: 'N. D. Mermin', year: 2007,
        title: 'Quantum Computer Science: An Introduction',
        where: 'Cambridge University Press',
        isbn: '978-0-521-87658-2', url: 'https://www.cambridge.org/9780521876582',
        checked: 'https://www.cambridge.org/9780521876582',
    },
    ibmbasics: {
        authors: 'J. Watrous (IBM Quantum Learning)', year: 'accessed 2026',
        title: 'Basics of quantum information (course)',
        where: 'IBM Quantum Platform',
        url: 'https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information',
        checked: 'https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information.md',
    },
    watrous2025: {
        authors: 'J. Watrous', year: 2025,
        title: 'Understanding Quantum Information and Computation',
        where: 'lecture notes', arxiv: '2507.11536',
        checked: 'https://arxiv.org/pdf/2507.11536',
    },
    strang2016: {
        authors: 'G. Strang', year: 2016,
        title: 'Introduction to Linear Algebra, 5th edition',
        where: 'Wellesley-Cambridge Press',
        isbn: '978-0-9802327-7-6',
        checked: 'https://www.tenlong.com.tw/products/9780980232776',
    },
    grinstead1997: {
        authors: 'C. M. Grinstead, J. L. Snell', year: 1997,
        title: 'Introduction to Probability, 2nd revised edition (free under the GNU FDL)',
        where: 'American Mathematical Society',
        isbn: '978-0-8218-0749-1',
        url: 'https://textbooks.aimath.org/textbooks/approved-textbooks/grinstead-snell/',
        checked: 'https://textbooks.aimath.org/textbooks/approved-textbooks/grinstead-snell/',
    },
    needham1997: {
        authors: 'T. Needham', year: 1997,
        title: 'Visual Complex Analysis',
        where: 'Oxford University Press',
        isbn: '978-0-19-853446-4',
        checked: 'https://www.hatchards.co.uk/book/visual-complex-analysis/tristan-needham/9780198534464',
    },
    hardy2008: {
        authors: 'G. H. Hardy, E. M. Wright (rev. D. R. Heath-Brown, J. H. Silverman)', year: 2008,
        title: 'An Introduction to the Theory of Numbers, 6th edition',
        where: 'Oxford University Press',
        isbn: '978-0-19-921986-5',
        checked: 'https://www.biblio.com/9780199219865',
    },
    qiskit2024: {
        authors: 'A. Javadi-Abhari et al.', year: 2024,
        title: 'Quantum computing with Qiskit',
        where: 'preprint', arxiv: '2405.08810',
        checked: 'https://arxiv.org/abs/2405.08810',
    },
    qiskitdocs: {
        authors: 'IBM Quantum', year: 'accessed 2026',
        title: 'Qiskit SDK API reference (QuantumCircuit, quantum_info, primitives)',
        where: 'IBM Quantum Platform documentation',
        url: 'https://quantum.cloud.ibm.com/docs/en/api/qiskit',
        checked: 'https://quantum.cloud.ibm.com/docs/en/api/qiskit/qiskit.primitives.StatevectorSampler.md',
    },

    // ------------------------------------------------------------ bits and reversible computing
    shannon1948: {
        authors: 'C. E. Shannon', year: 1948,
        title: 'A Mathematical Theory of Communication',
        where: 'Bell System Technical Journal 27(3), 379-423',
        doi: '10.1002/j.1538-7305.1948.tb01338.x',
        checked: 'https://www.bibsonomy.org/bibtex/1754130207906fcec16a53d330eeff348/mabdelaal86',
    },
    landauer1961: {
        authors: 'R. Landauer', year: 1961,
        title: 'Irreversibility and Heat Generation in the Computing Process',
        where: 'IBM Journal of Research and Development 5(3), 183-191',
        doi: '10.1147/rd.53.0183',
        checked: 'https://scilit.com/publications/307b121fc39fba344dc560299e75e9ab',
    },
    bennett1973: {
        authors: 'C. H. Bennett', year: 1973,
        title: 'Logical Reversibility of Computation',
        where: 'IBM Journal of Research and Development 17(6), 525-532',
        doi: '10.1147/rd.176.0525',
        checked: 'https://scilit.com/publications/8f8e42bd9388d90af57eec6b7ff1712f',
    },
    toffoli1980: {
        authors: 'T. Toffoli', year: 1980,
        title: 'Reversible Computing',
        where: 'Automata, Languages and Programming (ICALP 1980), LNCS 85, 632-644, Springer',
        doi: '10.1007/3-540-10003-2_104',
        checked: 'https://mathizv.isu.ru/en/article?id=1274',
    },
    barenco1995: {
        authors: 'A. Barenco, C. H. Bennett, R. Cleve, D. P. DiVincenzo, N. Margolus, P. Shor, T. Sleator, J. A. Smolin, H. Weinfurter',
        year: 1995,
        title: 'Elementary gates for quantum computation',
        where: 'Physical Review A 52(5), 3457-3467',
        doi: '10.1103/PhysRevA.52.3457', arxiv: 'quant-ph/9503016',
        checked: 'https://arxiv.org/abs/quant-ph/9503016',
    },

    // ------------------------------------------------------------ quantum mechanics
    dirac1939: {
        authors: 'P. A. M. Dirac', year: 1939,
        title: 'A new notation for quantum mechanics',
        where: 'Mathematical Proceedings of the Cambridge Philosophical Society 35(3), 416-418',
        doi: '10.1017/S0305004100021162',
        checked: 'https://www.sciencegate.app/document/10.1017/s0305004100021162',
    },
    born1926: {
        authors: 'M. Born', year: 1926,
        title: 'Zur Quantenmechanik der Stoßvorgänge (the probability rule)',
        where: 'Zeitschrift für Physik 37, 863-867 (a copy is hosted by the University of Pavia)',
        url: 'https://fisica.unipv.it/antoci/mq/Born26a.pdf',
        checked: 'https://fisica.unipv.it/antoci/mq/Born26a.pdf',
    },
    pauli1927: {
        authors: 'W. Pauli', year: 1927,
        title: 'Zur Quantenmechanik des magnetischen Elektrons',
        where: 'Zeitschrift für Physik 43, 601-623',
        doi: '10.1007/BF01397326',
        checked: 'https://libop-nifs.nifs.ac.jp/pdf/10165769.pdf',
    },
    bloch1946: {
        authors: 'F. Bloch', year: 1946,
        title: 'Nuclear Induction',
        where: 'Physical Review 70, 460-474',
        doi: '10.1103/PhysRev.70.460',
        checked: 'https://bibbase.org/network/publication/bloch-nuclearinduction',
    },
    epr1935: {
        authors: 'A. Einstein, B. Podolsky, N. Rosen', year: 1935,
        title: 'Can Quantum-Mechanical Description of Physical Reality Be Considered Complete?',
        where: 'Physical Review 47(10), 777-780',
        doi: '10.1103/PhysRev.47.777',
        checked: 'https://bibsonomy.org/bibtex/27ebc89f882bf857e06159e705d6def1b/derkimbeimlesen',
    },
    bell1964: {
        authors: 'J. S. Bell', year: 1964,
        title: 'On the Einstein Podolsky Rosen Paradox',
        where: 'Physics Physique Fizika 1(3), 195-200',
        doi: '10.1103/PhysicsPhysiqueFizika.1.195',
        checked: 'https://bibbase.org/network/publication/bell-ontheeinsteinpodolskyrosenparadox-1964',
    },
    chsh1969: {
        authors: 'J. F. Clauser, M. A. Horne, A. Shimony, R. A. Holt', year: 1969,
        title: 'Proposed Experiment to Test Local Hidden-Variable Theories',
        where: 'Physical Review Letters 23(15), 880-884',
        doi: '10.1103/PhysRevLett.23.880',
        checked: 'https://scilit.com/publications/d3baa571c13718215927c795cfd0442f',
    },
    tsirelson1980: {
        authors: 'B. S. Cirel\'son (Tsirelson)', year: 1980,
        title: 'Quantum generalizations of Bell\'s inequality',
        where: 'Letters in Mathematical Physics 4(2), 93-100',
        doi: '10.1007/BF00417500',
        checked: 'https://link.springer.com/doi/10.1007/BF00417500',
    },
    aspect1982: {
        authors: 'A. Aspect, J. Dalibard, G. Roger', year: 1982,
        title: 'Experimental Test of Bell\'s Inequalities Using Time-Varying Analyzers',
        where: 'Physical Review Letters 49(25), 1804-1807',
        doi: '10.1103/PhysRevLett.49.1804',
        checked: 'https://scilit.net/publications/c66b58d610ade9ad011b748bfac98618',
    },
    hensen2015: {
        authors: 'B. Hensen et al.', year: 2015,
        title: 'Loophole-free Bell inequality violation using electron spins separated by 1.3 kilometres',
        where: 'Nature 526, 682-686',
        doi: '10.1038/nature15759', arxiv: '1508.05949',
        checked: 'https://arxiv.org/abs/1508.05949',
    },
    wootters1982: {
        authors: 'W. K. Wootters, W. H. Zurek', year: 1982,
        title: 'A single quantum cannot be cloned',
        where: 'Nature 299, 802-803',
        doi: '10.1038/299802a0',
        checked: 'https://ui.adsabs.harvard.edu/abs/1982Natur.299..802W/abstract',
    },
    dieks1982: {
        authors: 'D. Dieks', year: 1982,
        title: 'Communication by EPR devices',
        where: 'Physics Letters A 92(6), 271-272',
        doi: '10.1016/0375-9601(82)90084-6',
        checked: 'https://arxiv.org/pdf/1707.06910',
    },
    zurek2003: {
        authors: 'W. H. Zurek', year: 2003,
        title: 'Decoherence, einselection, and the quantum origins of the classical',
        where: 'Reviews of Modern Physics 75, 715',
        doi: '10.1103/RevModPhys.75.715', arxiv: 'quant-ph/0105127',
        checked: 'https://arxiv.org/abs/quant-ph/0105127',
    },

    // ------------------------------------------------------------ protocols
    bennett1992: {
        authors: 'C. H. Bennett, S. J. Wiesner', year: 1992,
        title: 'Communication via one- and two-particle operators on Einstein-Podolsky-Rosen states',
        where: 'Physical Review Letters 69(20), 2881-2884',
        doi: '10.1103/PhysRevLett.69.2881',
        checked: 'https://scilit.com/publications/71ccb17ffcd4fec42f2d10213310180b',
    },
    bennett1993: {
        authors: 'C. H. Bennett, G. Brassard, C. Crépeau, R. Jozsa, A. Peres, W. K. Wootters', year: 1993,
        title: 'Teleporting an unknown quantum state via dual classical and Einstein-Podolsky-Rosen channels',
        where: 'Physical Review Letters 70(13), 1895-1899',
        doi: '10.1103/PhysRevLett.70.1895',
        checked: 'https://ui.adsabs.harvard.edu/abs/10.1103/PhysRevLett.70.1895/abstract',
    },
    bb84: {
        authors: 'C. H. Bennett, G. Brassard', year: 2014,
        title: 'Quantum cryptography: Public key distribution and coin tossing (BB84, first published 1984)',
        where: 'Theoretical Computer Science 560, 7-11',
        doi: '10.1016/j.tcs.2014.05.025', arxiv: '2003.06557',
        checked: 'https://arxiv.org/abs/2003.06557',
    },
    ekert1991: {
        authors: 'A. K. Ekert', year: 1991,
        title: 'Quantum cryptography based on Bell\'s theorem',
        where: 'Physical Review Letters 67(6), 661-663',
        doi: '10.1103/PhysRevLett.67.661',
        checked: 'https://scilit.net/publications/f27dc264598b6103fd84fee25197e406',
    },

    // ------------------------------------------------------------ algorithms
    feynman1982: {
        authors: 'R. P. Feynman', year: 1982,
        title: 'Simulating physics with computers',
        where: 'International Journal of Theoretical Physics 21, 467-488',
        doi: '10.1007/BF02650179',
        checked: 'https://link.springer.com/article/10.1007/BF02650179',
    },
    deutsch1985: {
        authors: 'D. Deutsch', year: 1985,
        title: 'Quantum theory, the Church-Turing principle and the universal quantum computer',
        where: 'Proceedings of the Royal Society of London A 400(1818), 97-117',
        doi: '10.1098/rspa.1985.0070',
        checked: 'https://www.daviddeutsch.org.uk/wp-content/deutsch85.pdf',
    },
    dj1992: {
        authors: 'D. Deutsch, R. Jozsa', year: 1992,
        title: 'Rapid Solution of Problems by Quantum Computation',
        where: 'Proceedings of the Royal Society of London A 439(1907), 553-558',
        doi: '10.1098/rspa.1992.0167',
        checked: 'https://ui.adsabs.harvard.edu/abs/1992RSPSA.439..553D/abstract',
    },
    cleve1998: {
        authors: 'R. Cleve, A. Ekert, C. Macchiavello, M. Mosca', year: 1998,
        title: 'Quantum algorithms revisited',
        where: 'Proceedings of the Royal Society of London A 454, 339-354',
        doi: '10.1098/rspa.1998.0164', arxiv: 'quant-ph/9708016',
        checked: 'https://arxiv.org/abs/quant-ph/9708016',
    },
    bv1997: {
        authors: 'E. Bernstein, U. Vazirani', year: 1997,
        title: 'Quantum Complexity Theory',
        where: 'SIAM Journal on Computing 26(5), 1411-1473',
        doi: '10.1137/S0097539796300921',
        checked: 'https://data.zhenzhi.com/details/1/906242704',
    },
    simon1997: {
        authors: 'D. R. Simon', year: 1997,
        title: 'On the Power of Quantum Computation',
        where: 'SIAM Journal on Computing 26(5), 1474-1483',
        doi: '10.1137/S0097539796298637',
        checked: 'https://epubs.siam.org/doi/10.1137/S0097539796298637',
    },
    grover1996: {
        authors: 'L. K. Grover', year: 1996,
        title: 'A fast quantum mechanical algorithm for database search',
        where: 'Proceedings of the 28th Annual ACM Symposium on Theory of Computing (STOC), 212-219',
        doi: '10.1145/237814.237866', arxiv: 'quant-ph/9605043',
        checked: 'https://bibtex.github.io/STOC-1996-Grover.html',
    },
    bbht1998: {
        authors: 'M. Boyer, G. Brassard, P. Høyer, A. Tapp', year: 1998,
        title: 'Tight bounds on quantum searching',
        where: 'Fortschritte der Physik 46, 493-506',
        arxiv: 'quant-ph/9605034',
        checked: 'https://arxiv.org/abs/quant-ph/9605034',
    },
    coppersmith1994: {
        authors: 'D. Coppersmith', year: 1994,
        title: 'An approximate Fourier transform useful in quantum factoring (IBM Research Report RC 19642)',
        where: 'IBM Research', arxiv: 'quant-ph/0201067',
        checked: 'https://arxiv.org/abs/quant-ph/0201067',
    },
    kitaev1995: {
        authors: 'A. Yu. Kitaev', year: 1995,
        title: 'Quantum measurements and the Abelian Stabilizer Problem',
        where: 'preprint', arxiv: 'quant-ph/9511026',
        checked: 'https://arxiv.org/abs/quant-ph/9511026',
    },
    shor1997: {
        authors: 'P. W. Shor', year: 1997,
        title: 'Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer',
        where: 'SIAM Journal on Computing 26(5), 1484-1509',
        doi: '10.1137/S0097539795293172', arxiv: 'quant-ph/9508027',
        checked: 'https://arxiv.org/abs/quant-ph/9508027',
    },

    // ------------------------------------------------------------ hardware
    divincenzo2000: {
        authors: 'D. P. DiVincenzo', year: 2000,
        title: 'The Physical Implementation of Quantum Computation',
        where: 'Fortschritte der Physik 48, 771-783',
        arxiv: 'quant-ph/0002077',
        checked: 'https://arxiv.org/abs/quant-ph/0002077',
    },
    nakamura1999: {
        authors: 'Y. Nakamura, Yu. A. Pashkin, J. S. Tsai', year: 1999,
        title: 'Coherent control of macroscopic quantum states in a single-Cooper-pair box',
        where: 'Nature 398, 786-788',
        doi: '10.1038/19718', arxiv: 'cond-mat/9904003',
        checked: 'https://link.springer.com/article/10.1038/19718',
    },
    koch2007: {
        authors: 'J. Koch, T. M. Yu, J. Gambetta, A. A. Houck, D. I. Schuster, J. Majer, A. Blais, M. H. Devoret, S. M. Girvin, R. J. Schoelkopf',
        year: 2007,
        title: 'Charge-insensitive qubit design derived from the Cooper pair box (the transmon)',
        where: 'Physical Review A 76, 042319',
        doi: '10.1103/PhysRevA.76.042319', arxiv: 'cond-mat/0703002',
        checked: 'https://arxiv.org/abs/cond-mat/0703002',
    },
    krantz2019: {
        authors: 'P. Krantz, M. Kjaergaard, F. Yan, T. P. Orlando, S. Gustavsson, W. D. Oliver', year: 2019,
        title: 'A quantum engineer\'s guide to superconducting qubits',
        where: 'Applied Physics Reviews 6, 021318',
        doi: '10.1063/1.5089550', arxiv: '1904.06560',
        checked: 'https://dspace.mit.edu/handle/1721.1/133690',
    },
    krinner2019: {
        authors: 'S. Krinner, S. Storz, P. Kurpiers, P. Magnard, J. Heinsoo, R. Keller, J. Lütolf, C. Eichler, A. Wallraff',
        year: 2019,
        title: 'Engineering cryogenic setups for 100-qubit scale superconducting circuit systems',
        where: 'EPJ Quantum Technology 6, 2',
        doi: '10.1140/epjqt/s40507-019-0072-0', arxiv: '1806.07862',
        checked: 'https://arxiv.org/abs/1806.07862',
    },
    london1962: {
        authors: 'H. London, G. R. Clarke, E. Mendoza', year: 1962,
        title: 'Osmotic Pressure of He3 in Liquid He4, with Proposals for a Refrigerator to Work below 1 K',
        where: 'Physical Review 128(5), 1992',
        url: 'https://www.osti.gov/biblio/4775592',
        checked: 'https://www.osti.gov/biblio/4775592',
    },
    paul1990: {
        authors: 'W. Paul', year: 1990,
        title: 'Electromagnetic traps for charged and neutral particles (Nobel lecture)',
        where: 'Reviews of Modern Physics 62(3), 531-540',
        doi: '10.1103/RevModPhys.62.531',
        checked: 'https://en.wikipedia.org/wiki/Wolfgang_Paul',
    },
    wineland1978: {
        authors: 'D. J. Wineland, R. E. Drullinger, F. L. Walls', year: 1978,
        title: 'Radiation-Pressure Cooling of Bound Resonant Absorbers',
        where: 'Physical Review Letters 40, 1639-1642',
        doi: '10.1103/PhysRevLett.40.1639',
        checked: 'https://scilit.net/publications/d8cc97e32b809abe6097b8c3bddd0d55',
    },
    cirac1995: {
        authors: 'J. I. Cirac, P. Zoller', year: 1995,
        title: 'Quantum Computations with Cold Trapped Ions',
        where: 'Physical Review Letters 74(20), 4091-4094',
        doi: '10.1103/PhysRevLett.74.4091',
        checked: 'https://scilit.com/publications/27f99db1adc1b579c2535bc7b986955e',
    },
    bruzewicz2019: {
        authors: 'C. D. Bruzewicz, J. Chiaverini, R. McConnell, J. M. Sage', year: 2019,
        title: 'Trapped-ion quantum computing: Progress and challenges',
        where: 'Applied Physics Reviews 6, 021314',
        doi: '10.1063/1.5088164', arxiv: '1904.04178',
        checked: 'https://arxiv.org/abs/1904.04178',
    },
    klm2001: {
        authors: 'E. Knill, R. Laflamme, G. J. Milburn', year: 2001,
        title: 'A scheme for efficient quantum computation with linear optics',
        where: 'Nature 409, 46-52',
        doi: '10.1038/35051009', arxiv: 'quant-ph/0006088',
        checked: 'https://ideas.repec.org/a/nat/nature/v409y2001i6816d10.1038_35051009.html',
    },
    kok2007: {
        authors: 'P. Kok, W. J. Munro, K. Nemoto, T. C. Ralph, J. P. Dowling, G. J. Milburn', year: 2007,
        title: 'Linear optical quantum computing with photonic qubits',
        where: 'Reviews of Modern Physics 79, 135-174',
        doi: '10.1103/RevModPhys.79.135', arxiv: 'quant-ph/0512071',
        checked: 'https://scilit.com/publications/4a93df5f5bfad5c4d4812def72206f49',
    },
    reck1994: {
        authors: 'M. Reck, A. Zeilinger, H. J. Bernstein, P. Bertani', year: 1994,
        title: 'Experimental realization of any discrete unitary operator',
        where: 'Physical Review Letters 73(1), 58-61',
        doi: '10.1103/PhysRevLett.73.58',
        checked: 'https://scilit.com/publications/7847174bdc9e34ec9b5e0dcc82a554c8',
    },
    hom1987: {
        authors: 'C. K. Hong, Z. Y. Ou, L. Mandel', year: 1987,
        title: 'Measurement of subpicosecond time intervals between two photons by interference',
        where: 'Physical Review Letters 59(18), 2044-2046',
        doi: '10.1103/PhysRevLett.59.2044',
        checked: 'https://scilit.com/publications/cf03bafb2fd513d3d8eae501b2cfe7a2',
    },
    ashkin1986: {
        authors: 'A. Ashkin, J. M. Dziedzic, J. E. Bjorkholm, S. Chu', year: 1986,
        title: 'Observation of a single-beam gradient force optical trap for dielectric particles',
        where: 'Optics Letters 11(5), 288-290',
        doi: '10.1364/OL.11.000288',
        checked: 'https://scilit.com/publications/201bed87507ea308d702ab7a3ac995d5',
    },
    endres2016: {
        authors: 'M. Endres, H. Bernien, A. Keesling, H. Levine, E. R. Anschuetz, A. Krajenbrink, C. Senko, V. Vuletic, M. Greiner, M. D. Lukin',
        year: 2016,
        title: 'Atom-by-atom assembly of defect-free one-dimensional cold atom arrays',
        where: 'Science 354(6315), 1024-1027',
        doi: '10.1126/science.aah3752',
        checked: 'https://www.pubmed.gov/27811284/',
    },
    jaksch2000: {
        authors: 'D. Jaksch, J. I. Cirac, P. Zoller, S. L. Rolston, R. Côté, M. D. Lukin', year: 2000,
        title: 'Fast Quantum Gates for Neutral Atoms',
        where: 'Physical Review Letters 85(10), 2208-2211',
        arxiv: 'quant-ph/0004038',
        checked: 'https://www.nist.gov/publications/fast-quantum-gates-neutral-atoms',
    },
    saffman2010: {
        authors: 'M. Saffman, T. G. Walker, K. Mølmer', year: 2010,
        title: 'Quantum information with Rydberg atoms',
        where: 'Reviews of Modern Physics 82, 2313-2363',
        doi: '10.1103/RevModPhys.82.2313', arxiv: '0909.4777',
        checked: 'https://arxiv.org/abs/0909.4777',
    },
    loss1998: {
        authors: 'D. Loss, D. P. DiVincenzo', year: 1998,
        title: 'Quantum computation with quantum dots',
        where: 'Physical Review A 57(1), 120-126',
        arxiv: 'cond-mat/9701055',
        checked: 'https://arxiv.org/abs/cond-mat/9701055',
    },
    burkard2023: {
        authors: 'G. Burkard, T. D. Ladd, A. Pan, J. M. Nichol, J. R. Petta', year: 2023,
        title: 'Semiconductor spin qubits',
        where: 'Reviews of Modern Physics 95, 025003',
        doi: '10.1103/RevModPhys.95.025003', arxiv: '2112.08863',
        checked: 'https://arxiv.org/abs/2112.08863',
    },

    // ------------------------------------------------------------ real machines
    shor1995: {
        authors: 'P. W. Shor', year: 1995,
        title: 'Scheme for reducing decoherence in quantum computer memory',
        where: 'Physical Review A 52(4), R2493-R2496',
        doi: '10.1103/PhysRevA.52.R2493',
        checked: 'https://scilit.net/publications/2037e3256715550a2453da4c116fafbc',
    },
    steane1996: {
        authors: 'A. M. Steane', year: 1996,
        title: 'Error Correcting Codes in Quantum Theory',
        where: 'Physical Review Letters 77, 793',
        doi: '10.1103/PhysRevLett.77.793',
        checked: 'https://journals.aps.org/prl/issues/77/5',
    },
    google2025: {
        authors: 'Google Quantum AI and Collaborators', year: 2025,
        title: 'Quantum error correction below the surface code threshold',
        where: 'Nature',
        doi: '10.1038/s41586-024-08449-y', arxiv: '2408.13687',
        checked: 'https://arxiv.org/pdf/2408.13687',
    },
    preskill2018: {
        authors: 'J. Preskill', year: 2018,
        title: 'Quantum Computing in the NISQ era and beyond',
        where: 'Quantum 2, 79',
        doi: '10.22331/q-2018-08-06-79', arxiv: '1801.00862',
        checked: 'https://doaj.org/article/b27bd39720084a80ba9c8e79c469a945',
    },
    peruzzo2014: {
        authors: 'A. Peruzzo, J. McClean, P. Shadbolt, M.-H. Yung, X.-Q. Zhou, P. J. Love, A. Aspuru-Guzik, J. L. O\'Brien',
        year: 2014,
        title: 'A variational eigenvalue solver on a photonic quantum processor',
        where: 'Nature Communications 5, 4213',
        doi: '10.1038/ncomms5213', arxiv: '1304.3061',
        checked: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4124861',
    },
    farhi2014: {
        authors: 'E. Farhi, J. Goldstone, S. Gutmann', year: 2014,
        title: 'A Quantum Approximate Optimization Algorithm',
        where: 'preprint', arxiv: '1411.4028',
        checked: 'https://arxiv.org/pdf/1411.4028',
    },
};

// 'key §1.2' -> {key, at: '§1.2', ref}
QQ.refParts = function (cite) {
    const sp = cite.indexOf(' ');
    const key = sp < 0 ? cite : cite.slice(0, sp);
    return {key, at: sp < 0 ? '' : cite.slice(sp + 1), ref: QQ.REFS[key]};
};

// One reference as display lines: the citation, then its identifiers.
QQ.citeText = function (r) {
    const end = t => /[.?!]$/.test(t) ? t : t + '.';
    return `${r.authors} (${r.year}). ${end(r.title)} ${end(r.where)}`;
};
QQ.citeIds = function (r) {
    const ids = [];
    if (r.doi)
        ids.push('doi:' + r.doi);
    if (r.arxiv)
        ids.push('arXiv:' + r.arxiv);
    if (r.isbn)
        ids.push('ISBN ' + r.isbn);
    if (r.url)
        ids.push(r.url);
    return ids;
};

if (typeof module !== 'undefined')
    module.exports = QQ;
