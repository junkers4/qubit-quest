// REQ-020: the simulator gets the physics right (Qiskit agrees too: tests/test_cross_check.py).
const test = require('node:test');
const assert = require('node:assert');
const QQ = require('./load.js');

const R = Math.SQRT1_2;
const amps = s => s.map(QQ.ampText);

test('REQ-020 X flips, H H is identity, HZH = X', () => {
    assert.ok(QQ.same(QQ.run([['X', 0]], 1), [[0, 0], [1, 0]]));
    assert.ok(QQ.same(QQ.run([['H', 0], ['H', 0]], 1), QQ.zero(1)));
    assert.ok(QQ.same(QQ.run([['H', 0], ['Z', 0], ['H', 0]], 1), QQ.run([['X', 0]], 1)));
});

test('REQ-020 S S = Z, T T = S, S S† = I, T T† = I, Y = I X Z', () => {
    const plus = QQ.run([['H', 0], ['T', 0]], 1);
    const eq = (a, b) => assert.ok(QQ.same(QQ.run(a, 1, plus), QQ.run(b, 1, plus)));
    eq([['S', 0], ['S', 0]], [['Z', 0]]);
    eq([['T', 0], ['T', 0]], [['S', 0]]);
    eq([['S', 0], ['SDG', 0]], []);
    eq([['T', 0], ['TDG', 0]], []);
    eq([['Y', 0]], [['Z', 0], ['X', 0]]);
});

test('REQ-020 Bell state, CNOT both ways, SWAP, three CNOTs', () => {
    assert.deepStrictEqual(amps(QQ.run([['H', 0], ['CX', 0, 1]], 2)), ['0.71', '0', '0', '0.71']);
    assert.deepStrictEqual(amps(QQ.run([['X', 1], ['CX', 1, 0]], 2)), ['0', '0', '0', '1']);
    assert.deepStrictEqual(amps(QQ.run([['X', 0], ['SWAP', 0, 1]], 2)), ['0', '1', '0', '0']);
    const start = QQ.run([['H', 0], ['T', 0], ['X', 1]], 2);
    assert.ok(QQ.same(QQ.run([['CX', 0, 1], ['CX', 1, 0], ['CX', 0, 1]], 2, start), QQ.run([['SWAP', 0, 1]], 2, start)));
});

test('REQ-020 CZ, CS and CS† phases', () => {
    const all = QQ.run([['H', 0], ['H', 1]], 2);
    assert.deepStrictEqual(amps(QQ.run([['CZ', 0, 1]], 2, all)), ['0.50', '0.50', '0.50', '-0.50']);
    assert.deepStrictEqual(amps(QQ.run([['CS', 0, 1]], 2, all)), ['0.50', '0.50', '0.50', '0.50I']);
    assert.deepStrictEqual(amps(QQ.run([['CSDG', 1, 0]], 2, all)), ['0.50', '0.50', '0.50', '-0.50I']);
});

test('REQ-020 Toffoli truth table', () => {
    for (let a = 0; a < 2; a++)
        for (let b = 0; b < 2; b++) {
            const prep = [...(a ? [['X', 0]] : []), ...(b ? [['X', 1]] : [])];
            const s = QQ.run([...prep, ['CCX', 0, 1, 2]], 3);
            const i = s.findIndex(z => QQ.prob(z) > 0.5);
            assert.strictEqual(QQ.ket(i, 3), `|${a}${b}${a & b}>`);
        }
});

test('REQ-020 the two-qubit QFT matches its formula', () => {
    for (let x = 0; x < 4; x++) {
        const prep = [...(x & 2 ? [['X', 0]] : []), ...(x & 1 ? [['X', 1]] : [])];
        const s = QQ.run([...prep, ['H', 0], ['CS', 0, 1], ['H', 1], ['SWAP', 0, 1]], 2);
        const want = [0, 1, 2, 3].map(k => [Math.cos(2 * Math.PI * x * k / 4) / 2, Math.sin(2 * Math.PI * x * k / 4) / 2]);
        assert.ok(QQ.same(s, want), 'x = ' + x);
    }
});

test('REQ-020 black boxes run their own ops', () => {
    const boxes = {F: [['CX', 0, 2], ['CX', 1, 2]]};
    const s = QQ.run([['X', 0], ['F']], 3, undefined, boxes);
    assert.strictEqual(QQ.ket(s.findIndex(z => QQ.prob(z) > 0.5), 3), '|101>');
    assert.deepStrictEqual(QQ.boxWires('F', boxes), [0, 1, 2]);
});

test('REQ-020 global phase is ignored, relative phase is not', () => {
    assert.ok(QQ.same([[0, 0], [-1, 0]], [[0, 0], [0, 1]]));
    assert.ok(!QQ.same(QQ.run([['H', 0]], 1), QQ.run([['X', 0], ['H', 0]], 1)));
});

test('REQ-020 reduced states: a Bell qubit alone is fully mixed', () => {
    const bell = QQ.run([['H', 0], ['CX', 0, 1]], 2);
    const rho = QQ.reduced(bell, 2, [0]);
    assert.ok(Math.abs(rho[0][0][0] - 0.5) < 1e-12 && Math.abs(rho[0][1][0]) < 1e-12);
    assert.deepStrictEqual(QQ.blochRho(rho).map(v => Math.round(v * 100) / 100 + 0), [0, 0, 0]);
    // a product state: matching on one qubit ignores the others
    const a = QQ.run([['X', 0], ['H', 1]], 2), b = QQ.run([['X', 0]], 2);
    assert.ok(QQ.matches(a, b, 2, [0]) && !QQ.matches(a, b, 2));
});

test('REQ-020 Bloch vectors', () => {
    const r = v => v.map(x => Math.round(x * 100) / 100 + 0);
    assert.deepStrictEqual(r(QQ.bloch(QQ.zero(1))), [0, 0, 1]);
    assert.deepStrictEqual(r(QQ.bloch(QQ.run([['X', 0], ['H', 0]], 1))), [-1, 0, 0]);
    assert.deepStrictEqual(r(QQ.bloch(QQ.run([['H', 0], ['S', 0]], 1))), [0, 1, 0]);
    assert.deepStrictEqual(r(QQ.bloch(QQ.run([['H', 0]], 2), 2, 0)), [1, 0, 0]);
});

test('REQ-020 amplitude text and phase names', () => {
    assert.strictEqual(QQ.ampText([0, -R]), '-0.71I');
    assert.strictEqual(QQ.ampText([0.5, 0.5]), '0.50+0.50I');
    assert.strictEqual(QQ.phaseName([-0.5, 0]), '-');
    assert.strictEqual(QQ.phaseName([0, 0.5]), 'i');
    assert.strictEqual(QQ.phaseName([0.5, 0.5]), 'other');
});

test('REQ-020 allowed wires and the move list', () => {
    const allow = {CX: [[0, 1], [1, 2]], CZ: [[0, 2]], H: [0, 1]};
    assert.ok(QQ.allowed(['CX', 0, 1], allow) && !QQ.allowed(['CX', 1, 0], allow));
    assert.ok(QQ.allowed(['CZ', 2, 0], allow), 'CZ is symmetric');
    assert.ok(!QQ.allowed(['H', 2], allow) && QQ.allowed(['X', 2], allow));
    const moves = QQ.moves(['CCX'], 3);
    assert.deepStrictEqual(moves, [['CCX', 0, 1, 2], ['CCX', 0, 2, 1], ['CCX', 1, 2, 0]]);
});
