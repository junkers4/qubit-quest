// The worlds, in order. Each src/levels/N-*.js file adds its levels to QQ.LEVELS;
// index.html loads them in this order, and the order is the unlock order.
// Every level follows docs/LEVEL_TEMPLATE.md.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.WORLDS = [
    {id: 1, title: 'CLASSICAL WARM-UP'},
    {id: 2, title: 'MATH TOOLKIT'},
    {id: 3, title: 'ONE QUBIT'},
    {id: 4, title: 'MANY QUBITS'},
    {id: 5, title: 'QUANTUM PROTOCOLS'},
    {id: 6, title: 'ALGORITHMS'},
    {id: 7, title: 'QUANTUM HARDWARE'},
    {id: 8, title: 'REAL QUANTUM COMPUTERS'},
];

QQ.LEVELS = [];

// The simple explanation for step i: its own, or the nearest one before it, or the level's.
QQ.eli5For = function (L, i) {
    for (let k = i; k >= 0; k--)
        if (L.steps[k].eli5)
            return L.steps[k].eli5;
    return L.eli5;
};

if (typeof module !== 'undefined')
    module.exports = QQ;
