// REQ-021: the WebAssembly core gives the same amplitudes as the reference simulator, for
// every case Qiskit checks (tests/sim_cases.json) and from arbitrary starting states.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const QQ = require('./load.js');
const build = require('../tools/build-wasm.js');

const cases = JSON.parse(fs.readFileSync(path.join(QQ.root, 'tests', 'sim_cases.json'), 'utf8'));
const close = (a, b) => a.every((z, i) => Math.abs(z[0] - b[i][0]) < 1e-12 && Math.abs(z[1] - b[i][1]) < 1e-12);

test('REQ-021 src/qcore-bin.js was assembled from the current src/qcore.wat', async () => {
    assert.strictEqual(QQ.CORE_WAT_SHA256, build.sha(fs.readFileSync(build.watFile, 'utf8')),
        'run node tools/build-wasm.js');
    let wabt = true;
    try {
        require.resolve('wabt');
    } catch (e) {
        wabt = false; // without the dev dependency the hash check above still holds
    }
    if (wabt)
        assert.strictEqual(build.render(await build.assemble()),
            fs.readFileSync(path.join(QQ.root, 'src', 'qcore-bin.js'), 'utf8'));
});

test('REQ-021 the WebAssembly core matches the reference on every Qiskit case', async () => {
    await QQ.loadCore();
    for (const c of cases)
        assert.ok(close(QQ.runCore(c.ops, c.n), QQ.run(c.ops, c.n)), c.name);
});

test('REQ-021 the WebAssembly core matches the reference from given states, with boxes', async () => {
    await QQ.loadCore();
    for (const L of QQ.LEVELS)
        for (const S of L.steps.filter(s => s.type === 'circuit')) {
            const start = QQ.run(S.setup || [], S.qubits, undefined, S.boxes);
            const ops = [...S.solution, ...(S.after || [])];
            assert.ok(close(QQ.runCore(ops, S.qubits, start, S.boxes), QQ.run(ops, S.qubits, start, S.boxes)), L.id);
        }
    // a 10-qubit state with every gate
    const n = 10, ops = [];
    let s = 99;
    const rnd = k => (s = (s * 1103515245 + 12345) % 2147483648) % k;
    for (let g = 0; g < 400; g++) {
        const names = Object.keys(QQ.GATES), name = names[rnd(names.length)], wires = [];
        while (wires.length < QQ.GATES[name].arity) {
            const q = rnd(n);
            if (!wires.includes(q))
                wires.push(q);
        }
        ops.push([name, ...wires]);
    }
    assert.ok(close(QQ.runCore(ops, n), QQ.run(ops, n)));
});
