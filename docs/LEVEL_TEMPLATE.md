# Level template

Levels live in `src/levels.js`, in `QQ.LEVELS`, in the order they unlock. Copy this and fill it in:

```js
{
    id: 'my-level',            // unique, used to save progress (do not rename after release)
    world: 2,                  // one of QQ.WORLDS
    title: 'SHORT TITLE',      // shown in upper case, keep it under ~20 characters
    steps: [
        // a page of text: paragraphs split by \n
        //   '>...'  a key point, drawn in gold
        //   '  ...' a formula (two leading spaces), drawn on a blue band
        {type: 'text', title: 'PAGE TITLE', body: 'First paragraph.\n  H|0> = |+>\n>Remember this.'},

        // optional: a small circuit with its state under the text
        {type: 'text', title: 'SEE IT', body: '...', demo: {qubits: 1, ops: [['H', 0]]}},

        // a question with 2 to 4 answers; `answer` is the index of the right one
        {type: 'quiz', q: 'Question?', options: ['A', 'B', 'C'], answer: 1, why: 'Shown after the right answer.'},

        // a circuit puzzle (1 or 2 qubits)
        {
            type: 'circuit',
            goal: 'WHAT TO BUILD.',
            qubits: 2,
            setup: [['H', 0]],          // optional fixed grey gates at the start
            gates: ['H', 'X', 'CX'],    // the palette
            limits: {X: 1},             // optional: how many of a gate may be used
            par: 2,                     // the fewest gates that solve it (3 stars)
            solution: [['H', 0], ['CX', 0, 1]], // one solution; the goal state is setup + solution
            hint: 'Shown when the player taps HINT.',
        },
    ],
},
```

Gates: `X Y Z H S T` take one wire (`['H', q]`); `CX` is `['CX', control, target]`;
`CZ`, `SWAP` and the black box `F` (adds f(q0) = q0 into q1) are `[g, 0, 1]`.
Qubit 0 is the top wire and the left digit of a ket.

Stars: 3, minus one for every wrong quiz answer and every puzzle solved over par (at least 1).

`make test` checks every level: ids are unique, quiz answers exist, every puzzle's solution uses
only offered gates, and `par` really is the fewest gates (a breadth-first search over the palette).
`make shots` then plays it in Chromium and leaves screenshots in `/tmp/qq`.
