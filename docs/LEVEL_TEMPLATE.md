# Level template

Levels live in `src/levels/N-world.js`, one file per world, in unlock order. Copy this into the
right file and fill it in, then run `make generate` and `make test-all`:

```js
{
    id: 'my-level',            // unique, saves progress (do not rename after release)
    world: 3,                  // one of QQ.WORLDS (src/levels/0-worlds.js)
    title: 'SHORT TITLE',      // upper case on screen; at most 26 characters
    code: '53_my_level',       // examples/53_my_level.py, first line: """Level 53, SHORT TITLE: ...
    origin: 'paper2001',       // algorithms, protocols, codes: the original paper (a key in src/refs.js)
    refs: ['nc2010 §1.2', 'paper2001'],   // sources: 'key' or 'key §locator'
    steps: [
        // a lesson page; paragraphs split by \n
        //   '>...'  a key point, in gold
        //   '  ...' a formula (two leading spaces), on a blue band; at most 36 characters
        {type: 'text', title: 'PAGE TITLE', body: 'First paragraph.\n  H|0> = |+>\n>Remember this.',
            eli5: 'The same idea for a five-year-old.',   // required on lesson pages
            refs: ['nc2010 §1.3.1']},                    // optional: sources for this page only

        // under the text: a small circuit with its state, or a hardware drawing (src/pics.js)
        {type: 'text', title: 'SEE IT', body: '...', eli5: '...', demo: {qubits: 1, ops: [['H', 0]]}},
        {type: 'text', title: 'THE FRIDGE', body: '...', eli5: '...', pic: 'fridge'},

        // a question with 2 to 4 answers; `answer` is the index of the right one
        {type: 'quiz', q: 'Question?', options: ['A', 'B', 'C'], answer: 1, why: 'Shown after the right answer.'},

        // a circuit puzzle, 1 to 3 qubits
        {
            type: 'circuit',
            goal: 'WHAT TO BUILD.',
            qubits: 2,
            setup: [['H', 0]],          // optional fixed grey gates at the start
            after: [['CX', 0, 1]],      // optional fixed grey gates at the end
            boxes: {F: [['CX', 0, 1]]}, // optional black boxes (one letter), used like gates
            gates: ['H', 'X', 'CX', 'F'],
            limits: {F: 1},             // optional: how often a gate may be used
            allow: {X: [0], CX: [[0, 1]]}, // optional: the wires (tuples) a gate may use
            allowText: 'SHOWN WHEN A GATE IS PUT WHERE IT IS NOT ALLOWED.',
            goalQubits: [1],            // optional: only these qubits must match (reduced state)
            probsOnly: false,           // optional: only the chances must match, not the phases
            par: 2,                     // the fewest gates that solve it (3 stars); tests check it
            solution: [['H', 0], ['CX', 0, 1]], // a solution; the goal is setup + solution + after
            hint: 'Shown when the player taps HINT.',
            eli5: 'The goal for a five-year-old.',
        },
    ],
},
```

Gates: `X Y Z H S SDG T TDG` take one wire (`['H', q]`); `CX` is `['CX', control, target]`;
`CZ`, `CS`, `CSDG`, `SWAP` are symmetric (`['CZ', a, b]`, a < b); `CCX` is
`['CCX', control1, control2, target]` with control1 < control2; a box is `['F']`.
Qubit 0 is the top wire and the LEFT digit of a ket (Qiskit writes it on the right).

Stars: 3, minus one for every wrong quiz answer and every puzzle solved over par (at least 1).

`make test` checks every level against docs/requirements.md: sources exist, glyphs exist,
text fits the narrowest screen, puzzles are solvable with par the true minimum, the example
exists. `make test-python` runs the example; `make shots` plays the level in Chromium.
