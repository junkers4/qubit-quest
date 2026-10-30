// The game: screens, layout and input. Everything is drawn on a small canvas
// (about 320 x 200 on a desktop, 256+ wide on an upright phone) that the page scales up
// by a whole number with no smoothing, the BlackBreak look.
(function () {
    const QQ = globalThis.QQ;
    const P = QQ.PAL;
    const cv = document.getElementById('screen');
    const ctx = cv.getContext('2d');
    let W = 320, H = 200;
    let hits = [];
    const mouse = {x: -1, y: -1};

    const STORE = 'qubitquest.progress';
    const load = () => {
        try {
            return JSON.parse(localStorage.getItem(STORE)) || {};
        } catch (e) {
            return {};
        }
    };
    let progress = load();
    const save = () => {
        try {
            localStorage.setItem(STORE, JSON.stringify(progress));
        } catch (e) {
            // private window: progress lasts until the tab closes
        }
    };
    const unlockAll = /[?&]all\b/.test(location.search);
    const unlocked = i => unlockAll || i === 0 || progress[QQ.LEVELS[i - 1].id] > 0 || progress[QQ.LEVELS[i].id] > 0;

    // the whole game state; `overlay` is a reader window (ELI5, code, sources, gate book...) on top
    const G = {screen: 'title', level: 0, step: 0, page: 0, pages: 1, pen: 0, ss: [], mapSel: 0, mapPage: 0,
        armReset: false, info: '', overlay: null};

    // ------------------------------------------------------------ drawing helpers
    const R = (c, x, y, w, h) => QQ.rect(ctx, c, x, y, w, h);
    const text = (s, x, y, c = P.white, px = 1, sh = P.shadow, keep = false) => QQ.drawText(ctx, s, x, y, px, c, sh, keep);
    const tw = (s, px = 1) => QQ.textWidth(s, px);
    const centre = (s, y, c, px = 1, sh) => text(s, Math.floor((W - tw(s, px)) / 2), y, c, px, sh);
    const hit = (x, y, w, h, fn, keep) => hits.push({x, y, w, h, fn, keep});
    const over = (x, y, w, h) => mouse.x >= x && mouse.x < x + w && mouse.y >= y && mouse.y < y + h;
    const RED = '#e83838';

    // A Doom-menu button: blue edge on navy, gold when the pointer is on it.
    function button(x, y, w, h, label, fn, o = {}) {
        const hov = !o.disabled && over(x, y, w, h);
        R(o.disabled ? '#1a1a40' : hov || o.active ? P.gold : o.edge || P.blue, x, y, w, h);
        R(o.fill || P.navy, x + 1, y + 1, w - 2, h - 2);
        const c = o.disabled ? '#3a3a60' : o.color || (hov ? P.gold : P.white);
        text(label, x + Math.floor((w - tw(label)) / 2), y + Math.floor((h - 7) / 2) - 2, c, 1, null);
        if (!o.disabled)
            hit(x, y, w, h, fn, o.keep);
    }
    const bw = label => tw(label) + 10;
    // content must end above the footer; the screenshot test reads G.overflow
    const fits = (y, what) => {
        if (y > H - 24 && !G.overflow)
            G.overflow = `${QQ.LEVELS[G.level].id} step ${G.step + 1}: ${what} ends at ${y} of ${H - 24}`;
    };

    function frame() {
        R(P.red, 2, 2, W - 4, 2);
        R(P.red, 2, H - 4, W - 4, 2);
        R(P.red, 2, 2, 2, H - 4);
        R(P.red, W - 4, 2, 2, H - 4);
    }

    function segBar(x, y, w, n, lit, h = 3, cur = -1) {
        const seg = w / n;
        for (let i = 0; i < n; i++)
            R(i === cur ? P.gold : i < lit ? P.green : P.darkgreen, x + Math.floor(i * seg), y,
                Math.max(1, Math.floor(seg) - 1), h);
    }

    const STAR = ['....#....', '....#....', '...###...', '#########', '.#######.', '..#####..', '..##.##..', '.##...##.', '.#.....#.'];
    function star(x, y, f, on) {
        STAR.forEach((row, r) => {
            for (let c = 0; c < 9; c++)
                if (row[c] === '#')
                    R(on ? P.gold : '#3a3428', x + c * f, y + r * f, f, f);
        });
    }

    // the night sky of the BlackBreak rest screen: stars, a far sun, drifting hills
    const SKY = (() => {
        let s = 20;
        const next = n => {
            s = (s * 1103515245 + 12345) % 2147483648;
            return s % n;
        };
        return Array.from({length: 60}, () => [next(1000), next(700)]);
    })();
    const tri = u => Math.abs(2 * (u - Math.floor(u)) - 1);
    function ridge(scroll, period, amp, base, color) {
        for (let i = 0; i < W / 2 + 2; i++) {
            const u = (i + scroll) / period;
            const top = base - Math.round((tri(u) + 0.5 * tri(u * 2.3 + 0.4)) * amp / 2) * 2;
            R(color, i * 2, top, 2, H - top);
        }
    }
    function scene(t, hills = true) {
        R(P.bg, 0, 0, W, H);
        SKY.forEach(([sx, sy], i) => {
            const on = (Math.floor(t * 1.5) + i) % 5 !== 0;
            R(on ? '#8c88a8' : '#3a3850', Math.floor(sx * W / 2000) * 2, Math.floor(sy * H / 2000) * 2, 1, 1);
        });
        if (!hills)
            return;
        const r = 7, sx = Math.floor(W * 0.78), sy = Math.floor(H * 0.84);
        for (let dy = -r; dy <= r; dy++)
            for (let dx = -r; dx <= r; dx++)
                if (dx * dx + dy * dy <= r * r)
                    R(dy > 2 ? '#c88018' : P.gold, sx + dx, sy + dy, 1, 1);
        ridge(t * 0.6, 11, H * 0.05, Math.floor(H * 0.88), '#1c1c6c');
        ridge(t * 1.1 + 7, 7, H * 0.045, Math.floor(H * 0.93), '#14144c');
        ridge(t * 1.8 + 3, 4.5, H * 0.03, Math.floor(H * 0.975), '#0a0a2e');
    }

    function line(x0, y0, x1, y1, c) {
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
    }

    function circle(cx, cy, r, c) {
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
    }

    // ------------------------------------------------------------ the quantum widgets
    const PHASE = {'+': P.green, '-': RED, 'i': P.blue, '-i': P.gold, other: P.purple, none: P.dim};
    const COL = 14; // circuit column width
    const WIRE = 20; // distance between wires

    function gateBox(cx, wy, label, fixed) {
        const ink = fixed ? '#8a8478' : P.white;
        R(fixed ? '#3a3830' : P.blue, cx, wy - 5, 11, 11);
        R(fixed ? '#1a1a18' : P.navy, cx + 1, wy - 4, 9, 9);
        text(label[0], cx + 3, wy - 6, ink, 1, null);
        if (label.length > 1) { // a small dagger: S† and T†
            R(ink, cx + 9, wy - 3, 1, 4);
            R(ink, cx + 8, wy - 2, 3, 1);
        }
    }

    // One op at column x. fixed ops (setup, after) are grey.
    function drawOp(op, cx, y, n, fixed, boxes) {
        const [g] = op;
        const wy = q => y + 8 + q * WIRE;
        const ink = fixed ? '#8a8478' : P.white;
        if (QQ.isBox(g, boxes)) {
            const ws = QQ.boxWires(g, boxes);
            const top = wy(ws[0]) - 6, h = (ws[ws.length - 1] - ws[0]) * WIRE + 12;
            R(fixed ? '#5a5040' : P.gold, cx, top, 11, h);
            R(fixed ? '#2a2418' : '#3a2a00', cx + 1, top + 1, 9, h - 2);
            text(g[0], cx + 3, top + Math.floor(h / 2) - 5, fixed ? '#8a8478' : P.gold, 1, null);
            return;
        }
        const wires = op.slice(1);
        if (wires.length === 1) {
            gateBox(cx, wy(wires[0]), QQ.GATES[g].label, fixed);
            return;
        }
        const ys = wires.map(wy);
        R(ink, cx + 5, Math.min(...ys), 1, Math.max(...ys) - Math.min(...ys));
        const dot = yy => R(ink, cx + 4, yy - 1, 3, 3);
        const plus = yy => {
            R(P.bg, cx + 2, yy - 3, 7, 7);
            circle(cx + 5, yy, 3, ink);
            R(ink, cx + 2, yy, 7, 1);
            R(ink, cx + 5, yy - 3, 1, 7);
        };
        if (g === 'SWAP') {
            for (const yy of ys)
                for (let k = -2; k <= 2; k++) {
                    R(ink, cx + 5 + k, yy + k, 1, 1);
                    R(ink, cx + 5 + k, yy - k, 1, 1);
                }
        } else if (g === 'CX' || g === 'CCX') {
            ys.slice(0, -1).forEach(dot);
            plus(ys[ys.length - 1]);
        } else if (g === 'CZ') {
            ys.forEach(dot);
        } else if (g === 'CS' || g === 'CSDG') {
            dot(ys[0]);
            gateBox(cx, ys[1], g === 'CS' ? 'S' : 'S†', fixed);
        }
    }

    // A circuit: wires q0.., fixed (grey) setup gates, the player's gates, fixed gates at the end.
    // Returns the height used. `sel` is the chosen wire (or -1); `picked` wires are marked too.
    function drawCircuit(x, y, w, n, setup, ops, sel, onWire, o = {}) {
        const after = o.after || [];
        for (let q = 0; q < n; q++) {
            const wy = y + 8 + q * WIRE;
            const chosen = q === sel || (o.picked || []).includes(q);
            R(chosen ? P.gold : '#5a5650', x + 18, wy, w - 18, 1);
            text((chosen ? '>' : ' ') + 'Q' + q, x - 6, wy - 6, chosen ? P.gold : P.dim, 1, null);
            if (onWire)
                hit(x - 6, wy - WIRE / 2, w + 6, WIRE, () => onWire(q));
        }
        const main = [...setup.map(op => [op, true]), ...ops.map(op => [op, false])];
        const room = Math.floor((w - 22 - after.length * COL - 4) / COL);
        main.forEach(([op, fixed], i) => {
            if (i < room)
                drawOp(op, x + 22 + i * COL, y, n, fixed, o.boxes);
        });
        after.forEach((op, i) => drawOp(op, x + w - (after.length - i) * COL, y, n, true, o.boxes));
        if (after.length)
            for (let yy = y; yy < y + n * WIRE; yy += 3)
                R('#3a3850', x + w - after.length * COL - 4, yy, 1, 1);
        return n * WIRE;
    }

    // The amplitudes of `state` with a probability bar each, and the goal's amplitudes.
    // A tiny clock for the phase of an amplitude: the hand points along its angle.
    function dial(x, y, z, c) {
        circle(x + 3, y + 3, 3, '#3a3850');
        if (QQ.prob(z) < 1e-6)
            return;
        const a = Math.atan2(z[1], z[0]);
        line(x + 3, y + 3, x + 3 + Math.round(3 * Math.cos(a)), y + 3 - Math.round(3 * Math.sin(a)), c);
    }
    const mag = z => {
        const m = Math.round(Math.sqrt(QQ.prob(z)) * 100) / 100;
        return m === 0 ? '0' : m === 1 ? '1' : m.toFixed(2);
    };

    // The state: per basic state a probability bar, the size of the amplitude and a dial for
    // its phase (colour too); the goal's next to it. Tap it for the exact complex numbers.
    function drawState(x, y, n, state, goal) {
        const bx = x + 6 * (n + 2) + 2, mx = bx + 34, dx = mx + 26, gx = dx + 15;
        text('STATE', x, y, P.dim, 1, null);
        if (goal)
            text('GOAL', gx, y, P.dim, 1, null);
        const cg = goal && QQ.canonical(goal);
        state.forEach((z, i) => {
            const yy = y + 12 + i * 11;
            text(QQ.ket(i, n), x, yy, P.white, 1, null);
            const c = PHASE[QQ.phaseName(z)];
            const lit = Math.round(QQ.prob(z) * 10);
            for (let k = 0; k < 10; k++)
                R(k < lit ? c : P.darkgreen, bx + k * 3, yy + 3, 2, 5);
            text(mag(z), mx, yy, c, 1, null);
            dial(dx, yy + 2, z, c);
            if (cg) {
                const gc = PHASE[QQ.phaseName(cg[i])];
                text(mag(cg[i]), gx, yy, gc, 1, null);
                dial(gx + 26, yy + 2, cg[i], gc);
            }
        });
        return 12 + state.length * 11;
    }

    function openAmplitudes(S, now, goal) {
        const n = S.qubits, cg = QQ.canonical(goal);
        openReader('EXACT AMPLITUDES', () => {
            const out = [{t: 'NOW            CHANCE', c: P.dim}];
            now.forEach((z, i) => out.push({t: `${QQ.ket(i, n)} ${QQ.ampText(z).padEnd(11)} ${QQ.prob(z).toFixed(3)}`,
                c: PHASE[QQ.phaseName(z)]}));
            out.push({t: ''});
            if (S.goalQubits) {
                const b = QQ.reduced(goal, n, S.goalQubits);
                out.push({t: `GOAL: ONLY ${S.goalQubits.map(q => 'Q' + q).join(' ')} COUNT`, c: P.dim});
                b.forEach((row, i) => out.push({t: `${QQ.ket(i, S.goalQubits.length)} CHANCE ${row[i][0].toFixed(3)}`, c: P.gold}));
            } else {
                out.push({t: 'GOAL (UP TO A GLOBAL PHASE)', c: P.dim});
                cg.forEach((z, i) => out.push({t: `${QQ.ket(i, n)} ${QQ.ampText(z)}`, c: PHASE[QQ.phaseName(z)]}));
            }
            out.push({t: ''});
            out.push({t: 'GREEN + RED − BLUE +I GOLD −I', c: P.dim});
            out.push({t: 'PURPLE: AN ANGLE IN BETWEEN', c: P.dim});
            return out;
        });
    }

    // The Bloch sphere from the side: up |0>, down |1>, right |+>, left |->.
    // A shorter arrow means the qubit is entangled with others (a mixed state on its own).
    function drawBloch(cx, cy, r, vec, goalVec) {
        circle(cx, cy, r, '#2c2c7c');
        R('#1c1c4c', cx - r + 1, cy, 2 * r - 1, 1);
        R('#1c1c4c', cx, cy - r + 1, 1, 2 * r - 1);
        text('|0>', cx - 8, cy - r - 11, P.dim, 1, null);
        text('|1>', cx - 8, cy + r + 1, P.dim, 1, null);
        text('+', cx + r + 3, cy - 5, P.dim, 1, null);
        text('-', cx - r - 8, cy - 5, P.dim, 1, null);
        if (goalVec) {
            const [gx, , gz] = goalVec;
            const px = Math.round(cx + gx * r), py = Math.round(cy - gz * r);
            R(P.gold, px - 2, py - 2, 5, 1);
            R(P.gold, px - 2, py + 2, 5, 1);
            R(P.gold, px - 2, py - 2, 1, 5);
            R(P.gold, px + 2, py - 2, 1, 5);
        }
        const [bx, by, bz] = vec;
        const ex = cx + bx * r, ey = cy - bz * r;
        if (Math.hypot(bx, bz) > 0.15)
            line(cx, cy, ex, ey, P.green);
        R(Math.abs(by) > 0.5 ? (by > 0 ? P.blue : P.gold) : P.white, Math.round(ex) - 1, Math.round(ey) - 1, 3, 3);
    }

    // The goal of a puzzle that only cares about some qubits, in the most compact form:
    // a basic state ('Q0 Q1 = |11>'), a Bloch sphere (one qubit), or a list of chances.
    function partGoal(S, goal) {
        const qs = S.goalQubits, b = QQ.reduced(goal, S.qubits, qs);
        const k = b.findIndex((row, i) => row[i][0] > 1 - 1e-9);
        if (k >= 0)
            return {kind: 'basis', k, w: 136, h: 24};
        if (qs.length === 1)
            return {kind: 'bloch', w: 70, h: 72};
        return {kind: 'rows', w: 136, h: 12 + b.length * 11};
    }

    function drawPartGoal(x, y, S, now, goal, g) {
        const qs = S.goalQubits, n = S.qubits;
        const names = qs.map(q => 'Q' + q).join(' ');
        const a = QQ.reduced(now, n, qs), b = QQ.reduced(goal, n, qs);
        if (g.kind === 'basis') {
            text(`GOAL: ${names} = ${QQ.ket(g.k, qs.length)}`, x, y, P.gold, 1, null);
            const p = a[g.k][g.k][0];
            text(`NOW: ${p.toFixed(2)}`, x, y + 12, P.green, 1, null);
            for (let k = 0; k < 10; k++)
                R(k < Math.round(p * 10) ? P.green : P.darkgreen, x + 66 + k * 3, y + 15, 2, 5);
        } else if (g.kind === 'bloch') {
            text(`${names} ALONE`, x, y, P.dim, 1, null);
            drawBloch(x + 34, y + 42, 17, QQ.blochRho(a), QQ.blochRho(b));
        } else {
            text(`GOAL: ${names} ONLY`, x, y, P.dim, 1, null);
            a.forEach((row, i) => {
                const yy = y + 12 + i * 11;
                text(QQ.ket(i, qs.length), x, yy, P.white, 1, null);
                text(row[i][0].toFixed(2), x + 6 * (qs.length + 3), yy, P.green, 1, null);
                for (let k = 0; k < 10; k++)
                    R(k < Math.round(row[i][0] * 10) ? P.green : P.darkgreen, x + 66 + k * 3, yy + 3, 2, 5);
                text(b[i][i][0].toFixed(2), x + 104, yy, P.gold, 1, null);
            });
        }
    }

    // The state list plus the goal (or the Bloch sphere), side by side when they fit in `room`.
    function panel(S, room) {
        const n = S.qubits;
        const list = {w: 6 * n + 124, h: 12 + (1 << n) * 11};
        const g = S.goalQubits ? partGoal(S, puzzle().goal) : n === 1 ? {kind: 'bloch1', w: 70, h: 72} : null;
        const side = !!g && list.w + 10 + g.w <= room;
        return {list, g, side,
            w: g ? (side ? list.w + 10 + g.w : Math.max(list.w, g.w)) : list.w,
            h: g ? (side ? Math.max(list.h, g.h) : list.h + 6 + g.h) : list.h};
    }

    function drawPanel(S, x, y, now, goal, L) {
        drawState(x, y, S.qubits, now, S.goalQubits ? null : goal);
        hit(x, y, L.list.w, L.list.h, () => openAmplitudes(S, now, goal));
        if (!L.g)
            return;
        const gx = L.side ? x + L.list.w + 10 : x, gy = L.side ? y : y + L.list.h + 6;
        if (L.g.kind === 'bloch1')
            drawBloch(gx + 34, gy + 42, 17, QQ.bloch(now), QQ.bloch(goal));
        else
            drawPartGoal(gx, gy, S, now, goal, L.g);
    }

    // ------------------------------------------------------------ text pages
    // Paragraphs: '>' starts a key point (gold), two leading spaces a formula (on a blue band).
    function layout(body, cols) {
        const out = [];
        for (const para of body.split('\n')) {
            const kind = para.startsWith('>') ? 'key' : para.startsWith('  ') ? 'formula' : 'plain';
            const src = kind === 'key' ? para.slice(1).trim() : kind === 'formula' ? para.slice(2) : para;
            // a formula that fits keeps its own spacing
            const lines = kind === 'formula' && src.length <= cols - 2 ? [src] : QQ.wrap(src, kind === 'formula' ? cols - 2 : cols);
            lines.forEach((l, i) => out.push({text: l, kind, gap: i === 0 && kind !== 'formula'}));
        }
        if (out.length)
            out[0].gap = false;
        return out;
    }
    const lineH = l => (l.gap ? 4 : 0) + 10;

    function paginate(lines, h) {
        const pages = [[]];
        let used = 0;
        for (const l of lines) {
            if (used + lineH(l) > h && pages[pages.length - 1].length) {
                pages.push([]);
                used = 0;
            }
            pages[pages.length - 1].push(l);
            used += lineH(l);
        }
        return {pages, lastUsed: used};
    }

    function drawLines(lines, x, y, w) {
        for (const l of lines) {
            y += l.gap ? 4 : 0;
            if (l.kind === 'formula') {
                R(P.navy, x, y - 1, w, 11);
                R(P.blue, x, y - 1, 1, 11);
                text(l.text, x + 6, y, P.white, 1, null);
            } else {
                text(l.text, x, y, l.kind === 'key' ? P.gold : P.white);
            }
            y += 10;
        }
        return y;
    }

    // ------------------------------------------------------------ the reader window
    // A window over the screen with pages of lines: {t, c, keep, band, segs}.
    function openReader(title, lines) {
        G.overlay = {title, lines, page: 0};
    }

    const wrapLines = (s, cols, c = P.white, keep = false) => QQ.wrap(s, cols).map(t => ({t, c, keep}));

    // Python with comments in grey and strings in gold; long lines go on with a ».
    function codeLines(code, cols) {
        const out = [];
        for (const src of code.replace(/\s+$/, '').split('\n')) {
            const segs = [];
            let cur = '', col = P.white, quote = null;
            const flush = () => { if (cur) segs.push([cur, col]); cur = ''; };
            for (let i = 0; i < src.length; i++) {
                const ch = src[i];
                if (!quote && ch === '#') {
                    flush();
                    segs.push([src.slice(i), '#8a9a78']);
                    cur = '';
                    break;
                }
                if (!quote && (ch === '"' || ch === "'")) {
                    flush();
                    quote = ch;
                    col = P.gold;
                    cur = ch;
                } else if (quote && ch === quote) {
                    cur += ch;
                    flush();
                    quote = null;
                    col = P.white;
                } else {
                    cur += ch;
                }
            }
            flush();
            // cut into display lines of `cols` characters
            let line = [], len = 0, first = true;
            const push = () => {
                out.push({segs: line, keep: true, cont: !first});
                line = [];
                len = 2; // room for the » of the next part
                first = false;
            };
            if (!segs.length)
                out.push({segs: [], keep: true});
            for (const [t, c] of segs) {
                let rest = t;
                while (rest.length) {
                    const room = cols - len;
                    if (room <= 0) {
                        push();
                        continue;
                    }
                    line.push([rest.slice(0, room), c]);
                    len += Math.min(room, rest.length);
                    rest = rest.slice(room);
                }
            }
            if (line.length)
                push();
        }
        return out;
    }

    function refLines(cites, cols) {
        const out = [];
        const seen = new Set();
        for (const cite of cites) {
            if (seen.has(cite))
                continue;
            seen.add(cite);
            const {at, ref} = QQ.refParts(cite);
            if (!ref)
                continue;
            out.push(...wrapLines(QQ.citeText(ref), cols, P.white, true));
            if (at)
                out.push({t: '  see ' + at, c: P.gold, keep: true});
            for (const id of QQ.citeIds(ref))
                out.push(...wrapLines('  ' + id, cols, P.blue, true));
            out.push({t: ''});
        }
        return out;
    }

    function overlayBox() {
        const x = 8, y = 8, w = W - 16, h = H - 16;
        return {x, y, w, h, cols: Math.floor((w - 16 + 1) / 6), rows: Math.floor((h - 44) / 10)};
    }

    function renderOverlay() {
        hits = []; // nothing under the window can be tapped
        const O = G.overlay, B = overlayBox();
        ctx.fillStyle = 'rgba(4, 4, 20, 0.75)';
        ctx.fillRect(0, 0, W, H);
        R(P.blue, B.x, B.y, B.w, B.h);
        R(P.navy, B.x + 1, B.y + 1, B.w - 2, B.h - 2);
        R(P.red, B.x + 2, B.y + 2, B.w - 4, 1);
        const lines = typeof O.lines === 'function' ? O.lines(B.cols) : O.lines;
        const pages = Math.max(1, Math.ceil(lines.length / B.rows));
        O.pages = pages;
        O.page = Math.min(O.page, pages - 1);
        text(O.title, B.x + 8, B.y + 7, P.gold);
        let y = B.y + 22;
        for (const l of lines.slice(O.page * B.rows, (O.page + 1) * B.rows)) {
            if (l.segs) {
                let x = B.x + 8;
                if (l.cont) {
                    text('»', x, y, P.dim, 1, null);
                    x += 12;
                }
                for (const [t, c] of l.segs) {
                    text(t, x, y, c, 1, null, true);
                    x += t.length * 6;
                }
            } else if (l.band) {
                R('#0c0c44', B.x + 6, y - 1, B.w - 12, 11);
                text(l.t, B.x + 10, y, l.c || P.white, 1, null, l.keep);
            } else if (l.t) {
                text(l.t, B.x + 8, y, l.c || P.white, 1, l.keep ? null : undefined, l.keep);
            }
            y += 10;
        }
        const by = B.y + B.h - 19;
        if (pages > 1) {
            button(B.x + 6, by, 24, 14, '<', () => { O.page = Math.max(0, O.page - 1); }, {disabled: O.page === 0});
            const pg = `${O.page + 1}/${pages}`;
            text(pg, B.x + 36, by + 2, P.dim, 1, null);
            button(B.x + 42 + tw(pg), by, 24, 14, '>', () => { O.page = Math.min(pages - 1, O.page + 1); },
                {disabled: O.page >= pages - 1});
        }
        if (O.copy && navigator.clipboard) {
            const cw = bw('COPY');
            button(B.x + B.w - 6 - bw('CLOSE') - 4 - cw, by, cw, 14, O.copied ? 'COPIED' : 'COPY', () => {
                navigator.clipboard.writeText(O.copy).then(() => { O.copied = true; draw(); }, () => {});
            });
        }
        button(B.x + B.w - 6 - bw('CLOSE'), by, bw('CLOSE'), 14, 'CLOSE', () => { G.overlay = null; });
    }

    // ------------------------------------------------------------ what the buttons open
    const level = () => QQ.LEVELS[G.level];
    const step = () => level().steps[G.step];
    const ss = () => G.ss[G.step] || (G.ss[G.step] = {});
    const pad = n => String(n).padStart(2, '0');

    function openEli5() {
        const e = QQ.eli5For(level(), G.step);
        openReader('EXPLAIN LIKE I\'M FIVE', cols => layout(e, cols).map(l => ({
            t: l.text, c: l.kind === 'key' ? P.gold : P.white, band: l.kind === 'formula',
        })));
    }

    function openCode() {
        const ex = QQ.EXAMPLES[level().code];
        G.overlay = {title: 'QISKIT / PYTHON', page: 0, copy: ex.code, lines: cols => [
            {t: ex.file, c: P.gold, keep: true},
            {t: 'run: python ' + ex.file, c: P.dim, keep: true},
            {t: ''},
            ...codeLines(ex.code, cols),
        ]};
    }

    function openRefs() {
        const cites = [...(step().refs || []), ...(level().refs || [])];
        openReader('SOURCES', cols => refLines(cites, cols));
    }

    function openBook() {
        openReader('GATE BOOK', cols => {
            const out = [];
            for (const b of QQ.BOOK) {
                out.push({t: `${b.gate === 'M' ? 'M' : (QQ.GATES[b.gate] || {label: b.gate}).label} · ${b.name}`, c: P.gold});
                for (const m of b.matrix)
                    out.push({t: m, band: true});
                out.push(...wrapLines(b.text, cols));
                out.push({t: 'QISKIT: ', c: P.dim, keep: true, segs: [['qiskit: ', P.dim], [b.qiskit, P.blue]]});
                out.push({t: 'SEE: ' + b.refs.map(r => QQ.refParts(r).key + (QQ.refParts(r).at ? ' ' + QQ.refParts(r).at : '')).join(', '), c: P.dim});
                out.push({t: ''});
            }
            return out;
        });
    }

    function openGlossary() {
        openReader('GLOSSARY', cols => {
            const out = [];
            for (const g of QQ.GLOSSARY) {
                out.push({t: g.term, c: P.gold});
                out.push(...wrapLines(g.text, cols));
                out.push({t: 'SEE: ' + g.refs.join(', '), c: P.dim});
                out.push({t: ''});
            }
            return out;
        });
    }

    function openLibrary() {
        const keys = Object.keys(QQ.REFS).sort((a, b) => QQ.REFS[a].authors.localeCompare(QQ.REFS[b].authors));
        openReader(`ALL SOURCES (${keys.length})`, cols => refLines(keys, cols));
    }

    // ------------------------------------------------------------ screens
    function startLevel(i) {
        Object.assign(G, {screen: 'level', level: i, step: 0, page: 0, pen: 0, ss: [], info: '', overlay: null});
    }

    function firstOpen() {
        const i = QQ.LEVELS.findIndex(l => !progress[l.id]);
        return i < 0 ? 0 : i;
    }

    function renderTitle(t) {
        scene(t);
        const f = Math.max(2, Math.min(4, Math.floor(H / 80)));
        let y = Math.floor(H * 0.04);
        QQ.drawIcon(ctx, Math.floor((W - 16 * f) / 2), y, f);
        y += 15 * f + 4;
        const px = Math.max(2, Math.min(4, Math.floor((W - 24) / 66)));
        centre('QUBIT QUEST', y, P.gold, px);
        y += 9 * px + 4;
        centre('LEARN QUANTUM COMPUTING FROM ZERO', y, P.white);
        y += 14;
        const any = QQ.LEVELS.some(l => progress[l.id]);
        const items = [
            [any ? 'CONTINUE' : 'START', () => startLevel(firstOpen())],
            ['SELECT LEVEL', () => { G.screen = 'map'; }],
            ['GATE BOOK', openBook],
            ['GLOSSARY', openGlossary],
            ['ALL SOURCES', openLibrary],
        ];
        const wide = 128, bx = Math.floor((W - wide) / 2);
        items.forEach(([label, fn], i) => button(bx, y + i * 17, wide, 14, label, fn));
        centre('A BLACKBREAK SPIN-OFF', Math.min(H - 16, y + items.length * 17 + 4), P.dim, 1, null);
        frame();
    }

    // The level map, one or more worlds per page.
    function mapPages() {
        const tile = 24, gap = 4, perRow = Math.max(1, Math.floor((W - 20 + gap) / (tile + gap)));
        const room = H - 24 - 42;
        const pages = [[]];
        let used = 0;
        for (const world of QQ.WORLDS) {
            const count = QQ.LEVELS.filter(l => l.world === world.id).length;
            const h = 11 + Math.ceil(count / perRow) * (tile + gap) + 3;
            if (used + h > room && pages[pages.length - 1].length) {
                pages.push([]);
                used = 0;
            }
            pages[pages.length - 1].push(world);
            used += h;
        }
        return {pages, tile, gap, perRow};
    }
    const pageOfLevel = (pages, i) => Math.max(0, pages.findIndex(p => p.some(w => w.id === QQ.LEVELS[i].world)));

    function renderMap(t) {
        scene(t, false);
        text('SELECT LEVEL', 10, 9, P.gold);
        const total = QQ.LEVELS.reduce((s, l) => s + (progress[l.id] || 0), 0);
        const st = `★ ${total}/${QQ.LEVELS.length * 3}`;
        text(st, W - 10 - tw(st), 9, P.gold, 1, null);
        const {pages, tile, gap, perRow} = mapPages();
        G.mapPage = Math.min(G.mapPage, pages.length - 1);
        let y = 24;
        let hover = -1;
        for (const world of pages[G.mapPage]) {
            text(`WORLD ${world.id}: ${world.title}`, 10, y, P.dim, 1, null);
            y += 11;
            const levels = QQ.LEVELS.map((l, i) => [l, i]).filter(([l]) => l.world === world.id);
            levels.forEach(([l, i], k) => {
                const x = 10 + (k % perRow) * (tile + gap), ty = y + Math.floor(k / perRow) * (tile + gap);
                const open = unlocked(i);
                const stars = progress[l.id] || 0;
                button(x, ty, tile, tile - 4, open ? pad(i + 1) : '--', () => startLevel(i),
                    {disabled: !open, active: i === G.mapSel, edge: stars === 3 ? P.green : P.blue});
                for (let s = 0; s < 3; s++)
                    R(s < stars ? P.gold : '#3a3428', x + 5 + s * 5, ty + tile - 3, 4, 2);
                if (over(x, ty, tile, tile))
                    hover = i;
            });
            y += Math.ceil(levels.length / perRow) * (tile + gap) + 3;
        }
        const show = hover >= 0 ? hover : G.mapSel;
        const l = QQ.LEVELS[show];
        text(unlocked(show) ? `${pad(show + 1)} ${l.title}` : `${pad(show + 1)} LOCKED`, 10, H - 36, P.white);
        button(10, H - 22, 50, 14, 'BACK', () => { G.screen = 'title'; });
        if (pages.length > 1) {
            const mx = Math.floor(W / 2) - 40;
            button(mx, H - 22, 24, 14, '<', () => { G.mapPage = Math.max(0, G.mapPage - 1); }, {disabled: G.mapPage === 0});
            const pg = `${G.mapPage + 1}/${pages.length}`;
            text(pg, mx + 30, H - 20, P.dim, 1, null);
            button(mx + 36 + tw(pg), H - 22, 24, 14, '>', () => { G.mapPage = Math.min(pages.length - 1, G.mapPage + 1); },
                {disabled: G.mapPage >= pages.length - 1});
        }
        button(W - 70, H - 22, 60, 14, G.armReset ? 'SURE?' : 'RESET', () => {
            if (G.armReset) {
                progress = {};
                save();
                G.mapSel = 0;
            }
            G.armReset = !G.armReset;
        }, {color: G.armReset ? RED : undefined, keep: true});
        frame();
    }

    function canNext() {
        const s = step();
        if (s.type === 'quiz')
            return !!ss().correct;
        if (s.type === 'circuit')
            return !!ss().solved;
        return true;
    }

    function next() {
        if (!canNext())
            return;
        if (step().type === 'text' && G.page < G.pages - 1) {
            G.page++;
            return;
        }
        if (G.step < level().steps.length - 1) {
            G.step++;
            G.page = 0;
            G.info = '';
            return;
        }
        const stars = Math.max(1, 3 - G.pen);
        const id = level().id;
        progress[id] = Math.max(progress[id] || 0, stars);
        save();
        G.lastStars = stars;
        G.screen = 'done';
    }

    function back() {
        if (G.screen !== 'level')
            return;
        if (step().type === 'text' && G.page > 0) {
            G.page--;
        } else if (G.step > 0) {
            G.step--;
            G.page = 99; // clamped to the last page when drawn
            G.info = '';
        } else {
            G.screen = 'map';
        }
    }

    function renderLevel() {
        R(P.bg, 0, 0, W, H);
        const L = level(), S = step();
        text(`LEVEL ${pad(G.level + 1)}`, 10, 9, P.dim, 1, null);
        text(L.title, 10 + tw('LEVEL 00 '), 9, P.gold);
        button(W - 24, 7, 14, 13, 'X', () => { G.screen = 'map'; });
        segBar(10, 21, W - 38, L.steps.length, G.step, 2, G.step);
        const top = 30, bottom = H - 24, x = 12, w = W - 24;
        if (S.type === 'text')
            renderText(S, x, top, w, bottom - top);
        else if (S.type === 'quiz')
            renderQuiz(S, x, top, w);
        else
            renderPuzzle(S, x, top, w, bottom - top);
        // the footer: back, the three helpers, next
        const last = G.step === L.steps.length - 1 && (S.type !== 'text' || G.page >= G.pages - 1);
        const items = [['< BACK', back, {}], ['ELI5', openEli5, {color: P.gold}]];
        if (L.code)
            items.push(['CODE', openCode, {}]);
        items.push(['SOURCES', openRefs, {}]);
        items.push([last ? 'FINISH' : 'NEXT >', next, {disabled: !canNext()}]);
        const total = items.reduce((s, [l]) => s + bw(l), 0);
        const gap = Math.max(2, Math.floor((W - 20 - total) / (items.length - 1)));
        let fx = 10;
        items.forEach(([label, fn, o], i) => {
            const x0 = i === items.length - 1 ? W - 10 - bw(label) : fx;
            button(x0, H - 21, bw(label), 14, label, fn, o);
            fx += bw(label) + gap;
        });
        frame();
    }

    function renderText(S, x, y, w, h) {
        const cols = Math.floor((w + 1) / 6);
        text(S.title, x, y, P.gold);
        y += 14;
        h -= 14;
        const n = S.demo ? S.demo.qubits : 0;
        const demoH = S.demo ? n * WIRE + 16 + (w >= 300 ? 0 : 12 + (1 << n) * 11) + (n === 1 ? 20 : 0) : 0;
        const {pages, lastUsed} = paginate(layout(S.body, cols), h);
        let withDemo = pages.length - 1;
        if (S.demo && lastUsed + demoH > h) {
            pages.push([]);
            withDemo++;
        }
        G.pages = pages.length;
        G.page = Math.min(G.page, G.pages - 1);
        let yy = drawLines(pages[G.page], x, y, w);
        if (S.demo && G.page === withDemo) {
            yy += 6;
            const ops = S.demo.ops;
            const cw = Math.min(w - 6, 22 + COL * (ops.length + 1));
            drawCircuit(x + 6, yy, cw, n, [], ops, -1, null, {boxes: S.demo.boxes});
            const st = QQ.run(ops, n, undefined, S.demo.boxes);
            if (w >= 300) {
                const sx = x + Math.min(w - 140, cw + 20);
                drawState(sx, yy, n, st);
                if (n === 1)
                    drawBloch(Math.min(x + w - 30, sx + 160), yy + 30, 20, QQ.bloch(st));
            } else {
                yy += n * WIRE + 4 + drawState(x, yy + n * WIRE + 4, n, st);
            }
        }
        fits(yy, 'text page');
        if (G.pages > 1)
            text(`${G.page + 1}/${G.pages}`, x + w - tw('0/0'), H - 36, P.dim, 1, null);
    }

    function renderQuiz(S, x, y, w) {
        const st = ss();
        const cols = Math.floor((w + 1) / 6);
        for (const l of QQ.wrap(S.q, cols)) {
            text(l, x, y, P.gold);
            y += 10;
        }
        y += 6;
        const width = Math.min(w, 260);
        S.options.forEach((opt, i) => {
            const right = st.correct && i === S.answer;
            const wrong = (st.wrong || []).includes(i);
            const label = `${i + 1}. ${opt}`;
            const lines = QQ.wrap(label, Math.floor((width - 8) / 6));
            const bh = 5 + lines.length * 10;
            button(x, y, width, bh, lines.length > 1 ? '' : label, () => answer(i), {
                edge: right ? P.green : wrong ? RED : P.blue,
                color: right ? P.green : wrong ? RED : undefined,
                disabled: st.correct && !right,
            });
            if (lines.length > 1)
                lines.forEach((l, k) => text(l, x + 4, y + 2 + k * 10, right ? P.green : wrong ? RED : st.correct ? '#3a3a60' : P.white, 1, null));
            y += bh + 3;
        });
        y += 4;
        if (st.correct) {
            text('CORRECT!', x, y, P.green);
            y += 12;
            for (const l of QQ.wrap(S.why, cols)) {
                text(l, x, y, P.white);
                y += 10;
            }
        } else if (st.picked !== undefined) {
            text('NOT QUITE. TRY AGAIN, OR TAP ELI5.', x, y, RED);
            y += 10;
        }
        fits(y, 'quiz');
    }

    function answer(i) {
        const S = step(), st = ss();
        if (st.correct)
            return;
        st.picked = i;
        if (i === S.answer) {
            st.correct = true;
        } else {
            st.wrong = [...(st.wrong || []), i];
            if (!st.tries++)
                G.pen++;
        }
    }

    // ------------------------------------------------------------ circuit puzzles
    function puzzle() {
        const S = step(), st = ss();
        if (!st.ops) {
            Object.assign(st, QQ.puzzleStates(S));
            st.ops = [];
            st.sel = 0;
            st.pick = null;
        }
        return st;
    }

    const used = (st, g) => st.ops.filter(o => o[0] === g).length;
    const room = S => Math.max(S.solution.length, S.par) + 4;

    // Tap a gate: one-qubit gates go on the chosen wire; a two- or three-wire gate starts on the
    // chosen wire and asks for the others (unless there is only one way to place it).
    function place(g) {
        const S = step(), st = puzzle(), n = S.qubits;
        if (st.solved || !S.gates.includes(g) || st.ops.length >= room(S))
            return;
        if (S.limits && S.limits[g] !== undefined && used(st, g) >= S.limits[g])
            return;
        if (st.pick) { // a second tap on the gate cancels the choice
            st.pick = null;
            G.info = '';
            return;
        }
        const arity = QQ.arity(g, S.boxes);
        if (arity === 0)
            return push([g]);
        if (arity > n)
            return;
        if (arity === 1)
            return push([g, st.sel]);
        if (n === 2) // only one other wire
            return push(QQ.GATES[g].sym ? [g, 0, 1] : [g, st.sel, 1 - st.sel]);
        st.pick = {g, wires: [st.sel]};
        G.info = pickPrompt(g, 1);
    }

    function pickPrompt(g, have) {
        if (g === 'CCX')
            return have === 1 ? 'TOFFOLI: TAP THE SECOND CONTROL WIRE' : 'TOFFOLI: TAP THE TARGET WIRE';
        if (g === 'CX')
            return 'CNOT: TAP THE TARGET WIRE';
        return `${QQ.GATES[g].label}: TAP THE OTHER WIRE`;
    }

    // a wire tapped: choose it, or add it to the gate being placed
    function wire(q) {
        const S = step(), st = puzzle();
        if (!st.pick) {
            st.sel = q;
            return;
        }
        if (st.pick.wires.includes(q))
            return;
        st.pick.wires.push(q);
        const {g, wires} = st.pick;
        if (g === 'CCX' && wires.length === 2 && S.qubits === 3) // the target is the wire left
            wires.push(3 - wires[0] - wires[1]);
        if (wires.length < QQ.arity(g, S.boxes)) {
            G.info = pickPrompt(g, wires.length);
            return;
        }
        st.pick = null;
        push(QQ.GATES[g].sym ? [g, ...wires.sort()] : g === 'CCX' ? [g, ...wires.slice(0, 2).sort(), wires[2]] : [g, ...wires]);
    }

    function push(op) {
        const S = step(), st = puzzle();
        if (!QQ.allowed(op, S.allow)) {
            G.info = S.allowText || 'THAT GATE IS NOT ALLOWED ON THOSE WIRES HERE.';
            return;
        }
        st.ops.push(op);
        G.info = QQ.isBox(op[0], S.boxes) ? 'THE BLACK BOX ' + op[0] + ' RAN ONCE.' : QQ.GATE_TIPS[op[0]] || '';
        check(S, st);
    }

    function check(S, st) {
        const now = QQ.run([...st.ops, ...(S.after || [])], S.qubits, st.start, S.boxes);
        if (QQ.matches(now, st.goal, S.qubits, S.goalQubits)) {
            st.solved = true;
            if (st.ops.length > S.par)
                G.pen++;
        }
    }

    // The hint under the palette, or in a window when there is no room for it.
    function hint(S) {
        const cols = Math.floor((W - 24 + 1) / 6);
        if (QQ.wrap(S.hint, cols).length > (G.infoRoom || 0)) {
            G.info = '';
            openReader('HINT', c => [...wrapLines(S.hint, c, P.gold), {t: ''}, ...wrapLines(QQ.eli5For(level(), G.step), c)]);
        } else {
            G.info = S.hint;
        }
    }

    function undo() {
        const st = puzzle();
        if (st.pick) {
            st.pick = null;
            G.info = '';
        } else if (!st.solved) {
            st.ops.pop();
        }
    }

    function renderPuzzle(S, x, y, w, h) {
        const st = puzzle();
        const n = S.qubits, bottom = y + h;
        const now = QQ.run([...st.ops, ...(S.after || [])], n, st.start, S.boxes);
        const wide = W >= 400 && W > H * 1.5;
        const leftW = wide ? Math.floor(w * 0.6) : w;
        const cols = Math.floor((leftW + 1) / 6);
        const goalLines = QQ.wrap(S.goal, cols);
        // where the state view goes: beside (wide), below, or on a view of its own
        const L = panel(S, wide ? w - leftW - 10 : w);
        const own = wide ? y + L.h > bottom : st.view === 'state' || st.ownView;
        const toggle = () => { st.view = st.view === 'state' ? 'circuit' : 'state'; };
        if (st.view === 'state' && own) {
            for (const l of goalLines) {
                text(l, x, y, P.gold);
                y += 10;
            }
            y += 6;
            drawPanel(S, x, y, now, st.goal, panel(S, w));
            y += panel(S, w).h + 6;
            if (st.solved)
                text('SOLVED!', x, y, P.green, 2);
            button(x + w - bw('CIRCUIT'), y, bw('CIRCUIT'), 14, 'CIRCUIT', toggle);
            fits(y + 14, 'state view');
            return;
        }
        for (const l of goalLines) {
            text(l, x, y, P.gold);
            y += 10;
        }
        y += 4;
        y += drawCircuit(x + 6, y, leftW - 6, n, S.setup || [], st.ops, n > 1 ? st.sel : -1, n > 1 ? wire : null,
            {after: S.after, boxes: S.boxes, picked: st.pick ? st.pick.wires : []});
        y += 2;

        // the gate palette, then undo / clear / hint (and STATE on small screens)
        let bx = x;
        for (const g of S.gates) {
            const left = S.limits && S.limits[g] !== undefined ? S.limits[g] - used(st, g) : null;
            const label = QQ.isBox(g, S.boxes) ? g : QQ.GATES[g].label;
            const b = bw(label);
            if (bx + b > x + leftW) {
                bx = x;
                y += 17;
            }
            button(bx, y, b, 14, label, () => place(g), {
                disabled: st.solved || left === 0 || (st.pick && st.pick.g !== g),
                color: QQ.isBox(g, S.boxes) ? P.gold : undefined, active: st.pick && st.pick.g === g,
            });
            if (left !== null && !st.solved)
                text(String(left), bx + b - 5, y - 3, P.gold, 1, null);
            bx += b + 3;
        }
        y += 17;
        button(x, y, 40, 14, 'UNDO', undo, {disabled: st.solved || (!st.ops.length && !st.pick)});
        button(x + 43, y, 46, 14, 'CLEAR', () => { st.ops = []; st.pick = null; }, {disabled: st.solved || !st.ops.length});
        button(x + 92, y, 40, 14, 'HINT', () => hint(S), {disabled: st.solved});
        const count = `GATES ${st.ops.length} · PAR ${S.par}`;
        if (own) { // not enough room: the state gets a view of its own
            st.ownView = true;
            button(x + 135, y, bw('STATE'), 14, 'STATE', toggle, {color: P.gold});
        }
        const countBelow = leftW - (own ? 180 : 140) < tw(count);
        if (!countBelow)
            text(count, x + leftW - tw(count), y + 2, P.dim, 1, null);
        y += 19;
        if (st.solved) {
            const good = st.ops.length <= S.par;
            text('SOLVED!', x, y, P.green, 2);
            text(good ? 'ON PAR. PERFECT.' : `${st.ops.length} GATES. PAR IS ${S.par}.`, x + 92, y + 4, good ? P.green : P.gold, 1, null);
            y += 22;
        } else if (G.info) {
            // as many lines as fit; a hint that does not fit opens in a window instead
            const room = Math.floor((bottom - y - (countBelow ? 12 : 0) - 2) / 10);
            G.infoRoom = room;
            for (const l of QQ.wrap(G.info, cols).slice(0, Math.max(1, room))) {
                text(l, x, y, st.pick ? P.gold : P.white, 1, null);
                y += 10;
            }
            y += 2;
        } else {
            G.infoRoom = Math.floor((bottom - y - (countBelow ? 12 : 0) - 2) / 10);
        }
        if (countBelow) {
            text(count, x, y, P.dim, 1, null);
            y += 12;
        }
        fits(y, 'puzzle');
        if (wide && !own) {
            drawPanel(S, x + leftW + 10, 30, now, st.goal, L);
        } else if (!own) {
            if (y + 2 + L.h > bottom) { // it does not fit below after all: switch to its own view
                st.ownView = true;
                return;
            }
            drawPanel(S, x, y + 2, now, st.goal, L);
        }
    }

    function renderDone(t) {
        scene(t);
        const L = level();
        let y = Math.floor(H * 0.12);
        centre('LEVEL COMPLETE', y, P.gold, 2);
        y += 24;
        centre(L.title, y, P.white);
        y += 16;
        const f = Math.max(2, Math.min(4, Math.floor(H / 60)));
        const sw = 9 * f + 6;
        for (let i = 0; i < 3; i++)
            star(Math.floor(W / 2 - 1.5 * sw + i * sw + 3), y, f, i < G.lastStars);
        y += 9 * f + 10;
        const lastOne = G.level === QQ.LEVELS.length - 1;
        if (lastOne) {
            centre('YOU FINISHED QUBIT QUEST!', y, P.green);
            y += 14;
        } else if (G.lastStars < 3) {
            centre('PLAY AGAIN FOR 3 STARS', y, P.dim, 1, null);
            y += 14;
        }
        const wide = 128, bx = Math.floor((W - wide) / 2);
        if (!lastOne)
            button(bx, y, wide, 15, 'NEXT LEVEL', () => startLevel(G.level + 1));
        button(bx, y + (lastOne ? 0 : 19), wide, 15, 'SELECT LEVEL', () => {
            G.mapSel = Math.min(G.level + 1, QQ.LEVELS.length - 1);
            G.mapPage = pageOfLevel(mapPages().pages, G.mapSel);
            G.screen = 'map';
        });
        frame();
    }

    // ------------------------------------------------------------ main loop and input
    const t0 = performance.now();
    function draw() {
        hits = [];
        ctx.imageSmoothingEnabled = false;
        const t = (performance.now() - t0) / 1000;
        if (G.screen === 'title')
            renderTitle(t);
        else if (G.screen === 'map')
            renderMap(t);
        else if (G.screen === 'done')
            renderDone(t);
        else
            renderLevel();
        if (G.overlay)
            renderOverlay();
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const pw = Math.round(window.innerWidth * dpr), ph = Math.round(window.innerHeight * dpr);
        // a phone held upright gets bigger pixels: 256 wide is still enough for every screen
        const scale = ph > pw * 1.3 ? Math.max(1, Math.floor(pw / 256))
            : Math.max(1, Math.min(Math.floor(pw / 320), Math.floor(ph / 200)));
        W = Math.floor(pw / scale);
        H = Math.floor(ph / scale);
        cv.width = W;
        cv.height = H;
        cv.style.width = W * scale / dpr + 'px';
        cv.style.height = H * scale / dpr + 'px';
        draw();
    }

    function toCanvas(e) {
        const r = cv.getBoundingClientRect();
        mouse.x = Math.floor((e.clientX - r.left) * W / r.width);
        mouse.y = Math.floor((e.clientY - r.top) * H / r.height);
    }

    cv.addEventListener('pointermove', e => {
        toCanvas(e);
        draw();
    });
    cv.addEventListener('pointerdown', e => {
        toCanvas(e);
        draw(); // the hit list must match what is on screen now
        for (let i = hits.length - 1; i >= 0; i--) {
            const b = hits[i];
            if (mouse.x >= b.x && mouse.x < b.x + b.w && mouse.y >= b.y && mouse.y < b.y + b.h) {
                if (!b.keep)
                    G.armReset = false; // the reset button asks twice
                b.fn();
                break;
            }
        }
        if (e.pointerType !== 'mouse')
            mouse.x = mouse.y = -1;
        draw();
    });
    cv.addEventListener('pointerleave', () => {
        mouse.x = mouse.y = -1;
        draw();
    });
    cv.addEventListener('wheel', e => {
        if (G.overlay) {
            const O = G.overlay;
            O.page = Math.max(0, Math.min((O.pages || 1) - 1, O.page + Math.sign(e.deltaY)));
            draw();
        }
    }, {passive: true});

    const GATE_KEYS = {};
    for (const [g, d] of Object.entries(QQ.GATES))
        GATE_KEYS[d.key] = g;
    window.addEventListener('keydown', e => {
        const k = e.key;
        if (G.overlay) {
            const O = G.overlay;
            if (k === 'Escape' || k === 'Enter' || k === ' ')
                G.overlay = null;
            else if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown')
                O.page = Math.min((O.pages || 1) - 1, O.page + 1);
            else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp')
                O.page = Math.max(0, O.page - 1);
        } else if (G.screen === 'title') {
            if (k === 'Enter' || k === ' ')
                startLevel(firstOpen());
            else if (k === 'l' || k === 'L')
                G.screen = 'map';
            else if (k === 'b' || k === 'B')
                openBook();
            else if (k === 'g' || k === 'G')
                openGlossary();
        } else if (G.screen === 'map') {
            const n = QQ.LEVELS.length;
            if (k === 'ArrowRight' || k === 'ArrowDown')
                G.mapSel = Math.min(n - 1, G.mapSel + 1);
            else if (k === 'ArrowLeft' || k === 'ArrowUp')
                G.mapSel = Math.max(0, G.mapSel - 1);
            else if ((k === 'Enter' || k === ' ') && unlocked(G.mapSel))
                startLevel(G.mapSel);
            else if (k === 'Escape')
                G.screen = 'title';
            G.mapPage = pageOfLevel(mapPages().pages, G.mapSel);
        } else if (G.screen === 'done') {
            if (k === 'Enter' || k === ' ')
                G.level < QQ.LEVELS.length - 1 ? startLevel(G.level + 1) : (G.screen = 'map');
            else if (k === 'Escape')
                G.screen = 'map';
        } else {
            const S = step();
            if (k === 'Enter' || k === 'ArrowRight' || (k === ' ' && S.type !== 'circuit'))
                next();
            else if (k === 'ArrowLeft')
                back();
            else if (k === 'Escape')
                G.screen = 'map';
            else if (k === 'e' || k === 'E' || (k === '5' && S.type !== 'quiz'))
                openEli5();
            else if ((k === 'p' || k === 'P') && level().code)
                openCode();
            else if (k === 'r' || k === 'R')
                openRefs();
            else if (S.type === 'quiz' && /^[1-4]$/.test(k) && +k <= S.options.length)
                answer(+k - 1);
            else if (S.type === 'circuit') {
                const st = puzzle();
                if (k === 'Backspace' || k === 'u')
                    undo();
                else if (k === 'ArrowUp')
                    st.pick ? null : (st.sel = (st.sel + S.qubits - 1) % S.qubits);
                else if (k === 'ArrowDown')
                    st.pick ? null : (st.sel = (st.sel + 1) % S.qubits);
                else if (/^[0-2]$/.test(k) && +k < S.qubits)
                    wire(+k);
                else if (k === '?')
                    hint(S);
                else if (S.boxes && S.boxes[k.toUpperCase()] && S.gates.includes(k.toUpperCase()))
                    place(k.toUpperCase());
                else if (GATE_KEYS[k.toLowerCase()])
                    place(GATE_KEYS[k.toLowerCase()]);
            }
        }
        if (k !== 'F5' && k !== 'F12')
            e.preventDefault();
        draw();
    });

    window.addEventListener('resize', resize);
    resize();
    // only the screens with a sky move; the rest are drawn on input
    setInterval(() => {
        if (G.screen !== 'level' && !G.overlay)
            draw();
    }, 66);

    // the qubit icon as the tab icon
    const ic = document.createElement('canvas');
    ic.width = ic.height = 32;
    QQ.drawIcon(ic.getContext('2d'), 0, 0, 2);
    const link = document.querySelector('link[rel=icon]');
    if (link)
        link.href = ic.toDataURL();

    // for the screenshot test
    QQ.game = {G, draw, startLevel, next, place, wire, answer, hint: () => hint(step()), openEli5, openCode, openRefs, openBook,
        openGlossary, openLibrary, progress: () => progress};
})();
