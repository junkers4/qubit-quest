// Writes tests/sim_cases.json: the game simulator's state for every puzzle solution and
// for random circuits over every gate. tests/test_cross_check.py rebuilds each circuit
// in Qiskit and checks it gets the same amplitudes. `make test` fails when the file is
// out of date. Run: node tools/export-cases.js
const fs = require('fs');
const path = require('path');

function build() {
    delete require.cache[require.resolve('../test/load.js')];
    const QQ = require('../test/load.js');
    const expand = (ops, boxes) => ops.flatMap(op => QQ.isBox(op[0], boxes) ? expand(boxes[op[0]], boxes) : [op]);
    const round = st => st.map(([r, i]) => [+r.toFixed(12), +i.toFixed(12)]);
    const cases = [];
    for (const L of QQ.LEVELS)
        L.steps.forEach((S, i) => {
            if (S.type !== 'circuit')
                return;
            const ops = expand([...(S.setup || []), ...S.solution, ...(S.after || [])], S.boxes);
            cases.push({name: `${L.id} step ${i + 1}`, n: S.qubits, ops, state: round(QQ.run(ops, S.qubits))});
        });
    // random circuits, from a fixed seed
    let seed = 12345;
    const rand = k => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed % k;
    };
    const names = Object.keys(QQ.GATES);
    for (let c = 0; c < 60; c++) {
        const n = 1 + rand(3);
        const ops = [];
        for (let g = 0; g < 12; g++) {
            const usable = names.filter(x => QQ.GATES[x].arity <= n);
            const name = usable[rand(usable.length)];
            const wires = [];
            while (wires.length < QQ.GATES[name].arity) {
                const q = rand(n);
                if (!wires.includes(q))
                    wires.push(q);
            }
            ops.push([name, ...wires]);
        }
        cases.push({name: `random ${c}`, n, ops, state: round(QQ.run(ops, n))});
    }
    return JSON.stringify(cases, null, 0).replace(/\},\{/g, '},\n{') + '\n';
}

module.exports = build;
if (require.main === module) {
    fs.writeFileSync(path.join(__dirname, '..', 'tests', 'sim_cases.json'), build());
    console.log('tests/sim_cases.json written');
}
