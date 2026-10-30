// Writes asm/gen/data.asm: the data of the assembler Qubit Quest, taken from the web game so
// both teach the same thing: the pixel font (each glyph exactly as src/font.js draws it), the
// worlds, levels and steps, gate labels and tips, and the interface texts. Strings become
// glyph numbers (asm/core/data.inc); lesson text is upper case as in the web game, code and
// sources keep their case. Only data: wrapping, paging, puzzles and goals are in the core.
// `make test` fails when the file is out of date. Run: node tools/asm-data.js
const fs = require('fs');
const path = require('path');

// interface texts the core shows; U_<name> in the assembler
const UI = {
    TITLE: 'QUBIT QUEST',
    TAGLINE: 'LEARN QUANTUM COMPUTING FROM ZERO',
    START: 'START',
    SELECT: 'SELECT LEVEL',
    QUIT: 'QUIT',
    SPINOFF: 'A BLACKBREAK SPIN-OFF',
    CORE: 'CORE: X86-64 ASSEMBLER',
    LEVELS: 'LEVELS',
    WORLD: 'WORLD',
    LOCKED: 'LOCKED',
    NEXT: 'ENTER: NEXT',
    BACK: 'LEFT: BACK',
    ELI5: 'E: ELI5',
    HINTKEY: '?: HINT',
    UNDO: 'BKSP: UNDO',
    ESC: 'ESC: MAP',
    CLOSE: 'ESC: CLOSE',
    RIGHT: 'RIGHT!',
    WRONG: 'NOT QUITE. TRY AGAIN.',
    SOLVED: 'SOLVED!',
    PAR: 'PAR',
    GATES: 'GATES',
    STATE: 'STATE',
    GOAL: 'GOAL',
    PICK2: 'TAP THE OTHER WIRE',
    PICKT: 'TAP THE TARGET WIRE',
    PICKC2: 'TAP THE SECOND CONTROL WIRE',
    NOTALLOWED: 'THAT GATE IS NOT ALLOWED ON THOSE WIRES HERE.',
    LIMIT: 'NO MORE OF THAT GATE HERE.',
    FULL: 'THE CIRCUIT IS FULL: UNDO A GATE.',
    BOXRAN: 'THE BLACK BOX RAN ONCE.',
    DONE: 'LEVEL DONE',
    STARS: 'STARS',
    DONENEXT: 'ENTER: NEXT LEVEL   ESC: MAP',
    ELI5TITLE: 'EXPLAIN LIKE I AM FIVE',
    HINT: 'HINT',
    PAGE: 'PAGE',
    OF: '/',
    WIRE: 'Q',
    MAPKEYS: 'ENTER: PLAY  ARROWS: CHOOSE  ESC: BACK',
    TEXTKEYS: 'ENTER: NEXT  LEFT: BACK  E: ELI5  ESC: MAP',
    QUIZKEYS: '1-4: ANSWER  LEFT: BACK  E: ELI5  ESC: MAP',
    CIRCKEYS: 'GATE KEYS  0-2: WIRE  BKSP: UNDO  ?: HINT',
    SOLVEDKEYS: 'ENTER: NEXT  E: ELI5  ESC: MAP',
    OVKEYS: 'ENTER: MORE  ESC: CLOSE',
    OVLAST: 'ENTER / ESC: CLOSE',
    OVERPAR: 'MORE GATES THAN NEEDED: ONE STAR LESS.',
    CIRCKEYS2: '0-2:WIRE BKSP:UNDO ?:HINT O:VIEW M:MEASURE A:EXACT',
    TAB_STATE: 'STATE',
    TAB_BLOCH: 'BLOCH',
    TAB_SHOTS: 'SHOTS',
    SHOTSINFO: 'EACH SHOT GIVES ONE RESULT. ONLY MANY SHOTS SHOW THE CHANCES: THE TICKS MARK THE EXACT ONES.',
    BLOCHINFO: 'ONE SPHERE PER QUBIT. AN ARROW SHORTER THAN THE RADIUS: THAT QUBIT IS ENTANGLED WITH THE OTHERS.',
    EXACT: 'EXACT STATE',
    EXACTHEAD: 'BASIS    AMPLITUDE         CHANCE  PHASE',
    EXACTBLOCH: 'BLOCH VECTORS (LENGTH 1: PURE, 0: FULLY MIXED)',
    ENTANGLED: 'ENTANGLED',
};

