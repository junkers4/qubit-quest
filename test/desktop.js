// REQ-060, REQ-062: the desktop app. Builds it, runs it with -serve, and plays the game from
// it in headless Chromium: the page runs under the app's content security policy with the
// WebAssembly core, makes no request outside the app, says it is alive, a level plays, and
// progress survives a reload. Needs Go.
const {chromium} = require('playwright');
const {execFileSync, spawn} = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const root = path.resolve(__dirname, '..');
const bin = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'qq-desktop-')), 'qubit-quest');
execFileSync('go', ['build', '-o', bin, './desktop'], {cwd: root, stdio: 'inherit'});

let fail = 0;
const problem = msg => {
    console.log('FAIL ' + msg);
    fail = 1;
};

(async () => {
    const app = spawn(bin, ['-serve']);
    const url = await new Promise((resolve, reject) => {
        app.stdout.once('data', d => resolve(String(d).trim()));
        app.once('exit', code => reject(new Error('the app quit: ' + code)));
    });
    const origin = new URL(url).origin;
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({viewport: {width: 1280, height: 720}});
        const seen = [];
        page.on('pageerror', e => problem('page error: ' + e.message));
        page.on('console', m => m.type() === 'error' && problem('console: ' + m.text()));
        page.on('request', r => {
            seen.push(r.url());
            if (!r.url().startsWith(origin + '/'))
                problem('request outside the app: ' + r.url());
        });
        await page.goto(url);
        await page.waitForFunction(() => window.QQ && QQ.game && QQ.game.G.screen === 'title');
        const engine = await page.evaluate(() => QQ.engine);
        if (engine !== 'webassembly')
            problem('engine is ' + engine);
        if (!seen.some(u => u.includes('/qq-alive?page=')))
            problem('the page did not say it is alive');

        // play the Bell-state level by its solution and keep the stars
        const stars = await page.evaluate(() => {
            const i = QQ.LEVELS.findIndex(L => L.id === 'bell');
            QQ.game.startLevel(i);
            const L = QQ.LEVELS[i];
            const g = QQ.game.G;
            for (let guard = 0; g.screen === 'level' && guard < 200; guard++) {
                QQ.game.draw();
                const S = L.steps[g.step];
                if (S.type === 'quiz')
                    QQ.game.answer(S.answer);
                else if (S.type === 'circuit' && !g.ss[g.step].solved)
                    for (const [name, ...wires] of S.solution) {
                        if (!QQ.isBox(name, S.boxes))
                            QQ.game.wire(wires[0]);
                        QQ.game.place(name);
                        if (S.qubits === 3 && wires.length > 1)
                            QQ.game.wire(wires[1]);
                    }
                QQ.game.next();
            }
            if (g.screen !== 'done') return 'screen ' + g.screen + ' step ' + g.step;
            return JSON.parse(localStorage.getItem('qubitquest.progress') || '{}').bell;
        });
        if (typeof stars !== 'number' || stars < 1)
            problem('no stars after the level: ' + stars);
        await page.reload();
        await page.waitForFunction(() => window.QQ && QQ.game);
        const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('qubitquest.progress') || '{}').bell);
        if (kept !== stars)
            problem('progress lost on reload');
        await page.screenshot({path: path.join(os.tmpdir(), 'qq-desktop.png')});
    } finally {
        await browser.close();
        app.kill();
    }
    console.log(fail ? 'desktop: FAILED' : 'desktop: ok');
    process.exit(fail);
})().catch(e => {
    console.log('FAIL ' + e.stack);
    process.exit(1);
});
