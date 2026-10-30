// Writes tests/asm_cases.json: for every puzzle, its ops with the black boxes left as boxes,
// and the goal check the game makes (QQ.matches) on a few states: the goal itself, the start,
// the solution one gate short, and the solution plus a stray X. tests/test_asm.py runs these
// through the assembler core and wants the same verdicts. Run: node tools/export-asm-cases.js
const fs = require('fs');
const path = require('path');

function build() {
    delete require.cache[require.resolve('../test/load.js')];
    const QQ = require('../test/load.js');
    const round = st => st.map(([r, i]) => [+r.toFixed(12), +i.toFixed(12)]);
    const cases = [];
    for (const L of QQ.LEVELS)
        L.steps.forEach((S, i) => {
            if (S.type !== 'circuit')
                return;
            const n = S.qubits, setup = S.setup || [], after = S.after || [];
            const run = mid => QQ.run([...setup, ...mid, ...after], n, undefined, S.boxes);
            const goal = run(S.solution);
            const tries = [S.solution, [], S.solution.slice(0, -1), [...S.solution, ['X', 0]]].map(mid => {
                const st = run(mid);
                return {ops: mid, state: round(st), ok: QQ.matches(st, goal, n, S.goalQubits, 1e-6, !!S.probsOnly)};
            });
            cases.push({name: `${L.id} step ${i + 1}`, n, setup, after, boxes: S.boxes || {},
                goal: round(goal), keep: S.goalQubits || [], probsOnly: !!S.probsOnly, tries});
        });
    return JSON.stringify(cases, null, 0).replace(/\},\{"name"/g, '},\n{"name"') + '\n';
}

module.exports = build;
if (require.main === module) {
    fs.writeFileSync(path.join(__dirname, '..', 'tests', 'asm_cases.json'), build());
    console.log('tests/asm_cases.json written');
}
