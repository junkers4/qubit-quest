// Traceability: every REQ in docs/requirements.md is named by a test, and tests name only
// requirements that exist.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const doc = fs.readFileSync(path.join(root, 'docs', 'requirements.md'), 'utf8');
const rows = doc.split('\n').filter(l => /^\| REQ-\d{3} \|/.test(l));
const ids = rows.map(l => l.match(/REQ-\d{3}/)[0]);
const untested = new Set(rows.filter(l => /\*\*(manual|online)\*\*/.test(l)).map(l => l.match(/REQ-\d{3}/)[0]));

const testFiles = [
    ...fs.readdirSync(path.join(root, 'test')).map(f => path.join(root, 'test', f)),
    ...fs.readdirSync(path.join(root, 'tests')).filter(f => f.endsWith('.py')).map(f => path.join(root, 'tests', f)),
].filter(f => f !== __filename && /\.(js|py)$/.test(f));
const named = new Set(testFiles.flatMap(f => fs.readFileSync(f, 'utf8').match(/REQ-\d{3}/g) || []));

test('every requirement is unique and has a test', () => {
    assert.strictEqual(new Set(ids).size, ids.length, 'unique ids');
    const missing = ids.filter(id => !untested.has(id) && !named.has(id));
    assert.deepStrictEqual(missing, []);
});

test('tests only name requirements that exist', () => {
    const unknown = [...named].filter(id => !ids.includes(id));
    assert.deepStrictEqual(unknown, []);
});
