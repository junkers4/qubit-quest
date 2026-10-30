// REQ-005, REQ-006: every source is a real, checkable record, and every one is used.
const test = require('node:test');
const assert = require('node:assert');
const QQ = require('./load.js');

function isbn13ok(isbn) {
    const d = isbn.replace(/-/g, '');
    if (!/^97[89]\d{10}$/.test(d))
        return false;
    const sum = [...d.slice(0, 12)].reduce((s, c, i) => s + +c * (i % 2 ? 3 : 1), 0);
    return (10 - sum % 10) % 10 === +d[12];
}

test('REQ-005 every source has authors, year, title, a checked record and a valid identifier', () => {
    for (const [key, r] of Object.entries(QQ.REFS)) {
        assert.ok(r.authors && r.year && r.title && r.where, key);
        assert.match(r.checked, /^https:\/\/\S+$/, key + ' names the record that confirmed it');
        assert.ok(r.doi || r.arxiv || r.isbn || r.url, key + ' has an identifier');
        if (r.doi)
            assert.match(r.doi, /^10\.\d{4,9}\/\S+$/, key);
        if (r.arxiv)
            assert.match(r.arxiv, /^(\d{4}\.\d{4,5}|[a-z-]+\/\d{7})$/, key);
        if (r.isbn)
            assert.ok(isbn13ok(r.isbn), key + ': ISBN check digit');
        if (r.url)
            assert.match(r.url, /^https:\/\/\S+$/, key);
        if (typeof r.year === 'number')
            assert.ok(r.year >= 1900 && r.year <= 2026, key);
    }
});

test('REQ-005 the ISBN check itself', () => {
    assert.ok(isbn13ok('978-1-107-00217-3'));
    assert.ok(!isbn13ok('978-1-107-00217-4'));
});

test('REQ-006 every source is cited somewhere, and only known sources are cited', () => {
    const cited = new Set();
    const add = c => {
        const {key, ref} = QQ.refParts(c);
        assert.ok(ref, 'unknown source ' + c);
        cited.add(key);
    };
    for (const L of QQ.LEVELS) {
        (L.refs || []).forEach(add);
        L.steps.forEach(s => (s.refs || []).forEach(add));
    }
    for (const b of [...QQ.BOOK, ...QQ.GLOSSARY])
        b.refs.forEach(add);
    const unused = Object.keys(QQ.REFS).filter(k => !cited.has(k));
    assert.deepStrictEqual(unused, []);
});
