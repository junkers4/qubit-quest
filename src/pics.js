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

        // a Josephson junction from the side: aluminium, a thin oxide, aluminium
        junction: {h: 74, draw(g, x, y) {
            g.text('A JUNCTION FROM THE SIDE', x + 4, y + 2, P.dim, 1, null);
            g.R('#2a2a4a', x + 4, y + 52, 222, 12);
            g.text('SILICON OR SAPPHIRE', x + 60, y + 54, P.dim, 1, null);
            g.R(SILVER, x + 20, y + 44, 112, 8);             // bottom aluminium
            g.R(P.gold, x + 96, y + 42, 36, 2);              // the oxide barrier
            g.R(SILVER, x + 96, y + 34, 116, 8);             // top aluminium
            g.R(SILVER, x + 132, y + 42, 80, 10);
            g.text('AL', x + 24, y + 34, P.white, 1, null);
            g.text('AL', x + 196, y + 24, P.white, 1, null);
            g.line(x + 114, y + 43, x + 96, y + 22, P.gold);
            g.text('ALOX BARRIER', x + 50, y + 13, P.gold, 1, null);
            g.text('NOT TO SCALE', x + 150, y + 66, P.dim, 1, null);
        }},

        // the nested shields inside the vacuum can
        shields: {h: 90, draw(g, x, y) {
            const boxes = [['#7a7468', '300 K VACUUM CAN'], [SILVER, '50 K SHIELD'], [P.gold, '4 K SHIELD'],
                ['#c88018', 'STILL SHIELD']];
            boxes.forEach(([c, label], i) => {
                const bx = x + 4 + i * 10, by = y + 4 + i * 10, bw = 120 - i * 20, bh = 82 - i * 20;
                g.R(c, bx, by, bw, 1);
                g.R(c, bx, by + bh - 1, bw, 1);
                g.R(c, bx, by, 1, bh);
                g.R(c, bx + bw - 1, by, 1, bh);
                g.R(c, bx + bw - 1, by + 6, x + 128 - (bx + bw - 1), 1);
                g.text(label, x + 130, by + 2, c, 1, null);
            });
            g.R(P.blue, x + 56, y + 40, 16, 10);
            g.text('CHIP', x + 130, y + 52, P.blue, 1, null);
            for (let k = 0; k < 3; k++) // heat radiation, stopped at the outer shields
                g.line(x - 2 + k * 3, y + 30 + k * 16, x + 14, y + 34 + k * 16, RED);
        }},

        // the dilution unit: still, heat exchangers, mixing chamber with its two phases
        dilution: {h: 100, draw(g, x, y) {
            g.R(P.gold, x + 20, y + 8, 40, 18);                 // the still
            g.R('#3a2a00', x + 21, y + 9, 38, 16);
            for (const [dx, dy] of [[8, 3], [18, 6], [28, 2], [14, 11], [32, 9]])
                g.R(P.white, x + 21 + dx, y + 9 + dy, 1, 1);
            g.text('STILL <1 K', x + 66, y + 12, P.white, 1, null);
            g.R(SILVER, x + 60, y + 4, 90, 1);                  // pumped out at the top
            g.text('TO PUMPS', x + 152, y, P.dim, 1, null);
            g.R(SILVER, x + 40, y + 26, 1, 14);                 // down to the exchangers
            for (let k = 0; k < 4; k++)
                g.R(SILVER, x + 30, y + 40 + k * 6, 22, 3);
            g.text('HEAT EXCHANGERS', x + 66, y + 42, P.dim, 1, null);
            g.text('(SINTERED SILVER)', x + 66, y + 52, P.dim, 1, null);
            g.R(SILVER, x + 40, y + 64, 1, 8);
            g.R(SILVER, x + 14, y + 72, 52, 26);                // the mixing chamber
            g.R(P.gold, x + 15, y + 73, 50, 9);                 // helium-3 rich, floating
            g.R(P.blue, x + 15, y + 82, 50, 15);                // dilute, 6.6% helium-3
            g.text('MIXING ~0.01 K', x + 72, y + 74, P.white, 1, null);
            g.text('RICH / DILUTE', x + 72, y + 86, P.gold, 1, null);
            g.R(P.green, x + 8, y + 6, 1, 76);                  // helium-3 returning
            g.R(P.green, x + 8, y + 82, 7, 1);
            g.R(P.green, x + 8, y + 6, 12, 1);
            g.text('3HE BACK', x + 160, y + 26, P.green, 1, null);
            g.R(P.green, x + 150, y + 4, 1, 26);
        }},

        // the wiring: a drive line with attenuators, an output line with amplifiers
        wiring: {h: 104, draw(g, x, y) {
            const stages = [['300 K', 4], ['50 K', 22], ['4 K', 40], ['0.1 K', 58], ['0.01 K', 76]];
            for (const [t, sy] of stages) {
                g.R('#3a3850', x + 4, y + sy, 150, 1);
                g.text(t, x + 160, y + sy - 4, P.dim, 1, null);
            }
            g.R(P.blue, x + 30, y + 4, 1, 86);                  // drive line
            g.R(P.blue, x + 110, y + 4, 1, 86);                 // output line
            for (const sy of [40, 58, 76]) {                     // attenuators on the drive line
                g.R(P.white, x + 26, y + sy - 3, 9, 6);
                g.R(P.navy, x + 27, y + sy - 2, 7, 4);
            }
            g.text('ATTENUATORS', x + 36, y + 47, P.white, 1, null);
            g.R(P.gold, x + 104, y + 36, 13, 9);                 // HEMT at 4 K
            g.text('HEMT', x + 120, y + 36, P.gold, 1, null);
            g.R(P.gold, x + 104, y + 70, 13, 9);                 // parametric amplifier
            g.text('TWPA', x + 120, y + 70, P.gold, 1, null);
            g.circle(x + 110, y + 85, 3, P.green);               // a circulator
            g.text('ISOLATOR', x + 118, y + 82, P.green, 1, null);
            g.R(P.blue, x + 22, y + 92, 96, 8);                  // the chip
            g.text('CHIP', x + 60, y + 92, P.white, 1, null);
            g.text('IN', x + 18, y - 2, P.white, 1, null);
            g.text('OUT', x + 98, y - 2, P.white, 1, null);
        }},

        // dispersive readout: each shot is a point in the IQ plane, two clouds for 0 and 1
        readout: {h: 80, draw(g, x, y) {
            const cx = x + 60, cy = y + 40;
            g.R('#3a3850', x + 10, cy, 100, 1);
            g.R('#3a3850', cx, y + 4, 1, 72);
            g.text('I', x + 112, cy - 4, P.dim, 1, null);
            g.text('Q', cx + 3, y, P.dim, 1, null);
            let s = 7;
            const rnd = () => {
                s = (s * 1103515245 + 12345) % 2147483648;
                return s / 2147483648;
            };
            for (const [mx, my, c] of [[-22, -14, P.blue], [22, 14, P.gold]])
                for (let k = 0; k < 40; k++) {
                    const r = 9 * Math.sqrt(-2 * Math.log(rnd() + 1e-9)), a = 2 * Math.PI * rnd();
                    g.R(c, Math.round(cx + mx + r * Math.cos(a) * 0.6), Math.round(cy + my + r * Math.sin(a) * 0.6), 1, 1);
                }
            for (let k = -30; k <= 30; k += 3) // the threshold line
                g.R(P.white, cx + k, cy - k, 1, 1);
            g.text('0', cx - 40, cy - 30, P.blue, 1, null);
            g.text('1', cx + 34, cy + 22, P.gold, 1, null);
            g.text('ONE DOT: ONE SHOT', x + 120, y + 20, P.dim, 1, null);
            g.text('LINE: 0 OR 1?', x + 120, y + 34, P.white, 1, null);
        }},

        // the levels of a ytterbium-171 ion: the qubit, and the laser that makes |1> glow
        ionlevels: {h: 82, draw(g, x, y) {
            g.R(P.white, x + 20, y + 8, 70, 1);
            g.text('P STATE', x + 96, y + 3, P.dim, 1, null);
            g.R(P.white, x + 20, y + 52, 70, 1);
            g.R(P.white, x + 20, y + 60, 70, 1);
            g.text('|1>', x + 96, y + 46, P.gold, 1, null);
            g.text('|0>', x + 96, y + 57, P.blue, 1, null);
            g.text('12.6 GHZ APART', x + 122, y + 52, P.dim, 1, null);
            g.line(x + 50, y + 51, x + 50, y + 10, '#a050e0');   // the 369.5 nm laser
            for (let k = 0; k < 5; k++)                           // scattered light
                g.R('#a050e0', x + 58 + (k % 2) * 3, y + 16 + k * 6, 2, 2);
            g.text('369.5 NM', x + 66, y + 22, '#a050e0', 1, null);
            g.text('|1> GLOWS, |0> STAYS DARK', x + 4, y + 70, P.white, 1, null);
        }},

        // down-conversion: one pump photon becomes two in a nonlinear crystal
        spdc: {h: 60, draw(g, x, y) {
            g.R('#a050e0', x + 4, y + 28, 70, 1);
            g.text('PUMP LASER', x + 4, y + 18, '#a050e0', 1, null);
            g.R(P.gold, x + 74, y + 20, 18, 18);
            g.R('#3a2a00', x + 75, y + 21, 16, 16);
            g.text('CRYSTAL', x + 62, y + 42, P.gold, 1, null);
            g.line(x + 92, y + 28, x + 180, y + 6, RED);
            g.line(x + 92, y + 30, x + 180, y + 52, RED);
            g.circle(x + 185, y + 6, 4, P.green);
            g.circle(x + 185, y + 52, 4, P.green);
            g.text('HERALD', x + 192, y + 2, P.green, 1, null);
            g.text('PHOTON', x + 192, y + 48, P.green, 1, null);
        }},

        // a superconducting nanowire single-photon detector
        snspd: {h: 64, draw(g, x, y) {
            g.R(P.gold, x + 40, y + 8, 100, 44);
            g.R('#3a2a00', x + 41, y + 9, 98, 42);
            for (let k = 0; k < 9; k++) { // the meander nanowire
                g.R(P.white, x + 48 + k * 10, y + 14, 1, 32);
                if (k < 8)
                    g.R(P.white, x + 48 + k * 10, k % 2 ? y + 14 : y + 45, 11, 1);
            }
            g.R(RED, x + 77, y + 26, 4, 4); // the hot spot
            g.line(x + 10, y + 6, x + 76, y + 26, RED);
            g.text('PHOTON', x + 2, y + 10, RED, 1, null);
            g.text('NANOWIRE', x + 148, y + 14, P.white, 1, null);
            g.text('HOT SPOT', x + 148, y + 28, RED, 1, null);
            g.text('= CLICK', x + 148, y + 40, P.green, 1, null);
        }},

        // a magneto-optical trap: six laser beams and two coils around a cold cloud
        mot: {h: 84, draw(g, x, y) {
            const cx = x + 80, cy = y + 42;
            g.R(RED, x + 10, cy, 140, 1);
            g.R(RED, cx, y + 4, 1, 76);
            g.line(cx - 40, cy + 30, cx + 40, cy - 30, RED);
            g.R(P.gold, cx - 24, y + 8, 48, 4);
            g.R(P.gold, cx - 24, y + 72, 48, 4);
            for (const [dx, dy] of [[0, 0], [-2, 1], [2, -1], [1, 2], [-1, -2], [3, 1], [-3, -1]])
                g.R(P.white, cx + dx, cy + dy, 1, 1);
            g.text('COILS', cx + 30, y + 6, P.gold, 1, null);
            g.text('6 LASER BEAMS', x + 150, cy - 10, RED, 1, null);
            g.text('COLD CLOUD', x + 150, cy + 4, P.white, 1, null);
        }},
    };
})();
