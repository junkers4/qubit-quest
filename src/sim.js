// A small state-vector simulator for 1 or 2 qubits (it works for more).
// Qubit 0 is the top wire and the left digit of a ket: |q0 q1>.
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
        T: [[1, 0], [0, 0], [0, 0], [R, R]],
    };
    const TWO = ['CX', 'CZ', 'SWAP', 'F'];

    // Short help for each gate, shown under the gate palette.
    QQ.GATE_INFO = {
        X: 'X: FLIPS |0> AND |1>',
        Y: 'Y: FLIP PLUS A PHASE',
        Z: 'Z: FLIPS THE SIGN OF |1>',
        H: 'H: MAKES / UNDOES SUPERPOSITION',
        S: 'S: QUARTER PHASE TURN (I)',
        T: 'T: EIGHTH PHASE TURN',
        CX: 'CNOT: FLIPS THE TARGET IF THE CONTROL IS 1',
        CZ: 'CZ: SIGN FLIP IF BOTH ARE 1',
        SWAP: 'SWAP: EXCHANGES THE TWO QUBITS',
        F: 'F: THE BLACK BOX, ADDS F(Q0) INTO Q1',
    };

    QQ.isTwo = name => TWO.includes(name);

    QQ.zero = function (n) {
        const s = Array.from({length: 1 << n}, () => [0, 0]);
        s[0] = [1, 0];
        return s;
    };

    const bit = (i, q, n) => (i >> (n - 1 - q)) & 1;

    // op: [name, q] for one-qubit gates, [name, control, target] for two.
    QQ.apply = function (state, op, n) {
        const [name, a, b] = op;
        const s = state.map(z => z.slice());
        if (ONE[name]) {
            const m = ONE[name];
            const mask = 1 << (n - 1 - a);
            for (let i = 0; i < s.length; i++) {
                if (i & mask)
                    continue;
                const j = i | mask;
                const [x, y] = [state[i], state[j]];
                s[i] = [m[0][0] * x[0] - m[0][1] * x[1] + m[1][0] * y[0] - m[1][1] * y[1],
                    m[0][0] * x[1] + m[0][1] * x[0] + m[1][0] * y[1] + m[1][1] * y[0]];
                s[j] = [m[2][0] * x[0] - m[2][1] * x[1] + m[3][0] * y[0] - m[3][1] * y[1],
                    m[2][0] * x[1] + m[2][1] * x[0] + m[3][0] * y[1] + m[3][1] * y[0]];
            }
            return s;
        }
        for (let i = 0; i < s.length; i++) {
            if ((name === 'CX' || name === 'F') && bit(i, a, n))
                s[i] = state[i ^ (1 << (n - 1 - b))].slice();
            else if (name === 'CZ' && bit(i, a, n) && bit(i, b, n))
                s[i] = [-state[i][0], -state[i][1]];
            else if (name === 'SWAP' && bit(i, a, n) !== bit(i, b, n))
                s[i] = state[i ^ (1 << (n - 1 - a)) ^ (1 << (n - 1 - b))].slice();
        }
        if (!ONE[name] && !TWO.includes(name))
            throw new Error('unknown gate ' + name);
        return s;
    };

    QQ.run = function (ops, n, state = QQ.zero(n)) {
        for (const op of ops)
            state = QQ.apply(state, op, n);
        return state;
    };

    // Equal up to a global phase: |<a|b>| = 1.
    QQ.same = function (a, b, eps = 1e-6) {
        let re = 0, im = 0;
        for (let i = 0; i < a.length; i++) {
            re += a[i][0] * b[i][0] + a[i][1] * b[i][1];
            im += a[i][0] * b[i][1] - a[i][1] * b[i][0];
        }
        return Math.abs(Math.hypot(re, im) - 1) < eps;
    };

    QQ.prob = z => z[0] * z[0] + z[1] * z[1];

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

    // Amplitude as short text: 0.71, -0.5, 0.71I, (0.5+0.5I)
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

    // Bloch vector (x, y, z) of a one-qubit state.
    QQ.bloch = function (s) {
        const [a, b] = s;
        const re = a[0] * b[0] + a[1] * b[1];
        const im = a[0] * b[1] - a[1] * b[0];
        return [2 * re, 2 * im, QQ.prob(a) - QQ.prob(b)];
    };

    QQ.ket = (i, n) => '|' + i.toString(2).padStart(n, '0') + '>';

    // Every op a puzzle allows: gate names times wires (two-qubit gates both ways).
    QQ.moves = function (gates, n) {
        const out = [];
        for (const g of gates) {
            if (QQ.isTwo(g)) {
                for (let a = 0; a < n; a++)
                    for (let b = 0; b < n; b++)
                        if (a !== b && !(g !== 'CX' && a > b) && !(g === 'F' && a !== 0))
                            out.push([g, a, b]);
            } else {
                for (let q = 0; q < n; q++)
                    out.push([g, q]);
            }
        }
        return out;
    };

    // The fewest gates that take `start` to `target` (breadth first), or -1 within maxDepth.
    QQ.shortest = function (start, target, gates, n, maxDepth, limits = {}) {
        if (QQ.same(start, target))
            return 0;
        const moves = QQ.moves(gates, n);
        const key = s => QQ.canonical(s).map(z => z.map(v => v.toFixed(4)).join(',')).join(';');
        let frontier = [[start, {}]];
        const seen = new Set([key(start)]);
        for (let d = 1; d <= maxDepth; d++) {
            const next = [];
            for (const [s, used] of frontier) {
                for (const m of moves) {
                    const u = (used[m[0]] || 0) + 1;
                    if (limits[m[0]] !== undefined && u > limits[m[0]])
                        continue;
                    const t = QQ.apply(s, m, n);
                    if (QQ.same(t, target))
                        return d;
                    const k = key(t) + (Object.keys(limits).length ? JSON.stringify({...used, [m[0]]: u}) : '');
                    if (seen.has(k))
                        continue;
                    seen.add(k);
                    next.push([t, {...used, [m[0]]: u}]);
                }
            }
            frontier = next;
        }
        return -1;
    };
})();

if (typeof module !== 'undefined')
    module.exports = QQ;
