// The curriculum: structure, explanations, sources, code, puzzles, glyphs and line widths.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const QQ = require('./load.js');

const NARROW_COLS = 38; // the narrowest screen (256 px wide) fits 38 characters of text

test('REQ-001 eight worlds from classical bits to hardware and real machines, 60+ levels', () => {
    assert.deepStrictEqual(QQ.WORLDS.map(w => w.title), ['CLASSICAL WARM-UP', 'MATH TOOLKIT', 'ONE QUBIT',
        'MANY QUBITS', 'QUANTUM PROTOCOLS', 'ALGORITHMS', 'QUANTUM HARDWARE', 'REAL QUANTUM COMPUTERS']);
    assert.ok(QQ.LEVELS.length >= 60);
    for (const pic of QQ.LEVELS.flatMap(l => l.steps).filter(s => s.pic).map(s => s.pic))
        assert.ok(QQ.PICS[pic], 'drawing ' + pic);
    for (const w of QQ.WORLDS)
        assert.ok(QQ.LEVELS.filter(l => l.world === w.id).length >= 3, w.title);
    // worlds come in order, and every level teaches before it tests
    const order = QQ.LEVELS.map(l => l.world);
    assert.deepStrictEqual(order, [...order].sort((a, b) => a - b));
    const ids = QQ.LEVELS.map(l => l.id);
    assert.strictEqual(new Set(ids).size, ids.length, 'unique ids');
    for (const L of QQ.LEVELS) {
        assert.strictEqual(L.steps[0].type, 'text', L.id + ' starts with a lesson');
        assert.ok(L.steps.some(s => s.type !== 'text'), L.id + ' has a quiz or a puzzle');
    }
});

test('REQ-003 every lesson page and puzzle has an ELI5 explanation, every step can show one', () => {
    for (const L of QQ.LEVELS)
        L.steps.forEach((S, i) => {
            if (S.type !== 'quiz')
                assert.ok(S.eli5 && S.eli5.length > 20, `${L.id} step ${i + 1}`);
            assert.ok(QQ.eli5For(L, i), `${L.id} step ${i + 1} resolves an ELI5`);
        });
});

const cites = L => [...(L.refs || []), ...L.steps.flatMap(s => s.refs || [])];

test('REQ-004 every level cites sources that exist; algorithms and protocols cite their origin', () => {
    for (const L of QQ.LEVELS) {
        assert.ok(cites(L).length > 0, L.id);
        for (const c of cites(L))
            assert.ok(QQ.refParts(c).ref, `${L.id}: unknown source ${c}`);
        if (L.world === 5 || ['deutsch', 'dj', 'bv', 'simon', 'grover', 'shor', 'qec'].includes(L.id)) {
            assert.ok(L.origin, L.id + ' names its original paper');
            assert.ok(cites(L).some(c => QQ.refParts(c).key === L.origin), L.id + ' cites its origin');
        }
    }
    for (const b of [...QQ.BOOK, ...QQ.GLOSSARY])
        for (const c of b.refs)
            assert.ok(QQ.refParts(c).ref, `${b.gate || b.term}: unknown source ${c}`);
});

test('REQ-013 every level has deep-dive pages (MORE), each with sources', () => {
    for (const L of QQ.LEVELS) {
        assert.ok(L.deep && L.deep.length >= 2, L.id + ' has at least two MORE pages');
        for (const d of L.deep) {
            assert.ok(d.title && d.body && d.body.length > 80, `${L.id}: ${d.title}`);
            assert.ok(d.refs && d.refs.length, `${L.id}: ${d.title} cites a source`);
            for (const c of d.refs)
                assert.ok(QQ.refParts(c).ref, `${L.id}: unknown source ${c}`);
        }
    }
});

test('REQ-007 every level has a runnable CODE example, each example belongs to one level', () => {
    const files = fs.readdirSync(path.join(QQ.root, 'examples')).filter(f => /^\d\d_.*\.py$/.test(f));
    const used = QQ.LEVELS.map(l => l.code);
    for (const L of QQ.LEVELS) {
        assert.ok(L.code && QQ.EXAMPLES[L.code], L.id);
        assert.ok(QQ.EXAMPLES[L.code].code.includes(`Level ${QQ.LEVELS.indexOf(L) + 1}, ${L.title}`),
            `${L.code} names level ${QQ.LEVELS.indexOf(L) + 1}`);
    }
    assert.strictEqual(new Set(used).size, used.length);
    assert.deepStrictEqual(files.map(f => f.replace('.py', '')).sort(), [...used].sort());
});

test('REQ-008 quizzes have 2-4 options, a right answer and an explanation', () => {
    for (const L of QQ.LEVELS)
        for (const S of L.steps.filter(s => s.type === 'quiz')) {
            assert.ok(S.q && S.why, L.id);
            assert.ok(S.options.length >= 2 && S.options.length <= 4, L.id);
            assert.ok(Number.isInteger(S.answer) && S.answer >= 0 && S.answer < S.options.length, L.id);
            assert.strictEqual(new Set(S.options).size, S.options.length, L.id + ' distinct options');
        }
});

