# Qubit Quest: notes for Claude

- A game that teaches quantum computing from zero, in English. Static web page, no build, no deps:
  classic scripts (`src/*.js`) that share the global `QQ`, so `index.html` works from `file://`.
- Look: the BlackBreak pixel style (Doom / Wolfenstein 3D). Red pixel frame #B01818, bg #0D0C0B,
  menu blue #5C5CFC on #04042C, gold #FCC030, white #F4F0E0, green #30C030; 5x7 font with Slovak
  accents, no smoothing, no rounded corners. Everything is drawn on a small canvas (about 320 x 200
  on a desktop, 256+ wide on an upright phone) scaled by a whole number.
- Text is upper-cased by the font; glyphs for kets and math (| > √ Ψ Φ ⊕ ★ ...) are in `font.js`.
  A missing glyph shows as '?': add it there.
- Levels are data (`src/levels.js`, template in `docs/LEVEL_TEMPLATE.md`). `par` must be the true
  minimum: `make test` runs a breadth-first search and fails otherwise.
- Checks: `make test-all`. It plays every level in headless Chromium and leaves screenshots in
  `/tmp/qq` (desktop-*.png, phone-*.png). Always look at them after a visual change.