function build() {
    delete require.cache[require.resolve('../test/load.js')];
    const QQ = require('../test/load.js');

    // ---------------------------------------------------------------- glyphs
    // draw one character with the web font into a fake canvas and read back its pixels
    const bitmap = (ch, keepCase) => {
        const rows = Array(11).fill(0);
        const ctx = {
            set fillStyle(v) {},
            fillRect(x, y, w, h) {
                if (x >= 0 && x < 5 && y >= 0 && y < 11)
                    rows[y] |= 1 << (4 - x);
            },
        };
        QQ.drawText(ctx, QQ.hasGlyph(ch, keepCase) ? ch : '?', 0, 0, 1, '#fff', null, keepCase);
        return rows;
    };
    const glyphs = [Array(11).fill(0), Array(11).fill(0), Array(11).fill(0)]; // end, newline, space
    const byBits = new Map();
    const glyphOf = (ch, keepCase) => {
        if (ch === '\n')
            return 1;
        if (ch === ' ')
            return 2;
        const rows = bitmap(ch, keepCase);
        const key = rows.join(',');
        if (!byBits.has(key)) {
            byBits.set(key, glyphs.length);
            glyphs.push(rows);
        }
        return byBits.get(key);
    };
    const encode = (text, keepCase = false) => [...String(text)].map(ch => glyphOf(ch, keepCase));

    // ---------------------------------------------------------------- strings
    const out = [];
    const picStats = []; // for the tests: pixels of each colour in each drawing
    const strings = new Map(); // dedupe identical strings
    const str = (text, keepCase = false) => {
        if (text === undefined || text === null)
            return '0';
        const codes = encode(text, keepCase);
        const key = codes.join(',');
        if (!strings.has(key)) {
            const label = 'S_' + strings.size;
            strings.set(key, label);
            out.push(`${label}: db ${[...codes, 0].join(',')}`);
        }
        return strings.get(key);
    };

    const G = {X: 1, Y: 2, Z: 3, H: 4, S: 5, SDG: 6, T: 7, TDG: 8, CX: 9, CZ: 10, CS: 11, CSDG: 12, SWAP: 13, CCX: 14};
    const names = Object.keys(G);
    let blob = 0;
    const bytes = list => {
        const label = 'B_' + blob++;
        out.push(`${label}: db ${list.length ? list.join(',') : '0'}`);
        return label;
    };
    const ops = (list, boxNames) => bytes(list.flatMap(([name, ...w]) => {
        const g = boxNames.includes(name) ? 32 + boxNames.indexOf(name) : G[name];
        if (!g)
            throw new Error('unknown gate ' + name);
        return [g, ...w, 0, 0, 0].slice(0, 4);
    }));

    // ---------------------------------------------------------------- hardware drawings
    // each drawing of src/pics.js, drawn by its own code into a pixel grid with the same
    // rectangles, lines, circles and font as the web game, then run-length encoded
    const picNames = Object.keys(QQ.PICS);
    const picColors = [];
    const colorIndex = c => {
        const k = c.toLowerCase();
        if (!picColors.includes(k))
            picColors.push(k);
        return picColors.indexOf(k) + 1;
    };
    const pics = picNames.map(name => {
        const P = QQ.PICS[name], w = 230, h = P.h;
        const px = new Uint8Array(w * h);
        const R = (c, x, y, rw, rh) => {
            const k = colorIndex(c);
            for (let yy = Math.round(y); yy < Math.round(y) + rh; yy++)
                for (let xx = Math.round(x); xx < Math.round(x) + rw; xx++)
                    if (xx >= 0 && xx < w && yy >= 0 && yy < h)
                        px[yy * w + xx] = k;
        };
        const ctx = {c: '#000', set fillStyle(v) { this.c = v; }, fillRect(x, y, rw, rh) { R(this.c, x, y, rw, rh); }};
        const text = (t, x, y, c = QQ.PAL.white, size = 1, sh = QQ.PAL.shadow, keep = false) =>
            QQ.drawText(ctx, t, x, y, size, c, sh, keep);
        const line = (x0, y0, x1, y1, c) => { // as src/game.js draws them
            x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
            const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
            let e = dx + dy;
            for (;;) {
                R(c, x0, y0, 1, 1);
                if (x0 === x1 && y0 === y1)
                    break;
                const e2 = 2 * e;
                if (e2 >= dy) { e += dy; x0 += sx; }
                if (e2 <= dx) { e += dx; y0 += sy; }
            }
        };
        const circle = (cx, cy, r, c) => {
            let x = r, y = 0, e = 1 - r;
            while (x >= y) {
                for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]])
                    R(c, cx + a, cy + b, 1, 1);
                y++;
                if (e < 0) {
                    e += 2 * y + 1;
                } else {
                    x--;
                    e += 2 * (y - x) + 1;
                }
            }
        };
        P.draw({R, text, line, circle}, 0, 0, w);
        const runs = [];
        for (let y = 0; y < h; y++) {
            let x = 0;
            while (x < w) {
                let n = 1;
                while (x + n < w && n < 255 && px[y * w + x + n] === px[y * w + x])
                    n++;
                runs.push(n, px[y * w + x]);
                x += n;
            }
        }
        runs.push(0, 0);
        const label = 'PIC_' + name;
        out.push(`${label}: db ${runs.join(',')}`);
        const counts = {};
        px.forEach(k => { if (k) counts[k] = (counts[k] || 0) + 1; });
        picStats.push({name, w, h, counts});
        return {label, w, h};
    });
    if (picColors.length > 15)
        throw new Error('too many drawing colours');

    // ---------------------------------------------------------------- levels
    const steps = [];
    const levels = QQ.LEVELS.map((L, li) => {
        const first = steps.length;
        L.steps.forEach((S, si) => {
            const f = {pic: 0, demo: '0', ndemo: 0, demoq: 0,
                type: 0, title: '0', body: '0', eli5: str(QQ.eli5For(L, si)), hint: '0', opts: '0', nopts: 0,
                answer: 0, qubits: 0, gates: '0', ngates: 0, par: 0, setup: '0', nsetup: 0, after: '0', nafter: 0,
                boxes: '0', sol: '0', nsol: 0, keep: 0, flags: 0, limits: '0', allow: '0', boxnames: '0'};
            if (S.type === 'text') {
                f.title = str(S.title);
                f.body = str(S.body);
                if (S.pic)
                    f.pic = picNames.indexOf(S.pic) + 1;
                if (S.demo) {
                    f.demo = ops(S.demo.ops, []);
                    f.ndemo = S.demo.ops.length;
                    f.demoq = S.demo.qubits;
                }
            } else if (S.type === 'quiz') {
                f.type = 1;
                f.title = str(S.q);
                f.body = str(S.why);
                const labels = S.options.map(o => str(o));
                f.opts = 'O_' + blob++;
                out.push(`${f.opts}: dq ${labels.join(',')}`);
                f.nopts = S.options.length;
                f.answer = S.answer;
            } else {
                f.type = 2;
                const boxNames = Object.keys(S.boxes || {}).sort();
                f.title = str(S.goal);
                f.hint = str(S.hint);
                f.qubits = S.qubits;
                f.gates = bytes(S.gates.map(g => boxNames.includes(g) ? 32 + boxNames.indexOf(g) : G[g]));
                f.ngates = S.gates.length;
                f.par = S.par;
                f.setup = ops(S.setup || [], boxNames);
                f.nsetup = (S.setup || []).length;
                f.after = ops(S.after || [], boxNames);
                f.nafter = (S.after || []).length;
                f.sol = ops(S.solution, boxNames);
                f.nsol = S.solution.length;
                f.keep = (S.goalQubits || []).reduce((m, q) => m | (1 << q), 0);
                f.flags = S.probsOnly ? 1 : 0;
                if (boxNames.length) {
                    const table = boxNames.map(b => `${ops(S.boxes[b], [])},${S.boxes[b].length}`);
                    f.boxes = 'X_' + blob++;
                    out.push(`${f.boxes}: dq ${table.join(',')}`);
                    f.boxnames = 'N_' + blob++;
                    out.push(`${f.boxnames}: dq ${boxNames.map(b => str(b)).join(',')}`);
                }
                f.limits = bytes(S.gates.map(g => S.limits && S.limits[g] !== undefined ? S.limits[g] : 255));
                const rules = S.gates.map(g => {
                    const rule = S.allow && S.allow[g];
                    if (!rule)
                        return '0';
                    const sym = QQ.GATES[g] && QQ.GATES[g].sym;
                    const tuples = rule.map(r => (Array.isArray(r) ? r : [r]).slice()).map(w => sym ? w.sort() : w);
                    return bytes([tuples.length, ...tuples.flatMap(w => [...w, 0, 0, 0].slice(0, 3))]);
                });
                f.allow = 'A_' + blob++;
                out.push(`${f.allow}: dq ${rules.join(',')}`);
            }
            steps.push(f);
        });
        return {title: str(L.title), first, n: L.steps.length, world: L.world - 1};
    });

    // ---------------------------------------------------------------- gates and interface
    const gateLabels = ['0', ...names.map(g => str(QQ.GATES[g].label))];
    const gateTips = ['0', ...names.map(g => str(QQ.GATE_TIPS[g] || ''))];
    const gateKeys = [0, ...names.map(g => QQ.GATES[g].key.charCodeAt(0))];
    const ui = Object.entries(UI).map(([k, v]) => `U_${k}: dq ${str(v)}`);
    const g_deg = glyphOf('°'), g_pct = glyphOf('%'), g_i = glyphOf('i', true); // before the table is written
    const worlds = QQ.WORLDS.map(w => str(w.title));
    // ASCII 32..126 in lesson (upper case) glyphs, for text the core builds (numbers, kets)
    const ascii = [];
    for (let c = 32; c < 127; c++)
        ascii.push(glyphOf(String.fromCharCode(c), false));
    // the qubit icon: 16 x 16 colour numbers (0 = none), colours from the web icon
    const iconSrc = fs.readFileSync(path.join(QQ.root, 'src', 'font.js'), 'utf8');
    const iconRows = [...iconSrc.match(/const ICON = \[([\s\S]*?)\];/)[1].matchAll(/'([^']*)'/g)].map(m => m[1]);
    const iconPal = JSON.parse(iconSrc.match(/const ICON_PAL = (\{[^}]*\})/)[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
    const iconKeys = Object.keys(iconPal);
    const icon = iconRows.join('').split('').map(ch => ch === '.' ? 0 : iconKeys.indexOf(ch) + 1);
    const iconColors = iconKeys.map(k => '0x' + iconPal[k].slice(1));

    const lines = [
        '; Generated by tools/asm-data.js from the web game\'s levels, font and texts. Do not edit.',
        'bits 64',
        'default rel',
        '%include "core/sim.inc"',
        '%include "core/data.inc"',
        'section .rodata',
        'align 8',
        `global GLYPHS, GLYPH_COUNT, LEVELS, LEVEL_COUNT, STEPS, WORLDS, WORLD_COUNT, GATE_LABELS, GATE_TIPS, GATE_KEYS, ASCII, ICON, ICON_COLORS, PICS, PIC_COUNT, PIC_COLORS, G_DEG, G_PCT, G_I`,
        `global ${Object.keys(UI).map(k => 'U_' + k).join(', ')}`,
        `GLYPH_COUNT: dq ${glyphs.length}`,
        `LEVEL_COUNT: dq ${levels.length}`,
        `WORLD_COUNT: dq ${worlds.length}`,
        'GLYPHS:',
        ...glyphs.map(rows => `    db ${rows.join(',')}`),
        'align 8',
        'LEVELS:',
        ...levels.map(l => `    dq ${l.title}, STEPS + ${l.first} * ST_SIZE, ${l.n}, ${l.world}`),
        'STEPS:',
        ...steps.map(f => `    dq ${[f.type, f.title, f.body, f.eli5, f.hint, f.opts, f.nopts, f.answer, f.qubits,
            f.gates, f.ngates, f.par, f.setup, f.nsetup, f.after, f.nafter, f.boxes, f.sol, f.nsol, f.keep, f.flags,
            f.limits, f.allow, f.boxnames, f.pic, f.demo, f.ndemo, f.demoq].join(', ')}`),
        `PIC_COUNT: dq ${pics.length}`,
        'PICS:',
        ...pics.map(p => `    dq ${p.label}\n    dd ${p.w}, ${p.h}`),
        `PIC_COLORS: dd 0, ${picColors.map(c => '0x' + c.slice(1)).join(', ')}`,
        `G_DEG: db ${g_deg}`,
        `G_PCT: db ${g_pct}`,
        `G_I: db ${g_i}`,
        `WORLDS: dq ${worlds.join(', ')}`,
        `GATE_LABELS: dq ${gateLabels.join(', ')}`,
        `GATE_TIPS: dq ${gateTips.join(', ')}`,
        `GATE_KEYS: db ${gateKeys.join(', ')}`,
        `ASCII: db ${ascii.join(', ')}`,
        `ICON: db ${icon.join(',')}`,
        'align 4',
        `ICON_COLORS: dd 0, ${iconColors.join(', ')}`,
        'align 8',
        ...ui,
        ...out,
        '',
    ];
    if (glyphs.length > 255)
        throw new Error('too many glyphs: ' + glyphs.length);
    build.picStats = picStats;
    build.picColors = picColors;
    return lines.join('\n');
}

module.exports = build;
if (require.main === module) {
    const file = path.join(__dirname, '..', 'asm', 'gen', 'data.asm');
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, build());
    console.log('asm/gen/data.asm written');
}
