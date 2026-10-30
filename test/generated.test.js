// REQ-022, REQ-050: generated files match their sources.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const same = (file, build, how) =>
    assert.strictEqual(fs.readFileSync(path.join(root, file), 'utf8'), build(), `${file} is stale: run ${how}`);

test('REQ-022 src/examples.js matches examples/*.py', () => {
    same('src/examples.js', require('../tools/embed-examples.js'), 'node tools/embed-examples.js');
});

test('REQ-022 tests/sim_cases.json matches the simulator and the puzzles', () => {
    same('tests/sim_cases.json', require('../tools/export-cases.js'), 'node tools/export-cases.js');
});

test('REQ-050 docs/REFERENCES.md matches src/refs.js', () => {
    same('docs/REFERENCES.md', require('../tools/gen-references.js'), 'node tools/gen-references.js');
});
