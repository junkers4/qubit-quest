# Qubit Quest: notes for Claude

- A game that teaches quantum computing from zero, in English. Static web page, no build, no deps:
  classic scripts (`src/*.js`, `src/levels/*.js`) that share the global `QQ`, so `index.html`
  works from `file://`. The scripts load in the order index.html lists them; tests load the same list.
- Look: the BlackBreak pixel style (Doom / Wolfenstein 3D). Red pixel frame #B01818, bg #0D0C0B,
  menu blue #5C5CFC on #04042C, gold #FCC030, white #F4F0E0, green #30C030; 5x7 font with Slovak
  accents, no smoothing, no rounded corners. Everything is drawn on a small canvas (320 x 200 up to
  about 470 x 260 in landscape, 256+ wide on an upright phone) scaled by a whole number.
- The simulator core used in the browser is hand-written WebAssembly: `src/qcore.wat`, assembled by
  `make wasm` (wabt, a dev dependency in package.json) into `src/qcore-bin.js`. `src/sim.js` is the
  JS reference (used by the tests and the puzzle search); `test/core.test.js` keeps the two equal.
- Lesson text is upper-cased by the font; code and sources keep their case. A missing glyph shows as
  '?': add it to `font.js` (`make test` lists any missing one).
- Every source in `src/refs.js` must be checked against a real bibliographic record before it is
  added (`checked:` names it). Never add a DOI or page number that was not confirmed.
- Levels are data (template: `docs/LEVEL_TEMPLATE.md`); each has ELI5 texts, sources and an example
  `examples/NN_name.py` (<= 64 columns, asserts its result). After editing examples or levels run
  `make generate`.
- Requirements: `docs/requirements.md`; every REQ needs a test that names it.
- Checks: `make test-all` (node, pytest with `requirements.txt`, headless Chromium). The browser run
  leaves screenshots in `/tmp/qq` (desktop-*.png, phone-*.png). Always look at them after a visual change.
- Desktop app: `desktop/` (Go, standard library only) embeds the game (`game.go`), serves it on
  127.0.0.1:47823 (fixed, so localStorage keeps progress) and opens a Chromium-family `--app`
  window with its own profile; it quits after the last page says goodbye (heartbeat script added
  to index.html by the server only). `make desktop` builds every system into `dist/`; the .exe
  icon comes from `tools/icon` (writes `desktop/rsrc_windows_*.syso`, not committed).
  `make test-desktop` (Go tests + `test/desktop.js`). To see the real window here:
  `xvfb-run` with `QQ_BROWSER` pointing at a Chromium (as root it needs `--no-sandbox`).
