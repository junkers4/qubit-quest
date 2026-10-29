// The game: screens, layout and input. Everything is drawn on a small canvas
// (about 320 x 200 on a desktop, 360 wide on a phone) that the page scales up
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

    // the whole game state
    const G = {screen: 'title', level: 0, step: 0, page: 0, pages: 1, pen: 0, ss: [], mapSel: 0, armReset: false, info: ''};

    // ------------------------------------------------------------ drawing helpers
    const R = (c, x, y, w, h) => QQ.rect(ctx, c, x, y, w, h);
    const text = (s, x, y, c = P.white, px = 1, sh = P.shadow) => QQ.drawText(ctx, s, x, y, px, c, sh);
    const tw = (s, px = 1) => QQ.textWidth(s, px);
    const centre = (s, y, c, px = 1, sh) => text(s, Math.floor((W - tw(s, px)) / 2), y, c, px, sh);
    const hit = (x, y, w, h, fn, keep) => hits.push({x, y, w, h, fn, keep});
    const over = (x, y, w, h) => mouse.x >= x && mouse.x < x + w && mouse.y >= y && mouse.y < y + h;

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
    const PHASE = {'+': P.green, '-': '#e83838', 'i': P.blue, '-i': P.gold, other: P.purple, none: P.dim};
    const COL = 14; // circuit column width
    const WIRE = 20; // distance between wires

    // A circuit: wires q0.., fixed (grey) setup gates, then the player's gates.
    // Returns the height used. `sel` is the chosen wire (or -1).
    function drawCircuit(x, y, w, n, setup, ops, sel, onWire) {
        const all = [...setup.map(o => [o, true]), ...ops.map(o => [o, false])];
        for (let q = 0; q < n; q++) {
            const wy = y + 8 + q * WIRE;
            const chosen = q === sel;
            R(chosen ? P.gold : '#5a5650', x + 18, wy, w - 18, 1);
            text((chosen ? '>' : ' ') + 'Q' + q, x - 6, wy - 6, chosen ? P.gold : P.dim, 1, null);
            if (onWire)
                hit(x - 6, wy - WIRE / 2, Math.min(w + 6, 60), WIRE, () => onWire(q));
        }
        all.forEach(([op, fixed], i) => {
            const cx = x + 22 + i * COL;
            if (cx + 11 > x + w)
                return;
            const [g, a, b] = op;
            const ya = y + 8 + a * WIRE, yb = y + 8 + (b || 0) * WIRE;
            const ink = fixed ? '#8a8478' : P.white;
            if (g === 'CX' || g === 'CZ' || g === 'SWAP') {
                R(ink, cx + 5, Math.min(ya, yb), 1, Math.abs(yb - ya));
                if (g === 'SWAP') {
                    for (const yy of [ya, yb])
                        for (let k = -2; k <= 2; k++) {
                            R(ink, cx + 5 + k, yy + k, 1, 1);
                            R(ink, cx + 5 + k, yy - k, 1, 1);
                        }
                } else {
                    R(ink, cx + 4, ya - 1, 3, 3);
                    if (g === 'CZ') {
                        R(ink, cx + 4, yb - 1, 3, 3);
                    } else {
                        R(P.bg, cx + 2, yb - 3, 7, 7);
                        circle(cx + 5, yb, 3, ink);
                        R(ink, cx + 2, yb, 7, 1);
                        R(ink, cx + 5, yb - 3, 1, 7);
                    }
                }
                return;
            }
            if (g === 'F') {
                const top = Math.min(ya, yb) - 6;
                R(fixed ? '#5a5040' : P.gold, cx, top, 11, Math.abs(yb - ya) + 12);
                R(fixed ? '#2a2418' : '#3a2a00', cx + 1, top + 1, 9, Math.abs(yb - ya) + 10);
                text('F', cx + 3, top + Math.floor((Math.abs(yb - ya) + 12) / 2) - 5, fixed ? '#8a8478' : P.gold, 1, null);
                return;
            }
            R(fixed ? '#3a3830' : P.blue, cx, ya - 5, 11, 11);
            R(fixed ? '#1a1a18' : P.navy, cx + 1, ya - 4, 9, 9);
            text(g, cx + 3, ya - 6, ink, 1, null);
        });
        return n * WIRE;
    }

    // The amplitudes of `state` with a probability bar each, and the goal's amplitudes.
    function drawState(x, y, n, state, goal) {
        text('STATE', x, y, P.dim, 1, null);
        if (goal)
            text('GOAL', x + 104, y, P.dim, 1, null);
        state.forEach((z, i) => {
            const yy = y + 12 + i * 11;
            text(QQ.ket(i, n), x, yy, P.white, 1, null);
            const c = PHASE[QQ.phaseName(z)];
            text(QQ.ampText(z), x + 6 * (n + 3), yy, c, 1, null);
            const lit = Math.round(QQ.prob(z) * 10);
            for (let k = 0; k < 10; k++)
                R(k < lit ? c : P.darkgreen, x + 66 + k * 3, yy + 3, 2, 5);
            if (goal) {
                const gz = QQ.canonical(goal)[i];
                text(QQ.ampText(gz), x + 104, yy, PHASE[QQ.phaseName(gz)], 1, null);
            }
        });
        return 12 + state.length * 11;
    }

    // The Bloch sphere from the side: up |0>, down |1>, right |+>, left |->.
    function drawBloch(cx, cy, r, state, goal) {
        circle(cx, cy, r, '#2c2c7c');
        R('#1c1c4c', cx - r + 1, cy, 2 * r - 1, 1);
        R('#1c1c4c', cx, cy - r + 1, 1, 2 * r - 1);
        text('|0>', cx - 8, cy - r - 11, P.dim, 1, null);
        text('|1>', cx - 8, cy + r + 1, P.dim, 1, null);
        text('+', cx + r + 3, cy - 5, P.dim, 1, null);
        text('-', cx - r - 8, cy - 5, P.dim, 1, null);
        if (goal) {
            const [gx, , gz] = QQ.bloch(goal);
            const px = Math.round(cx + gx * r), py = Math.round(cy - gz * r);
            R(P.gold, px - 2, py - 2, 5, 1);
            R(P.gold, px - 2, py + 2, 5, 1);
            R(P.gold, px - 2, py - 2, 1, 5);
            R(P.gold, px + 2, py - 2, 1, 5);
        }
        const [bx, by, bz] = QQ.bloch(state);
        const ex = cx + bx * r, ey = cy - bz * r;
        if (Math.hypot(bx, bz) > 0.15)
            line(cx, cy, ex, ey, P.green);
        R(Math.abs(by) > 0.5 ? (by > 0 ? P.blue : P.gold) : P.white, Math.round(ex) - 1, Math.round(ey) - 1, 3, 3);
    }

    // ------------------------------------------------------------ text pages
    // Paragraphs: '>' starts a key point (gold), two leading spaces a formula (on a blue band).
    function layout(body, cols) {
        const out = [];
        for (const para of body.split('\n')) {
            const kind = para.startsWith('>') ? 'key' : para.startsWith('  ') ? 'formula' : 'plain';
            const src = kind === 'key' ? para.slice(1).trim() : kind === 'formula' ? para.trim() : para;
            // a formula that fits keeps its own spacing
            const lines = kind === 'formula' && src.length <= cols - 4 ? [src] : QQ.wrap(src, kind === 'formula' ? cols - 4 : cols);
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

    // ------------------------------------------------------------ screens
    const level = () => QQ.LEVELS[G.level];
    const step = () => level().steps[G.step];
    const ss = () => G.ss[G.step] || (G.ss[G.step] = {});
    const pad = n => String(n).padStart(2, '0');

    function startLevel(i) {
        Object.assign(G, {screen: 'level', level: i, step: 0, page: 0, pen: 0, ss: [], info: ''});
    }

    function firstOpen() {
        const i = QQ.LEVELS.findIndex(l => !progress[l.id]);
        return i < 0 ? 0 : i;
    }

    function renderTitle(t) {
        scene(t);
        const f = Math.max(2, Math.min(4, Math.floor(H / 70)));
        let y = Math.floor(H * 0.06);
        QQ.drawIcon(ctx, Math.floor((W - 16 * f) / 2), y, f);
        y += 16 * f + 6;
        const px = Math.max(2, Math.min(4, Math.floor((W - 24) / 66)));
        centre('QUBIT QUEST', y, P.gold, px);
        y += 9 * px + 6;
        centre('LEARN QUANTUM COMPUTING', y, P.white);
        centre('FROM ZERO', y + 10, P.white);
        y += 28;
        const bw = 128, bx = Math.floor((W - bw) / 2);
        const any = QQ.LEVELS.some(l => progress[l.id]);
        button(bx, y, bw, 15, any ? 'CONTINUE' : 'START', () => startLevel(firstOpen()));
        button(bx, y + 19, bw, 15, 'SELECT LEVEL', () => { G.screen = 'map'; });
        centre('A BLACKBREAK SPIN-OFF', Math.min(H - 16, y + 44), P.dim, 1, null);
        frame();
    }

    function renderMap(t) {
        scene(t, false);
        text('SELECT LEVEL', 10, 9, P.gold);
        const total = QQ.LEVELS.reduce((s, l) => s + (progress[l.id] || 0), 0);
        const st = `★ ${total}/${QQ.LEVELS.length * 3}`;
        text(st, W - 10 - tw(st), 9, P.gold, 1, null);
        let y = 24;
        const tile = 24, gap = 4, perRow = Math.max(1, Math.floor((W - 20 + gap) / (tile + gap)));
        let hover = -1;
        for (const world of QQ.WORLDS) {
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
        text(unlocked(show) ? `${pad(show + 1)} ${l.title}` : `${pad(show + 1)} LOCKED`, 10, Math.max(y + 2, H - 36), P.white);
        button(10, H - 22, 50, 14, 'BACK', () => { G.screen = 'title'; });
        button(W - 70, H - 22, 60, 14, G.armReset ? 'SURE?' : 'RESET', () => {
            if (G.armReset) {
                progress = {};
                save();
                G.mapSel = 0;
            }
            G.armReset = !G.armReset;
        }, {color: G.armReset ? '#e83838' : undefined, keep: true});
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
        const last = G.step === L.steps.length - 1 && (S.type !== 'text' || G.page >= G.pages - 1);
        button(10, H - 21, 56, 14, '< BACK', back);
        button(W - 66, H - 21, 56, 14, last ? 'FINISH' : 'NEXT >', next, {disabled: !canNext()});
        frame();
    }

    function renderText(S, x, y, w, h) {
        const cols = Math.floor((w + 1) / 6);
        text(S.title, x, y, P.gold);
        y += 14;
        h -= 14;
        const demoH = S.demo ? (S.demo.qubits === 1 ? 74 : 72) : 0;
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
            const n = S.demo.qubits;
            drawCircuit(x + 6, yy, Math.min(w - 6, 22 + COL * (S.demo.ops.length + 1)), n, [], S.demo.ops, -1);
            const st = QQ.run(S.demo.ops, n);
            const sx = x + Math.min(w - 140, 22 + COL * (S.demo.ops.length + 1) + 20);
            if (w >= 300)
                drawState(sx, yy, n, st);
            else
                drawState(x, yy + n * WIRE + 4, n, st);
            if (n === 1 && w >= 300)
                drawBloch(sx + 175 > x + w ? x + w - 30 : sx + 160, yy + 30, 20, st);
        }
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
        const bw = Math.min(w, 220);
        S.options.forEach((opt, i) => {
            const picked = st.picked === i;
            const right = st.correct && i === S.answer;
            const wrong = picked && !st.correct;
            button(x, y, bw, 15, `${i + 1}. ${opt}`, () => answer(i), {
                edge: right ? P.green : wrong ? '#e83838' : P.blue,
                color: right ? P.green : wrong ? '#e83838' : undefined,
                disabled: st.correct && !right,
            });
            y += 18;
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
            text('NOT QUITE. TRY AGAIN.', x, y, '#e83838');
        }
    }

    function answer(i) {
        const S = step(), st = ss();
        if (st.correct)
            return;
        st.picked = i;
        if (i === S.answer)
            st.correct = true;
        else if (!st.tries++)
            G.pen++;
    }

    // ------------------------------------------------------------ circuit puzzles
    function puzzle() {
        const S = step(), st = ss();
        if (!st.ops) {
            st.ops = [];
            st.sel = 0;
            st.start = QQ.run(S.setup || [], S.qubits);
            st.goal = QQ.run(S.solution, S.qubits, st.start);
        }
        return st;
    }

    const used = (st, g) => st.ops.filter(o => o[0] === g).length;
    const room = S => Math.max(S.solution.length, S.par) + 4;

    function place(g) {
        const S = step(), st = puzzle();
        if (st.solved || !S.gates.includes(g) || st.ops.length >= room(S))
            return;
        if (S.limits && S.limits[g] !== undefined && used(st, g) >= S.limits[g])
            return;
        const other = 1 - st.sel;
        if (QQ.isTwo(g) && S.qubits < 2)
            return;
        const op = g === 'F' ? ['F', 0, 1] : g === 'CZ' || g === 'SWAP' ? [g, 0, 1] : QQ.isTwo(g) ? [g, st.sel, other] : [g, st.sel];
        st.ops.push(op);
        G.info = QQ.GATE_INFO[g] || '';
        check(S, st);
    }

    function check(S, st) {
        const now = QQ.run(st.ops, S.qubits, st.start);
        if (QQ.same(now, st.goal)) {
            st.solved = true;
            if (st.ops.length > S.par)
                G.pen++;
        }
    }

    function undo() {
        const st = puzzle();
        if (!st.solved)
            st.ops.pop();
    }

    function renderPuzzle(S, x, y, w, h) {
        const st = puzzle();
        const n = S.qubits;
        const wide = W >= 400 && W > H * 1.5;
        const leftW = wide ? Math.floor(w * 0.6) : w;
        const cols = Math.floor((leftW + 1) / 6);
        for (const l of QQ.wrap(S.goal, cols)) {
            text(l, x, y, P.gold);
            y += 10;
        }
        y += 4;
        const setup = S.setup || [];
        y += drawCircuit(x + 6, y, leftW - 6, n, setup, st.ops, n > 1 ? st.sel : -1, q => { st.sel = q; });
        y += 2;

        // the gate palette, then undo / clear / hint
        let bx = x;
        for (const g of S.gates) {
            const left = S.limits && S.limits[g] !== undefined ? S.limits[g] - used(st, g) : null;
            const label = g === 'CX' ? 'CNOT' : g;
            const bw = tw(label) + 10;
            if (bx + bw > x + leftW) {
                bx = x;
                y += 17;
            }
            button(bx, y, bw, 14, label, () => place(g), {disabled: st.solved || left === 0, color: g === 'F' ? P.gold : undefined});
            if (left !== null && !st.solved)
                text(String(left), bx + bw - 5, y - 3, P.gold, 1, null);
            bx += bw + 3;
        }
        y += 17;
        button(x, y, 40, 14, 'UNDO', undo, {disabled: st.solved || !st.ops.length});
        button(x + 43, y, 46, 14, 'CLEAR', () => { st.ops = []; }, {disabled: st.solved || !st.ops.length});
        button(x + 92, y, 40, 14, 'HINT', () => { G.info = S.hint; }, {disabled: st.solved});
        const count = `GATES ${st.ops.length} · PAR ${S.par}`;
        if (leftW - 140 >= tw(count))
            text(count, x + leftW - tw(count), y + 2, P.dim, 1, null);
        y += 19;

        if (st.solved) {
            const good = st.ops.length <= S.par;
            text('SOLVED!', x, y, P.green, 2);
            text(good ? 'ON PAR. PERFECT.' : `${st.ops.length} GATES. PAR IS ${S.par}.`, x + 92, y + 4, good ? P.green : P.gold, 1, null);
            y += 22;
        } else if (G.info) {
            for (const l of QQ.wrap(G.info, cols)) {
                text(l, x, y, P.white, 1, null);
                y += 10;
            }
            y += 2;
        }
        if (leftW - 140 < tw(count)) {
            text(count, x, y, P.dim, 1, null);
            y += 12;
        }

        const now = QQ.run(st.ops, n, st.start);
        let sx = x, sy = y + 2;
        if (wide) {
            sx = x + leftW + 10;
            sy = 30;
        }
        const stateH = drawState(sx, sy, n, now, st.goal);
        if (n === 1) {
            const r = 18;
            if (wide || w < 260)
                drawBloch(sx + 70, sy + stateH + r + 16, r, now, st.goal);
            else
                drawBloch(sx + 175, sy + r + 12, r, now, st.goal);
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
        const bw = 128, bx = Math.floor((W - bw) / 2);
        if (!lastOne)
            button(bx, y, bw, 15, 'NEXT LEVEL', () => startLevel(G.level + 1));
        button(bx, y + (lastOne ? 0 : 19), bw, 15, 'SELECT LEVEL', () => {
            G.mapSel = Math.min(G.level + 1, QQ.LEVELS.length - 1);
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

    const GATE_KEYS = {h: 'H', x: 'X', y: 'Y', z: 'Z', s: 'S', t: 'T', c: 'CX', v: 'CZ', w: 'SWAP', f: 'F'};
    window.addEventListener('keydown', e => {
        const k = e.key;
        if (G.screen === 'title') {
            if (k === 'Enter' || k === ' ')
                startLevel(firstOpen());
            else if (k === 'l' || k === 'L')
                G.screen = 'map';
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
            else if (S.type === 'quiz' && /^[1-4]$/.test(k) && +k <= S.options.length)
                answer(+k - 1);
            else if (S.type === 'circuit') {
                const st = puzzle();
                if (k === 'Backspace' || k === 'u')
                    undo();
                else if (k === 'ArrowUp' || k === 'ArrowDown')
                    st.sel = S.qubits > 1 ? 1 - st.sel : 0;
                else if (k === '?')
                    G.info = S.hint;
                else if (GATE_KEYS[k.toLowerCase()])
                    place(GATE_KEYS[k.toLowerCase()]);
            }
        }
        e.preventDefault();
        draw();
    });

    window.addEventListener('resize', resize);
    resize();
    // only the screens with a sky move; the rest are drawn on input
    setInterval(() => {
        if (G.screen !== 'level')
            draw();
    }, 66);

    // the qubit icon as the tab icon
    const ic = document.createElement('canvas');
    ic.width = ic.height = 32;
    QQ.drawIcon(ic.getContext('2d'), 0, 0, 2);
    const link = document.querySelector('link[rel=icon]');
    if (link)
        link.href = ic.toDataURL();

    QQ.game = {G, draw, startLevel, next, place, answer, progress: () => progress}; // for the screenshot test
})();
