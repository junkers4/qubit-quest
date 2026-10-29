const test = require('node:test');
const assert = require('node:assert');
const QQ = require('../src/sim.js');

test('X flips, H H is identity', () => {
    assert.ok(QQ.same(QQ.run([['X', 0]], 1), [[0, 0], [1, 0]]));
    assert.ok(QQ.same(QQ.run([['H', 0], ['H', 0]], 1), QQ.zero(1)));
});
test('HZH = X', () => {
    assert.ok(QQ.same(QQ.run([['H', 0], ['Z', 0], ['H', 0]], 1), QQ.run([['X', 0]], 1)));
});
test('S S = Z and T T = S', () => {
    const plus = QQ.run([['H', 0]], 1);
    assert.ok(QQ.same(QQ.run([['S', 0], ['S', 0]], 1, plus), QQ.run([['Z', 0]], 1, plus)));
    assert.ok(QQ.same(QQ.run([['T', 0], ['T', 0]], 1, plus), QQ.run([['S', 0]], 1, plus)));
});
test('Bell state and CNOT direction', () => {
    const bell = QQ.run([['H', 0], ['CX', 0, 1]], 2);
    assert.deepStrictEqual(bell.map(QQ.ampText), ['0.71', '0', '0', '0.71']);
    assert.deepStrictEqual(QQ.run([['X', 1], ['CX', 1, 0]], 2).map(QQ.ampText), ['0', '0', '0', '1']);
    assert.deepStrictEqual(QQ.run([['X', 0], ['SWAP', 0, 1]], 2).map(QQ.ampText), ['0', '1', '0', '0']);
});
test('global phase is ignored', () => {
    assert.ok(QQ.same([[0, 0], [-1, 0]], [[0, 0], [0, 1]]));
    assert.ok(!QQ.same(QQ.run([['H', 0]], 1), QQ.run([['X', 0], ['H', 0]], 1)));
});
test('bloch vectors', () => {
    const r = v => v.map(x => Math.round(x * 100) / 100 + 0);
    assert.deepStrictEqual(r(QQ.bloch(QQ.zero(1))), [0, 0, 1]);
    assert.deepStrictEqual(r(QQ.bloch(QQ.run([['X', 0], ['H', 0]], 1))), [-1, 0, 0]);
    assert.deepStrictEqual(r(QQ.bloch(QQ.run([['H', 0], ['S', 0]], 1))), [0, 1, 0]);
});
test('amplitude text and phase names', () => {
    assert.strictEqual(QQ.ampText([0, -Math.SQRT1_2]), '-0.71I');
    assert.strictEqual(QQ.phaseName([-0.5, 0]), '-');
    assert.strictEqual(QQ.phaseName([0, 0.5]), 'i');
});
