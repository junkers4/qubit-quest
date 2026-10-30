# Requirements

Every requirement has an automated test; `test/requirements.test.js` fails if a REQ id below
is not named by a test (rows marked **manual** or **online** excepted). Suites:

| suite | what | run |
|---|---|---|
| **N** node unit tests | `test/*.test.js`: simulator, curriculum, sources, generated files, this table | `make test` |
| **B** browser | `test/shots.js`: every level played in headless Chromium at four screen sizes (1280x720, 960x600 = the smallest landscape 320x200, phone 412x915 @2.625, narrow 320x640 @1.6 = 256 px wide); screenshots in `/tmp/qq` | `make shots` |
| **P** Python | `tests/*.py` (pytest): every Qiskit example runs; the game's simulator against Qiskit | `make test-python` |
| **O** online | `tools/check-refs.js`: every DOI, arXiv id and URL resolves | `make check-refs` |

## Curriculum

| REQ | requirement | test |
|---|---|---|
| REQ-001 | Learning starts from zero and goes in order through eight worlds: classical warm-up, math toolkit, one qubit, many qubits, protocols, algorithms, quantum hardware (the qubit chip and its materials, the dilution refrigerator part by part, helium dilution, wiring, filters and shields, control and readout electronics, trapped ions and their lasers and traps, photon sources, optics and detectors, neutral-atom arrays, spin qubit devices), real quantum computers; at least 60 levels, each starting with a lesson and containing a quiz or a puzzle; every hardware drawing exists. | N content |
| REQ-002 | All teaching text is English, checked for correctness by a person. | **manual** |
| REQ-003 | Every lesson page and every puzzle has an "explain like I'm five" text; the ELI5 button works on every step. | N content; B |
| REQ-013 | Every level has at least two deep-dive pages (the MORE button) with the details, derivations and numbers behind it, each citing sources. | N content; B |
| REQ-008 | Quizzes have 2-4 distinct options, one right answer and an explanation. | N content |
| REQ-009 | Every puzzle can be solved with its own gates on its allowed wires, is not solved at the start, and its par is the true minimum (breadth-first search). | N content; P cross-check |
| REQ-012 | The gate book covers every gate with its matrix, a description, its Qiskit call and sources; the glossary is alphabetical and cites sources. | N content |

## Sources

| REQ | requirement | test |
|---|---|---|
| REQ-004 | Every level cites sources that exist; every algorithm, protocol and error-correction level names and cites its original paper. Gate book and glossary entries cite sources too. | N content |
| REQ-005 | Every source has authors, year, title, venue, at least one identifier (DOI, arXiv id, ISBN with a valid check digit, or URL) and the record that confirmed it. | N refs |
| REQ-006 | Every source is cited somewhere, and nothing cites an unknown source. | N refs |
| REQ-050 | `docs/REFERENCES.md` is generated from the sources and up to date. | N generated |
| REQ-051 | Every DOI, arXiv id and URL resolves online. | **online** (`make check-refs`) |

## Code

| REQ | requirement | test |
|---|---|---|
| REQ-007 | Every level has a Python / Qiskit example, named after the level; every example belongs to one level. | N content |
| REQ-030 | Every example runs with the pinned `requirements.txt` and checks its own results. | P examples |
| REQ-031 | Examples fit the in-game code window: ASCII, at most 64 characters per line, a docstring naming the level. | P examples |
| REQ-032 | The game's simulator gives exactly Qiskit's amplitudes for every puzzle solution and for random circuits over every gate. | P cross-check |
| REQ-020 | The simulator gets the physics right: gate identities, Bell states, Toffoli, QFT, black boxes, global phase, reduced states, Bloch vectors. | N sim |
| REQ-021 | In the browser the game computes states with a simulator core hand-written in WebAssembly (`src/qcore.wat`), which gives the same amplitudes as the JS reference (and so as Qiskit); the embedded binary is assembled from the current source. | N core; B |
| REQ-022 | Generated files (`src/examples.js`, `tests/sim_cases.json`) match their sources. | N generated |

## The game

| REQ | requirement | test |
|---|---|---|
| REQ-040 | Every level can be played to the end in a browser at all four screen sizes without page errors; playing a puzzle's solution by taps solves it. | B |
| REQ-041 | ELI5, CODE, MORE and SOURCES open on every step of every level, show content, and close. | B |
| REQ-042 | The title menu opens the gate book, the glossary and the full source list. | B |
| REQ-043 | The pixel look: whole-number scaling, no smoothing, the red #B01818 frame. | B |
| REQ-044 | The game runs from `file://` with no build and makes no network request. | B |
| REQ-045 | Progress (stars) is kept in the browser and survives a reload. | B |
| REQ-010 | The pixel font has a glyph for every character the game shows (upper case for text, lower case for code and sources). | N content |
| REQ-011 | Text fits the narrowest screen (no word or formula wider than a line) and nothing runs into the footer at any of the four sizes; hints that do not fit open in a window. | N content; B |
