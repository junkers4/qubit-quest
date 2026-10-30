// Loads the game's data scripts in the order index.html lists them (all but game.js,
// which needs a browser), so the tests see exactly what the page sees.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts)
    if (!src.endsWith('game.js'))
        require(path.join(root, src));

module.exports = globalThis.QQ;
module.exports.scripts = scripts;
module.exports.root = root;
