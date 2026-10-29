// The pixel look, taken from BlackBreak (linux/.../pixelfont.js): a 5x7 font with
// Slovak accents, the palette and a few icons, all drawn as whole pixels on a
// low-resolution canvas that the page scales up without smoothing.
var QQ = globalThis.QQ || (globalThis.QQ = {});

QQ.PAL = {
    bg: '#0d0c0b',
    white: '#f4f0e0',
    gold: '#fcc030',
    red: '#b01818',
    shadow: '#3c0808',
    green: '#30c030',
    dim: '#7a7468',
    blue: '#5c5cfc',
    navy: '#04042c',
    darkgreen: '#1d2a1d',
    purple: '#a050e0',
};

(function () {
    // 5 columns x 7 rows per glyph; '1' is a lit pixel.
    const G = {
        A: '01110 10001 10001 11111 10001 10001 10001',
        B: '11110 10001 10001 11110 10001 10001 11110',
        C: '01110 10001 10000 10000 10000 10001 01110',
        D: '11110 10001 10001 10001 10001 10001 11110',
        E: '11111 10000 10000 11110 10000 10000 11111',
        F: '11111 10000 10000 11110 10000 10000 10000',
        G: '01110 10001 10000 10111 10001 10001 01111',
        H: '10001 10001 10001 11111 10001 10001 10001',
        I: '01110 00100 00100 00100 00100 00100 01110',
        J: '00111 00010 00010 00010 00010 10010 01100',
        K: '10001 10010 10100 11000 10100 10010 10001',
        L: '10000 10000 10000 10000 10000 10000 11111',
        M: '10001 11011 10101 10101 10001 10001 10001',
        N: '10001 11001 10101 10011 10001 10001 10001',
        O: '01110 10001 10001 10001 10001 10001 01110',
        P: '11110 10001 10001 11110 10000 10000 10000',
        Q: '01110 10001 10001 10001 10101 10010 01101',
        R: '11110 10001 10001 11110 10100 10010 10001',
        S: '01111 10000 10000 01110 00001 00001 11110',
        T: '11111 00100 00100 00100 00100 00100 00100',
        U: '10001 10001 10001 10001 10001 10001 01110',
        V: '10001 10001 10001 10001 10001 01010 00100',
        W: '10001 10001 10001 10101 10101 11011 10001',
        X: '10001 10001 01010 00100 01010 10001 10001',
        Y: '10001 10001 01010 00100 00100 00100 00100',
        Z: '11111 00001 00010 00100 01000 10000 11111',
        0: '01110 10001 10011 10101 11001 10001 01110',
        1: '00100 01100 00100 00100 00100 00100 01110',
        2: '01110 10001 00001 00010 00100 01000 11111',
        3: '11110 00001 00001 01110 00001 00001 11110',
        4: '00010 00110 01010 10010 11111 00010 00010',
        5: '11111 10000 11110 00001 00001 10001 01110',
        6: '00110 01000 10000 11110 10001 10001 01110',
        7: '11111 00001 00010 00100 01000 01000 01000',
        8: '01110 10001 10001 01110 10001 10001 01110',
        9: '01110 10001 10001 01111 00001 00010 01100',
        '.': '00000 00000 00000 00000 00000 01100 01100',
        ',': '00000 00000 00000 00000 00000 00100 01000',
        '!': '00100 00100 00100 00100 00100 00000 00100',
        '%': '11001 11010 00010 00100 01000 01011 10011',
        ':': '00000 00100 00100 00000 00100 00100 00000',
        ';': '00000 01100 01100 00000 01100 00100 01000',
        '-': '00000 00000 00000 11111 00000 00000 00000',
        '/': '00001 00010 00010 00100 01000 01000 10000',
        '?': '01110 10001 00001 00010 00100 00000 00100',
        ' ': '00000 00000 00000 00000 00000 00000 00000',
        // for the quantum notation
        '(': '00010 00100 01000 01000 01000 00100 00010',
        ')': '01000 00100 00010 00010 00010 00100 01000',
        '[': '01110 01000 01000 01000 01000 01000 01110',
        ']': '01110 00010 00010 00010 00010 00010 01110',
        '+': '00000 00100 00100 11111 00100 00100 00000',
        '=': '00000 00000 11111 00000 11111 00000 00000',
        '|': '00100 00100 00100 00100 00100 00100 00100',
        '>': '01000 00100 00010 00001 00010 00100 01000',
        '<': '00010 00100 01000 10000 01000 00100 00010',
        "'": '00100 00100 01000 00000 00000 00000 00000',
        '"': '01010 01010 00000 00000 00000 00000 00000',
        '*': '00000 00100 10101 01110 10101 00100 00000',
        '^': '00100 01010 10001 00000 00000 00000 00000',
        '_': '00000 00000 00000 00000 00000 00000 11111',
        '#': '01010 11111 01010 01010 01010 11111 01010',
        '&': '01100 10010 10100 01000 10101 10010 01101',
        '√': '00111 00100 00100 00100 10100 01100 00100',
        'Ψ': '10101 10101 10101 01110 00100 00100 00100',
        'Φ': '00100 01110 10101 10101 10101 01110 00100',
        'Θ': '01110 10001 10001 11111 10001 10001 01110',
        'Π': '00000 11111 01010 01010 01010 01010 01010',
        '→': '00000 00100 00010 11111 00010 00100 00000',
        '·': '00000 00000 00000 01100 01100 00000 00000',
        '≠': '00001 00010 11111 00100 11111 01000 10000',
        '⊕': '01110 10101 10101 11111 10101 10101 01110',
        '⊗': '01110 10001 11011 10101 11011 10001 01110',
        '★': '00100 00100 11111 01110 01010 10001 00000',
    };
    const GLYPHS = {};
    for (const [ch, rows] of Object.entries(G))
        GLYPHS[ch] = rows.split(' ');

    // Slovak letters: a base glyph and two pixel rows above it (as in BlackBreak).
    const ACCENT = {
        caron: ['01010', '00100'],
        acute: ['00010', '00100'],
        circ: ['00100', '01010'],
        uml: ['01010', '00000'],
    };
    const SK = {
        Č: ['C', 'caron'], Ď: ['D', 'caron'], Ň: ['N', 'caron'], Š: ['S', 'caron'],
        Ť: ['T', 'caron'], Ž: ['Z', 'caron'], Ľ: ['L', 'caron'],
        Á: ['A', 'acute'], É: ['E', 'acute'], Í: ['I', 'acute'], Ó: ['O', 'acute'],
        Ú: ['U', 'acute'], Ý: ['Y', 'acute'], Ĺ: ['L', 'acute'], Ŕ: ['R', 'acute'],
        Ô: ['O', 'circ'], Ä: ['A', 'uml'],
    };

    QQ.CELL = 6; // glyph advance in font pixels
    QQ.ROWS = 9; // 2 accent rows + 7 glyph rows
    QQ.LEADING = 11; // font pixels between two lines

    QQ.rect = function (ctx, color, x, y, w, h) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    };

    QQ.textWidth = (text, px = 1) => Math.max(0, [...text].length * QQ.CELL - 1) * px;

    // Draws `text` (upper-cased) with its top (accent row) at y.
    QQ.drawText = function (ctx, text, x, y, px, color, shadowColor = QQ.PAL.shadow) {
        x = Math.round(x);
        y = Math.round(y);
        const sh = Math.max(1, Math.floor(px / 2));
        for (const pass of shadowColor ? [0, 1] : [1]) {
            ctx.fillStyle = pass ? color : shadowColor;
            const d = pass ? 0 : sh;
            let cx = x;
            for (const ch of text.toUpperCase()) {
                let rows = GLYPHS[ch];
                let acc = null;
                if (!rows && SK[ch]) {
                    rows = GLYPHS[SK[ch][0]];
                    acc = ACCENT[SK[ch][1]];
                }
                rows = rows || GLYPHS['?'];
                for (let r = 0; r < 7; r++)
                    for (let c = 0; c < 5; c++)
                        if (rows[r][c] === '1')
                            ctx.fillRect(cx + c * px + d, y + (r + 2) * px + d, px, px);
                if (acc)
                    for (let r = 0; r < 2; r++)
                        for (let c = 0; c < 5; c++)
                            if (acc[r][c] === '1')
                                ctx.fillRect(cx + c * px + d, y + r * px + d, px, px);
                cx += QQ.CELL * px;
            }
        }
    };

    // Splits text into lines of at most `cols` characters; '\n' starts a new paragraph.
    // Lines that start with spaces (formulas) keep them.
    QQ.wrap = function (text, cols) {
        const out = [];
        for (const para of text.split('\n')) {
            const indent = para.match(/^ */)[0];
            const words = para.trim().split(/ +/);
            let line = indent;
            for (const w of words) {
                if (line.trim() && (line + ' ' + w).length > cols) {
                    out.push(line);
                    line = indent + w;
                } else {
                    line = line.trim() ? line + ' ' + w : indent + w;
                }
            }
            out.push(line);
        }
        return out;
    };

    // The qubit icon: a little Bloch sphere with its state arrow, 16 x 16 cells.
    const ICON = [
        '.....YYYYYY.....',
        '...YY......YY...',
        '..Y..........Y..',
        '.Y.........GG.Y.',
        '.Y........WGG.Y.',
        'Y........W.....Y',
        'Y.......W......Y',
        'Y..b.b.Wb.b.b..Y',
        'Yb.....P......bY',
        'Y..bbbbbbbbbb..Y',
        '.Y............Y.',
        '.Y............Y.',
        '..Y..........Y..',
        '...YY......YY...',
        '.....YYYYYY.....',
        '................',
    ];
    const ICON_PAL = {Y: '#fcc030', W: '#f4f0e0', b: '#5c5cfc', G: '#30c030', P: '#f4f0e0'};
    QQ.drawIcon = function (ctx, x, y, f) {
        ICON.forEach((row, r) => {
            for (let c = 0; c < row.length; c++)
                if (row[c] !== '.')
                    QQ.rect(ctx, ICON_PAL[row[c]], x + c * f, y + r * f, f, f);
        });
    };
})();
