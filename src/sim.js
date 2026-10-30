// A small state-vector simulator for up to a few qubits.
// Qubit 0 is the top wire and the LEFT digit of a ket: |q0 q1 q2>.
// (Qiskit numbers the other way round: its qubit 0 is the RIGHT digit.)
var QQ = globalThis.QQ || (globalThis.QQ = {});

(function () {
    const R = Math.SQRT1_2;
    // 2x2 matrices as [[re, im] x4]: a b / c d
    const ONE = {
        X: [[0, 0], [1, 0], [1, 0], [0, 0]],
        Y: [[0, 0], [0, -1], [0, 1], [0, 0]],
        Z: [[1, 0], [0, 0], [0, 0], [-1, 0]],
        H: [[R, 0], [R, 0], [R, 0], [-R, 0]],
        S: [[1, 0], [0, 0], [0, 0], [0, 1]],
        SDG: [[1, 0], [0, 0], [0, 0], [0, -1]],
        T: [[1, 0], [0, 0], [0, 0], [R, R]],
        TDG: [[1, 0], [0, 0], [0, 0], [R, -R]],
    };

    // Every gate the game knows. arity: wires it acts on; sym: the wire order does not matter.
    // label: what the circuit and the palette show; key: its keyboard key.
    QQ.GATES = {
        X: {arity: 1, label: 'X', key: 'x'},
        Y: {arity: 1, label: 'Y', key: 'y'},
        Z: {arity: 1, label: 'Z', key: 'z'},
        H: {arity: 1, label: 'H', key: 'h'},
        S: {arity: 1, label: 'S', key: 's'},
        SDG: {arity: 1, label: 'S†', key: 'd'},
        T: {arity: 1, label: 'T', key: 't'},
        TDG: {arity: 1, label: 'T†', key: 'g'},
        CX: {arity: 2, label: 'CNOT', key: 'c'},
        CZ: {arity: 2, sym: true, label: 'CZ', key: 'v'},
        CS: {arity: 2, sym: true, label: 'CS', key: 'b'},
        CSDG: {arity: 2, sym: true, label: 'CS†', key: 'n'},
        SWAP: {arity: 2, sym: true, label: 'SWAP', key: 'w'},
        CCX: {arity: 3, label: 'CCX', key: 'k'}, // Toffoli: two controls, one target
    };

    QQ.isBox = (name, boxes) => !!(boxes && boxes[name]);
    // the wires a black box acts on (for drawing it)
    QQ.boxWires = (name, boxes) => [...new Set(boxes[name].flatMap(op => op.slice(1)))].sort();
    QQ.arity = (name, boxes) => QQ.isBox(name, boxes) ? 0 : QQ.GATES[name].arity;

    QQ.zero = function (n) {
        const s = Array.from({length: 1 << n}, () => [0, 0]);
        s[0] = [1, 0];
        return s;
    };

    const mask = (q, n) => 1 << (n - 1 - q);
    const bit = (i, q, n) => (i >> (n - 1 - q)) & 1;

    // op: [name, wire...]; a black box (oracle) is [name] and runs its own ops from `boxes`.
    QQ.apply = function (state, op, n, boxes) {
        const [name, a, b, c] = op;
        if (QQ.isBox(name, boxes))
            return QQ.run(boxes[name], n, state);
        const m = ONE[name];
        if (m) {
            const s = state.map(z => z.slice());
            const mk = mask(a, n);
            for (let i = 0; i < s.length; i++) {
                if (i & mk)
                    continue;
                const j = i | mk;
                const [x, y] = [state[i], state[j]];
                s[i] = [m[0][0] * x[0] - m[0][1] * x[1] + m[1][0] * y[0] - m[1][1] * y[1],
                    m[0][0] * x[1] + m[0][1] * x[0] + m[1][0] * y[1] + m[1][1] * y[0]];
                s[j] = [m[2][0] * x[0] - m[2][1] * x[1] + m[3][0] * y[0] - m[3][1] * y[1],
                    m[2][0] * x[1] + m[2][1] * x[0] + m[3][0] * y[1] + m[3][1] * y[0]];
            }
            return s;
        }
        if (!QQ.GATES[name])
            throw new Error('unknown gate ' + name);
        const s = state.map(z => z.slice());
        for (let i = 0; i < s.length; i++) {
            const z = state[i];
            if (name === 'CX' && bit(i, a, n))
                s[i] = state[i ^ mask(b, n)].slice();
            else if (name === 'CCX' && bit(i, a, n) && bit(i, b, n))
                s[i] = state[i ^ mask(c, n)].slice();
            else if (name === 'CZ' && bit(i, a, n) && bit(i, b, n))
                s[i] = [-z[0], -z[1]];
            else if (name === 'CS' && bit(i, a, n) && bit(i, b, n))
                s[i] = [-z[1], z[0]];
            else if (name === 'CSDG' && bit(i, a, n) && bit(i, b, n))
                s[i] = [z[1], -z[0]];
            else if (name === 'SWAP' && bit(i, a, n) !== bit(i, b, n))
                s[i] = state[i ^ mask(a, n) ^ mask(b, n)].slice();
        }
        return s;
    };

    QQ.run = function (ops, n, state = QQ.zero(n), boxes) {
        for (const op of ops)
            state = QQ.apply(state, op, n, boxes);
        return state;
    };

    QQ.prob = z => z[0] * z[0] + z[1] * z[1];

    // Equal up to a global phase: |<a|b>| = 1.
    QQ.same = function (a, b, eps = 1e-6) {
        let re = 0, im = 0;
        for (let i = 0; i < a.length; i++) {
            re += a[i][0] * b[i][0] + a[i][1] * b[i][1];
            im += a[i][0] * b[i][1] - a[i][1] * b[i][0];
        }
        return Math.abs(Math.hypot(re, im) - 1) < eps;
    };

    // The reduced density matrix of the qubits in `keep` (in that order): rho[a][b] = [re, im].
    QQ.reduced = function (state, n, keep) {
        const d = 1 << keep.length;
        const rho = Array.from({length: d}, () => Array.from({length: d}, () => [0, 0]));
        const groups = new Map(); // the other qubits' bits -> [[a, amplitude]]
        for (let i = 0; i < state.length; i++) {
            let a = 0, rest = i;
            keep.forEach(q => {
                a = (a << 1) | bit(i, q, n);
                rest &= ~mask(q, n);
            });
            if (!groups.has(rest))
                groups.set(rest, []);
            groups.get(rest).push([a, state[i]]);
        }
        for (const list of groups.values())
            for (const [a, x] of list)
                for (const [b, y] of list) {
                    // x * conj(y)
                    rho[a][b][0] += x[0] * y[0] + x[1] * y[1];
                    rho[a][b][1] += x[1] * y[0] - x[0] * y[1];
                }
        return rho;
    };

    // Does `state` reach `goal`: the whole state up to a global phase, or (goalQubits)
    // only those qubits, compared by their reduced density matrices, or only the chances.
    QQ.matches = function (state, goal, n, goalQubits, eps = 1e-6, probsOnly = false) {
        if (probsOnly) // only the chances count, not the phases
            return state.every((z, i) => Math.abs(QQ.prob(z) - QQ.prob(goal[i])) < eps);
        if (!goalQubits)
            return QQ.same(state, goal, eps);
        const a = QQ.reduced(state, n, goalQubits), b = QQ.reduced(goal, n, goalQubits);
        return a.every((row, i) => row.every((z, j) => Math.hypot(z[0] - b[i][j][0], z[1] - b[i][j][1]) < eps));
    };

    // The state with its global phase removed: the first nonzero amplitude made real and positive.
    QQ.canonical = function (state) {
        const k = state.find(z => QQ.prob(z) > 1e-9);
        const m = Math.hypot(k[0], k[1]);
        const [cr, ci] = [k[0] / m, -k[1] / m];
        return state.map(([r, i]) => [r * cr - i * ci, r * ci + i * cr]);
    };

    // Phase of an amplitude: '+', 'i', '-', '-i', 'other' (in between) or 'none' (zero).
    QQ.phaseName = function (z) {
        if (QQ.prob(z) < 1e-9)
            return 'none';
        const a = Math.atan2(z[1], z[0]) / (Math.PI / 2);
        const q = Math.round(a);
        if (Math.abs(a - q) > 0.05)
            return 'other';
        return ['+', 'i', '-', '-i'][(q + 4) % 4];
    };

    // Amplitude as short text: 0.71, -0.5, 0.71I, 0.5+0.5I
    QQ.ampText = function (z) {
        const f = v => {
            const t = (Math.round(Math.abs(v) * 100) / 100).toFixed(2);
            return (v < 0 ? '-' : '') + (t === '1.00' ? '1' : t);
        };
        const [r, i] = [Math.abs(z[0]) < 0.005 ? 0 : z[0], Math.abs(z[1]) < 0.005 ? 0 : z[1]];
        if (!r && !i)
            return '0';
        if (!i)
            return f(r);
        if (!r)
            return f(i) + 'I';
        return f(r) + (i < 0 ? '' : '+') + f(i) + 'I';
    };

    // Bloch vector (x, y, z) of one qubit from its 2x2 density matrix; length 1 = pure, 0 = fully mixed.
    QQ.blochRho = rho => [2 * rho[1][0][0], 2 * rho[1][0][1], rho[0][0][0] - rho[1][1][0]];
    QQ.bloch = (state, n = 1, q = 0) => QQ.blochRho(QQ.reduced(state, n, [q]));

    QQ.ket = (i, n) => '|' + i.toString(2).padStart(n, '0') + '>';

    // Is `op` allowed by a puzzle's `allow` rule? allow[g] lists the wire tuples (or single wires) it may use.
    QQ.allowed = function (op, allow) {
        const rule = allow && allow[op[0]];
        if (!rule)
            return true;
        const sym = QQ.GATES[op[0]] && QQ.GATES[op[0]].sym;
        const key = w => JSON.stringify(sym ? [...w].sort() : w);
        const wires = key(op.slice(1));
        return rule.some(r => key(Array.isArray(r) ? r : [r]) === wires);
    };

    // Every op a puzzle allows: each gate on each wire (tuple) the rules permit.
    QQ.moves = function (gates, n, allow, boxes) {
        const out = [];
        const add = op => QQ.allowed(op, allow) && out.push(op);
        for (const g of gates) {
            if (QQ.isBox(g, boxes)) {
                out.push([g]);
                continue;
            }
            const {arity, sym} = QQ.GATES[g];
            for (let a = 0; a < n; a++) {
                if (arity === 1) {
                    add([g, a]);
                    continue;
                }
                for (let b = 0; b < n; b++) {
                    if (a === b || (sym && a > b))
                        continue;
                    if (arity === 2) {
                        add([g, a, b]);
                        continue;
                    }
                    for (let c = 0; c < n; c++)
                        if (a < b && c !== a && c !== b)
                            add([g, a, b, c]);
                }
            }
        }
        return out;
    };

    // The fewest gates that take `start` to the goal (breadth first), or -1 within maxDepth.
    // p: {gates, n, limits, allow, boxes, after, goalQubits, probsOnly}
    QQ.shortest = function (start, goal, p, maxDepth) {
        const {n, limits = {}, after = []} = p;
        const done = s => QQ.matches(QQ.run(after, n, s, p.boxes), goal, n, p.goalQubits, 1e-6, p.probsOnly);
        if (done(start))
            return 0;
        const moves = QQ.moves(p.gates, n, p.allow, p.boxes);
        const limited = Object.keys(limits).length > 0;
        const key = (s, used) => QQ.canonical(s).map(z => z.map(v => v.toFixed(4)).join(',')).join(';') +
            (limited ? JSON.stringify(used) : '');
        let frontier = [[start, {}]];
        const seen = new Set([key(start, {})]);
        for (let d = 1; d <= maxDepth; d++) {
            const next = [];
            for (const [s, used] of frontier) {
                for (const m of moves) {
                    const u = {...used};
                    if (limits[m[0]] !== undefined) {
                        u[m[0]] = (u[m[0]] || 0) + 1;
                        if (u[m[0]] > limits[m[0]])
                            continue;
                    }
                    const t = QQ.apply(s, m, n, p.boxes);
                    if (done(t))
                        return d;
                    const k = key(t, u);
                    if (seen.has(k))
                        continue;
                    seen.add(k);
                    next.push([t, u]);
                }
            }
            frontier = next;
        }
        return -1;
    };

    // A puzzle's start state and goal state.
    QQ.puzzleStates = function (S) {
        const start = QQ.run(S.setup || [], S.qubits, undefined, S.boxes);
        const goal = QQ.run([...S.solution, ...(S.after || [])], S.qubits, start, S.boxes);
        return {start, goal};
    };
})();

if (typeof module !== 'undefined')
    module.exports = QQ;
