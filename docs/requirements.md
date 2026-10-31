# Requirements

Every requirement has an automated test; `test/requirements.test.js` fails if a REQ id below
is not named by a test (rows marked **manual** or **online** excepted). Suites:

| suite | what | run |
|---|---|---|
| **N** node unit tests | `test/*.test.js`: simulator, curriculum, sources, generated files, this table | `make test` |
| **B** browser | `test/shots.js`: every level played in headless Chromium at four screen sizes (1280x720, 960x600 = the smallest landscape 320x200, phone 412x915 @2.625, narrow 320x640 @1.6 = 256 px wide); screenshots in `/tmp/qq` | `make shots` |
| **P** Python | `tests/*.py` (pytest): every Qiskit example runs; the game's simulator against Qiskit | `make test-python` |
| **G** Go | `desktop/*_test.go`, `tools/icon/*_test.go`: the app's server, window lifetime, the Windows icon resources read back from a linked .exe | `make test-desktop` |
| **D** desktop | `test/desktop.js`: the built app run with `-serve`, the game played from it in headless Chromium | `make test-desktop` |
| **A** assembler | `tests/test_asm.py`, `tests/test_asm_game.py`: the assembler core as a shared library, headless | `make -C asm test` |
| **W** windows | `tests/asm_window.py`: the Linux and Windows programs in real windows (Xvfb, wine), driven by X events | `make -C asm test-window` |
| **E** emulator | `android/smoke-test.sh`: the APK on an Android emulator in CI | CI job `android` |
| **O** online | `tools/check-refs.js`: every DOI, arXiv id and URL resolves | `make check-refs` |

## Curriculum

| REQ | requirement | test |
|---|---|---|
| REQ-001 | Learning starts from zero and goes in order through nine worlds: classical warm-up, math toolkit, one qubit, many qubits, protocols, algorithms, quantum hardware (DiVincenzo's checklist, the qubit chip and its materials, the dilution refrigerator part by part, helium dilution, wiring, filters and shields, control and readout electronics, spin qubit devices), lasers and optics (how a laser works, polarization qubits and wave plates, interferometers, photon sources and detectors, laser cooling, trapped ions and their lasers and traps, neutral-atom arrays), real quantum computers; at least 60 levels, each starting with a lesson and containing a quiz or a puzzle; every hardware drawing exists. | N content |
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
| REQ-033 | Every example's output is shown in the game (RUN in the CODE window): recorded by running exactly that code with the pinned Qiskit, and checked against a fresh run. Every example explains itself with comments. | P examples; B |
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

## The desktop app

| REQ | requirement | test |
|---|---|---|
| REQ-060 | One program (`desktop/`, Go, no other dependency) carries the whole game and serves it to itself on 127.0.0.1 only; it works with no network. | G desktop; D |
| REQ-061 | It opens the game in a window of its own (Edge, Chrome or Chromium in app mode; else the default browser) and quits once the last window has closed or its browser ended; a second start opens one more window on the running one. | G desktop |
| REQ-062 | In the app the game runs under a strict content security policy with the WebAssembly core, makes no request outside the app, and keeps its progress across reloads and runs (fixed port, own browser profile). | D |
| REQ-063 | `make desktop` builds it for Linux (tar.gz, .deb), Windows (.exe with the game's icon) and macOS; the icon is drawn from the game's own pixel icon. | G icon; build in CI |

## The assembler game

| REQ | requirement | test |
|---|---|---|
| REQ-070 | The assembler core (`asm/core/sim.asm`, x86-64, NASM) gives the reference simulator's amplitudes (and so Qiskit's) for every puzzle solution and random circuit, and checks every puzzle goal (whole state up to global phase, chosen qubits, chances only) the way the web game does. | A |
| REQ-071 | Every one of the 63 levels can be played to the end in the assembler game, by keys and by clicks; ELI5 opens on every step and the hint on every puzzle. | A |
| REQ-072 | The assembler game keeps the web game's rules: a level opens after the one before has a star, a wrong first answer or a puzzle over par costs a star, stars are saved and come back. | A |
| REQ-073 | `make -C asm` builds a Linux program (X11) and a Windows program (Win32, `qubit-quest.exe`, with the game's icon) from the same core; both play a level in a real window, save progress and quit from the menu. | W |
| REQ-074 | The assembler game's data (`asm/gen/data.asm`: font, levels, texts) is generated from the web game and up to date. | N generated |
| REQ-075 | The assembler core gives every qubit's Bloch vector (from its reduced state) as the web game does; a qubit of a Bell pair has none (length 0). | A |
| REQ-076 | Pictures in the assembler game: the 16 hardware drawings pixel for pixel as in the web game, demo circuits on lesson pages, and in every puzzle three views of the state (chances and phase dials; one Bloch sphere per qubit in perspective, shorter and purple when entangled; 100 measurement shots against the exact chances), gates animated as turns about their own axis, and a window of exact amplitudes, chances, phases and Bloch vectors. | A |
| REQ-077 | Drawings move where it helps to see the physics: control pulses down the fridge's lines, drive and readout of a transmon, light running between a laser's mirrors and out as the beam, the polarization field swinging and turning through wave plates, one photon taking both arms of an interferometer, pairs from down-conversion, ions moving together in their trap, photons slowing an atom, atoms drifting into a trap; the web game and the assembler game draw the same moving parts at the same frame. | A |

## The Android app

| REQ | requirement | test |
|---|---|---|
| REQ-078 | `android/build.sh` builds an Android app (APK, Android 7 and later, no permissions) holding the web game; on a phone it runs full screen and offline with the WebAssembly core and every level, keeps progress, takes taps, and the back button works as Esc. | E |
