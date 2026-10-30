// Runs circuits on the WebAssembly core (src/qcore.wat, bytes in src/qcore-bin.js).
// In the browser QQ.run switches to it as soon as it is loaded; src/sim.js stays the
// reference (and is what the node tests and the puzzle search use).
var QQ = globalThis.QQ || (globalThis.QQ = {});

(function () {
    const decode = b64 => typeof atob === 'function'
        ? Uint8Array.from(atob(b64), c => c.charCodeAt(0))
        : Uint8Array.from(Buffer.from(b64, 'base64'));

    // the WebAssembly instance's exports, after loadCore()
    QQ.loadCore = async function () {
        const {instance} = await WebAssembly.instantiate(decode(QQ.CORE_WASM));
        QQ.core = instance.exports;
        return QQ.core;
    };

    // The same contract as QQ.run in sim.js: ops on n qubits from `state` (default |0..0>).
    QQ.runCore = function (ops, n, state, boxes) {
        const core = QQ.core;
        const mem = new Float64Array(core.memory.buffer, 0, 2 << n);
        if (state) {
            core.set_n(n);
            state.forEach(([re, im], i) => {
                mem[2 * i] = re;
                mem[2 * i + 1] = im;
            });
        } else {
            core.init(n);
        }
        const apply = op => {
            const [g, a, b, c] = op;
            if (QQ.isBox(g, boxes))
                return boxes[g].forEach(apply);
            const m = QQ.MATRICES[g];
            if (m)
                core.apply1(a, ...m.flat());
            else if (g === 'CX')
                core.cx(a, b);
            else if (g === 'CCX')
                core.ccx(a, b, c);
            else if (g === 'CZ')
                core.cphase(a, b, -1, 0);
            else if (g === 'CS')
                core.cphase(a, b, 0, 1);
            else if (g === 'CSDG')
                core.cphase(a, b, 0, -1);
            else if (g === 'SWAP')
                core.swap(a, b);
            else
                throw new Error('unknown gate ' + g);
        };
        ops.forEach(apply);
        return Array.from({length: 1 << n}, (_, i) => [mem[2 * i], mem[2 * i + 1]]);
    };

    // in the browser: load it and let the game use it
    if (typeof window !== 'undefined')
        QQ.loadCore().then(() => {
            QQ.runJS = QQ.run;
            QQ.run = QQ.runCore;
            QQ.engine = 'webassembly';
        }, () => {
            QQ.engine = 'javascript'; // no WebAssembly: the reference simulator still works
        });
})();

if (typeof module !== 'undefined')
    module.exports = QQ;
