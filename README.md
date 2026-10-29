# Qubit Quest

Learn quantum computing from zero, level by level, in the old-school pixel look of
[BlackBreak](https://github.com/junkers4/blackbreak): red pixel frame, segmented bars,
a gold and white 5x7 pixel font, Doom-blue menus, no smoothing.

![title](docs/title.png)
![a puzzle](docs/puzzle.png)

17 levels in 4 worlds, all in English:

| World | Levels |
|---|---|
| 1. Classical warm-up | bits, logic gates and reversibility |
| 2. One qubit | kets and amplitudes, measurement, X, H and superposition, interference, phase (Z S T), the Bloch sphere |
| 3. Two qubits | four amplitudes, CNOT, entanglement, all four Bell states, SWAP from three CNOTs |
| 4. Quantum tricks | phase kickback, the Deutsch algorithm, Grover search, what to learn next |

Each level is a few short pages, quizzes and circuit puzzles. In a puzzle you place gates on the
wires and watch the state live: every amplitude with its phase colour and a probability bar,
the goal next to it, and for one qubit the Bloch sphere. Solve it in `par` gates for three stars.

## Play

It is one static page with no build and no dependencies: open `index.html` in a browser
(desktop or phone), or `make serve` and go to http://localhost:8000. Progress is kept in the
browser. `index.html?all` unlocks every level.

Keys: Enter / arrow keys to move on, 1-4 to answer, H X Z S T C (CNOT) F to place gates,
Backspace to undo, up/down to pick a wire, ? for a hint, Esc for the level map.

## Make levels

Levels are data in `src/levels.js`; see [docs/LEVEL_TEMPLATE.md](docs/LEVEL_TEMPLATE.md).

## Checks

```bash
make test      # simulator + every level is solvable and par is the true minimum
make shots     # plays all levels in headless Chromium (Playwright), screenshots in /tmp/qq
```

## Files

- `src/font.js` the pixel font, palette and icon (ported from BlackBreak's `pixelfont.js`)
- `src/sim.js` a small state-vector simulator, plus the shortest-circuit search used by the tests
- `src/levels.js` worlds and levels
- `src/game.js` screens, layout, input
