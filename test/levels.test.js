// Every level is well formed and every puzzle can be solved; `par` is the true minimum.
const test = require('node:test');
const assert = require('node:assert');
require('../src/sim.js');
const QQ = require('../src/levels.js');

const ids = new Set();
for (const level of QQ.LEVELS) {
    test(`level ${level.id}`, () => {
        assert.ok(!ids.has(level.id), 'unique id');
        ids.add(level.id);
        assert.ok(QQ.WORLDS.some(w => w.id === level.world), 'known world');
        assert.ok(level.steps.length > 0);
        for (const step of level.steps) {
            if (step.type === 'text') {
                assert.ok(step.title && step.body);
            } else if (step.type === 'quiz') {
                assert.ok(step.q && step.why);
                assert.ok(step.options.length >= 2 && step.options.length <= 4);
                assert.ok(step.answer >= 0 && step.answer < step.options.length);
            } else if (step.type === 'circuit') {
                const n = step.qubits;
                assert.ok(n === 1 || n === 2);
                const start = QQ.run(step.setup || [], n);
                const target = QQ.run(step.solution, n, start);
                for (const op of step.solution)
                    assert.ok(step.gates.includes(op[0]), `${op[0]} is offered`);
                assert.ok(!QQ.same(start, target), 'the start is not already solved');
                const best = QQ.shortest(start, target, step.gates, n, step.par, step.limits);
                assert.strictEqual(best, step.par, `${step.goal}: shortest is ${best}`);
            } else {
                assert.fail('unknown step type ' + step.type);
            }
        }
    });
}
