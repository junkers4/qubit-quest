// Online check of every source: each DOI must resolve at doi.org, each arXiv id must
// exist, each URL must answer. Needs network access. Run: node tools/check-refs.js
const QQ = require('../test/load.js');

async function ok(url, test = r => r.ok) {
    try {
        const r = await fetch(url, {redirect: 'follow', headers: {'User-Agent': 'qubit-quest check-refs'}});
        return test(r) ? null : `HTTP ${r.status}`;
    } catch (e) {
        return e.message;
    }
}

(async () => {
    let bad = 0;
    for (const [key, r] of Object.entries(QQ.REFS)) {
        const checks = [];
        if (r.doi)
            checks.push(['doi ' + r.doi, `https://doi.org/api/handles/${encodeURIComponent(r.doi)}`,
                async res => res.ok && (await res.json()).responseCode === 1]);
        if (r.arxiv)
            checks.push(['arXiv ' + r.arxiv, `https://export.arxiv.org/abs/${r.arxiv}`]);
        if (r.url)
            checks.push(['url', r.url]);
        for (const [what, url, test] of checks) {
            let err;
            if (test) {
                try {
                    const res = await fetch(url);
                    err = (await test(res)) ? null : `HTTP ${res.status}`;
                } catch (e) {
                    err = e.message;
                }
            } else {
                err = await ok(url);
            }
            console.log(`${err ? 'FAIL' : 'ok  '} ${key}: ${what}${err ? ' (' + err + ')' : ''}`);
            if (err)
                bad++;
        }
    }
    console.log(bad ? `${bad} problem(s)` : 'all sources resolve');
    process.exit(bad ? 1 : 0);
})();