test('REQ-009 every puzzle is solvable with its own gates and par is the true minimum', () => {
    for (const L of QQ.LEVELS)
        L.steps.forEach((S, i) => {
            if (S.type !== 'circuit')
                return;
            const name = `${L.id} step ${i + 1}`;
            assert.ok(S.qubits >= 1 && S.qubits <= 3, name);
            assert.ok(S.goal && S.hint, name);
            for (const op of S.solution) {
                assert.ok(S.gates.includes(op[0]), `${name}: ${op[0]} is offered`);
                assert.ok(QQ.allowed(op, S.allow), `${name}: ${op} is allowed`);
                assert.ok(op.slice(1).every(q => q < S.qubits), name);
            }
            for (const g of S.gates)
                assert.ok(QQ.GATES[g] || (S.boxes && S.boxes[g]), `${name}: gate ${g}`);
            const {start, goal} = QQ.puzzleStates(S);
            const p = {gates: S.gates, n: S.qubits, limits: S.limits, allow: S.allow, boxes: S.boxes,
                after: S.after, goalQubits: S.goalQubits, probsOnly: S.probsOnly};
            assert.ok(!QQ.matches(QQ.run(S.after || [], S.qubits, start, S.boxes), goal, S.qubits, S.goalQubits, 1e-6, S.probsOnly),
                name + ': not solved before you start');
            assert.strictEqual(QQ.shortest(start, goal, p, S.par), S.par, name + ': par is the minimum');
            assert.ok(S.solution.length >= S.par, name);
        });
});

// every string the game shows, and whether it keeps its case
function shownTexts() {
    const up = [], keep = [];
    for (const w of QQ.WORLDS)
        up.push(w.title);
    for (const L of QQ.LEVELS) {
        up.push(L.title);
        for (const S of [...L.steps, ...(L.deep || [])])
            up.push(S.title, S.body, S.eli5, S.q, S.why, S.goal, S.hint, S.allowText, ...(S.options || []), ...(S.refs || []));
        keep.push(QQ.EXAMPLES[L.code].code, QQ.EXAMPLES[L.code].file);
    }
    for (const b of QQ.BOOK)
        up.push(b.name, b.text, ...b.matrix), keep.push(b.qiskit);
    for (const g of QQ.GLOSSARY)
        up.push(g.term, g.text, ...g.refs);
    up.push(...Object.values(QQ.GATE_TIPS), ...Object.values(QQ.GATES).map(g => g.label));
    for (const r of Object.values(QQ.REFS))
        keep.push(QQ.citeText(r), ...QQ.citeIds(r));
    return {up: up.filter(Boolean), keep};
}

test('REQ-010 the pixel font has a glyph for every character the game shows', () => {
    const {up, keep} = shownTexts();
    const missing = new Set();
    for (const s of up)
        for (const ch of s)
            if (ch !== '\n' && !QQ.hasGlyph(ch))
                missing.add(ch);
    for (const s of keep)
        for (const ch of s)
            if (ch !== '\n' && !QQ.hasGlyph(ch, true))
                missing.add(ch);
    assert.deepStrictEqual([...missing], []);
});

test('REQ-011 text fits the narrowest screen: no long words, formulas fit a line', () => {
    const {up} = shownTexts();
    for (const s of up)
        for (const word of s.split(/\s+/))
            assert.ok(word.length <= NARROW_COLS, `too long: ${word}`);
    for (const L of QQ.LEVELS)
        for (const S of [...L.steps, ...(L.deep || [])].filter(s => s.body))
            for (const para of S.body.split('\n'))
                if (para.startsWith('  '))
                    assert.ok(para.length - 2 <= NARROW_COLS - 2, `${L.id}: formula too wide: ${para}`);
    for (const b of QQ.BOOK)
        for (const m of b.matrix)
            assert.ok(m.length <= NARROW_COLS - 2, `${b.gate}: matrix too wide: ${m}`);
    for (const S of QQ.LEVELS.flatMap(l => l.steps))
        if (S.title)
            assert.ok(S.title.length <= NARROW_COLS, S.title);
    for (const L of QQ.LEVELS)
        assert.ok(('LEVEL 00 ' + L.title).length <= NARROW_COLS - 3, L.title);
});

test('REQ-012 the gate book covers every gate, with a matrix and the Qiskit call', () => {
    const inBook = new Set(QQ.BOOK.map(b => b.gate));
    for (const g of Object.keys(QQ.GATES))
        assert.ok(inBook.has(g), g);
    for (const b of QQ.BOOK) {
        assert.ok(b.matrix.length && b.text && /^qc\.[a-z]+\(/.test(b.qiskit), b.gate);
        assert.ok(b.refs.length, b.gate);
    }
    for (const g of Object.keys(QQ.GATES))
        assert.ok(QQ.GATE_TIPS[g], g + ' has a tip');
    const terms = QQ.GLOSSARY.map(g => g.term);
    assert.deepStrictEqual(terms, [...terms].sort(), 'glossary in alphabetical order');
    assert.ok(QQ.GLOSSARY.every(g => g.refs.length));
});
