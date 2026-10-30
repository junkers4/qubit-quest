// Pixel drawings of quantum hardware for the lesson pages (`pic: 'fridge'` on a text step).
// Each is 230 pixels wide (it fits the narrowest screen) and `h` high. g holds the game's
// drawing helpers: R (rect), text, line, circle.
var QQ = globalThis.QQ || (globalThis.QQ = {});

(function () {
    const P = QQ.PAL;
    const RED = '#e83838', SILVER = '#b8b4a8', GREY = '#5a5650';

    QQ.PICS = {
        // a dilution refrigerator: plates getting colder downwards, the chip at the bottom
        fridge: {h: 116, draw(g, x, y) {
            const stages = [['300 K', 'ROOM'], ['50 K', ''], ['4 K', ''], ['~1 K', 'STILL'],
                ['~0.1 K', 'COLD PLATE'], ['~0.01 K', 'MIXING']];
            const top = y + 6;
            stages.forEach(([t, name], i) => {
                const w = 98 - i * 8, px = x + 4 + i * 4, py = top + i * 16;
                if (i < stages.length - 1) // the rods down to the next plate
                    for (const rx of [px + 6, px + w - 7])
                        g.R(GREY, rx, py + 3, 1, 13);
                g.R(i ? P.gold : SILVER, px, py, w, 3);
                g.R(i ? '#c88018' : '#7a7468', px, py + 3, w, 1);
                g.text(t, x + 106, py - 3, P.white, 1, null);
                if (name)
                    g.text(name, x + 106 + 6 * (t.length + 1), py - 3, P.dim, 1, null);
            });
            // coax lines, with an attenuator on each plate on the way down
            for (const cx of [x + 40, x + 47, x + 54]) {
                g.R(P.blue, cx, top + 3, 1, 5 * 16 + 8);
                for (let i = 1; i < stages.length; i++)
                    g.R(P.white, cx - 1, top + i * 16 - 3, 3, 2);
            }
            const cy = top + 5 * 16 + 11;
            g.R(P.gold, x + 36, cy, 24, 12);
            g.R(P.navy, x + 37, cy + 1, 22, 10);
            g.R(P.blue, x + 41, cy + 4, 4, 4);
            g.R(P.blue, x + 51, cy + 4, 4, 4);
            g.text('QUBIT CHIP', x + 66, cy + 1, P.gold, 1, null);
        }},

        // energy ladders: equal steps (a plain LC circuit) against the transmon's shrinking steps
        levels: {h: 66, draw(g, x, y) {
            const ladder = (lx, ys, title) => {
                ys.forEach((ly, i) => {
                    g.R(i < 2 ? P.white : P.dim, lx + 12, y + ly, 44, 1);
                    g.text(String(i), lx, y + ly - 5, i < 2 ? P.gold : P.dim, 1, null);
                });
                g.text(title, lx, y + 56, P.dim, 1, null);
            };
            ladder(x + 4, [50, 34, 18, 2], 'HARMONIC');
            ladder(x + 124, [50, 30, 14, 2], 'TRANSMON');
            // the qubit is the lowest pair; on the transmon a pulse for 0-1 misses 1-2
            for (let yy = y + 31; yy < y + 50; yy++)
                g.R(P.green, x + 196, yy, 1, 1);
            g.R(P.green, x + 195, y + 31, 3, 1);
            g.text('QUBIT', x + 200, y + 37, P.green, 1, null);
        }},

        // a transmon: two capacitor pads, a Josephson junction between them, a readout resonator
        transmon: {h: 70, draw(g, x, y) {
            g.text('CAPACITOR PADS', x + 4, y + 2, P.dim, 1, null);
            g.R(P.blue, x + 6, y + 16, 34, 26);
            g.R(P.blue, x + 58, y + 16, 34, 26);
            g.R(SILVER, x + 40, y + 28, 18, 2);
            g.line(x + 45, y + 24, x + 53, y + 33, P.gold); // the junction, an X
            g.line(x + 45, y + 33, x + 53, y + 24, P.gold);
            g.text('JUNCTION', x + 25, y + 46, P.gold, 1, null);
            // a meander resonator to the readout line
            let mx = x + 92;
            g.R(SILVER, mx, y + 28, 8, 1);
            mx += 8;
            for (let k = 0; k < 6; k++) {
                g.R(SILVER, mx, y + 20, 1, 17);
                g.R(SILVER, mx, k % 2 ? y + 36 : y + 20, 8, 1);
                mx += 8;
            }
            g.R(SILVER, mx, y + 20, 1, 9);
            g.R(SILVER, mx, y + 28, 22, 1);
            g.text('RESONATOR', x + 104, y + 8, P.dim, 1, null);
            g.text('READ', x + 178, y + 30, P.dim, 1, null);
            // the microwave drive line
            g.line(x + 120, y + 54, x + 92, y + 40, RED);
            g.text('MICROWAVE DRIVE', x + 96, y + 56, RED, 1, null);
        }},

        // a trapped-ion chain between RF electrodes, with laser beams on two ions
        iontrap: {h: 88, draw(g, x, y) {
            g.text('RF ELECTRODES (PAUL TRAP)', x + 4, y + 2, P.dim, 1, null);
            g.R(P.gold, x + 6, y + 16, 218, 5);
            g.R(P.gold, x + 6, y + 56, 218, 5);
            const ions = [0, 1, 2, 3, 4, 5].map(i => x + 30 + i * 34);
            ions.forEach((ix, i) => {
                const bright = i % 3 !== 1; // bright ions scatter light: one result; dark: the other
                if (bright)
                    g.circle(ix, y + 38, 4, P.blue);
                g.R(P.white, ix - 1, y + 37, 3, 3);
            });
            for (const i of [1, 4]) // two laser beams, coming in from below at an angle
                g.line(ions[i] - 14, y + 84, ions[i], y + 39, RED);
            g.text('LASERS', x + 4, y + 66, RED, 1, null);
            g.text('IONS', x + 186, y + 66, P.white, 1, null);
        }},

        // a Mach-Zehnder interferometer: beam splitters, mirrors, a phase shifter, two detectors
        mzi: {h: 86, draw(g, x, y) {
            const bs1 = [x + 40, y + 66], m1 = [x + 40, y + 28], m2 = [x + 140, y + 66], bs2 = [x + 140, y + 28];
            const beam = (a, b) => g.line(a[0], a[1], b[0], b[1], RED);
            beam([x + 14, y + 66], bs1);
            beam(bs1, m1);
            beam(bs1, m2);
            beam(m1, bs2);
            beam(m2, bs2);
            beam(bs2, [x + 176, y + 28]);
            beam(bs2, [x + 140, y + 10]);
            const splitter = ([cx, cy]) => g.line(cx - 4, cy + 4, cx + 4, cy - 4, P.white);
            const mirror = ([cx, cy]) => {
                for (let d = -1; d <= 1; d++)
                    g.line(cx - 4 + d, cy + 4, cx + 4 + d, cy - 4, SILVER);
            };
            splitter(bs1);
            splitter(bs2);
            mirror(m1);
            mirror(m2);
            g.R(P.gold, x + 2, y + 62, 12, 9);
            g.text('LASER', x + 2, y + 74, P.gold, 1, null);
            g.R(P.gold, x + 84, y + 61, 12, 11); // the phase shifter on the lower arm
            g.R('#3a2a00', x + 85, y + 62, 10, 9);
            g.text('PHASE', x + 74, y + 74, P.gold, 1, null);
            g.circle(x + 181, y + 28, 4, P.green);
            g.text('D0', x + 188, y + 23, P.green, 1, null);
            g.circle(x + 140, y + 5, 4, P.green);
            g.text('D1', x + 148, y, P.green, 1, null);
            g.text('BS', x + 46, y + 70, P.dim, 1, null);
            g.text('BS', x + 124, y + 32, P.dim, 1, null);
        }},

        // optical tweezers: randomly loaded spots, then rearranged into a full array
        tweezers: {h: 72, draw(g, x, y) {
            const grid = (gx, filled, title) => {
                for (let r = 0; r < 4; r++)
                    for (let c = 0; c < 6; c++) {
                        const sx = gx + c * 14, sy = y + 4 + r * 14;
                        g.R('#4a1414', sx, sy, 7, 7);
                        if (filled(r, c))
                            g.R(P.white, sx + 2, sy + 2, 3, 3);
                    }
                g.text(title, gx, y + 62, P.dim, 1, null);
            };
            const random = (r, c) => [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1][r * 6 + c];
            grid(x + 4, random, 'LOADED');
            g.text('→', x + 98, y + 24, P.gold, 1, null);
            grid(x + 120, (r, c) => r < 2, 'SORTED');
        }},

        // electron spins in silicon quantum dots under gate electrodes, in a magnetic field
        spin: {h: 72, draw(g, x, y) {
            g.text('GATE ELECTRODES', x + 4, y + 2, P.dim, 1, null);
            for (let i = 0; i < 5; i++)
                g.R(P.gold, x + 20 + i * 40, y + 14, 12, 22);
            g.R(P.blue, x + 6, y + 40, 200, 10);
            g.text('SILICON', x + 4, y + 54, P.dim, 1, null);
            for (const [ex, up] of [[x + 50, true], [x + 130, false]]) {
                g.R(P.white, ex - 1, y + 43, 3, 3);
                const top = y + 30, bot = y + 40;
                g.R(P.green, ex, top, 1, bot - top);
                g.R(P.green, ex - 1, up ? top + 1 : bot - 2, 3, 1);
            }
            g.R(P.gold, x + 220, y + 12, 1, 36); // the magnetic field
            g.R(P.gold, x + 219, y + 13, 3, 1);
            g.text('B', x + 216, y + 50, P.gold, 1, null);
            g.text('UP = |0>  DOWN = |1>', x + 74, y + 60, P.green, 1, null);
        }},
    };
})();
