// Plays every level in a headless Chromium (desktop and phone size), fails on any page
// error, and leaves screenshots in $QQ_SHOTS (default /tmp/qq) to look at.
const {chromium} = require('playwright');
const path = require('path');
const fs = require('fs');

const out = process.env.QQ_SHOTS || '/tmp/qq';
fs.mkdirSync(out, {recursive: true});
const url = 'file://' + path.resolve(__dirname, '..', 'index.html');

(async () => {
    const browser = await chromium.launch();
    let fail = 0;
    for (const [name, opts] of [
        ['desktop', {viewport: {width: 1280, height: 720}}],
        ['phone', {viewport: {width: 412, height: 915}, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true}],
    ]) {
        const page = await browser.newPage(opts);
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => m.type() === 'error' && errors.push(m.text()));
        await page.goto(url);
        const shot = async tag => page.screenshot({path: `${out}/${name}-${tag}.png`});
        await shot('title');
        const levels = await page.evaluate(() => QQ.LEVELS.length);
        for (let i = 0; i < levels; i++) {
            const steps = await page.evaluate(i => {
                QQ.game.startLevel(i);
                QQ.game.draw();
                return QQ.LEVELS[i].steps.length;
            }, i);
            for (let s = 0; s < steps; s++) {
                const type = await page.evaluate(() => {
                    const g = QQ.game.G;
                    return QQ.LEVELS[g.level].steps[g.step].type;
                });
                const tag = `L${String(i + 1).padStart(2, '0')}-${s + 1}-${type}`;
                if (type === 'text') {
                    await shot(tag);
                    const pages = await page.evaluate(() => QQ.game.G.pages);
                    for (let p = 1; p < pages; p++) {
                        await page.evaluate(() => { QQ.game.next(); QQ.game.draw(); });
                        await shot(`${tag}-p${p + 1}`);
                    }
                } else if (type === 'quiz') {
                    await page.evaluate(() => {
                        const g = QQ.game.G, S = QQ.LEVELS[g.level].steps[g.step];
                        QQ.game.answer((S.answer + 1) % S.options.length);
                        QQ.game.draw();
                    });
                    await shot(tag + '-wrong');
                    await page.evaluate(() => {
                        const g = QQ.game.G, S = QQ.LEVELS[g.level].steps[g.step];
                        QQ.game.answer(S.answer);
                        QQ.game.draw();
                    });
                    await shot(tag);
                } else {
                    await page.evaluate(() => QQ.game.draw());
                    await shot(tag + '-start');
                    // play the reference solution by keyboard / taps, like a player
                    const sol = await page.evaluate(() => {
                        const g = QQ.game.G;
                        return QQ.LEVELS[g.level].steps[g.step].solution;
                    });
                    for (const op of sol)
                        await page.evaluate(op => {
                            const st = QQ.game.G.ss[QQ.game.G.step];
                            st.sel = op[0] === 'CX' ? op[1] : op[0].length === 1 && op[0] !== 'F' ? op[1] : st.sel;
                            QQ.game.place(op[0]);
                            QQ.game.draw();
                        }, op);
                    const solved = await page.evaluate(() => !!QQ.game.G.ss[QQ.game.G.step].solved);
                    if (!solved) {
                        console.log(`${name} ${tag}: the solution did not solve it`);
                        fail = 1;
                    }
                    await shot(tag);
                }
                await page.evaluate(() => { QQ.game.next(); QQ.game.draw(); });
            }
            const screen = await page.evaluate(() => QQ.game.G.screen);
            if (screen !== 'done') {
                console.log(`${name} level ${i + 1}: did not finish (${screen})`);
                fail = 1;
            }
            if (i === 0 || i === levels - 1)
                await shot(`L${String(i + 1).padStart(2, '0')}-done`);
        }
        await page.evaluate(() => { QQ.game.G.screen = 'map'; QQ.game.draw(); });
        await shot('map');
        if (errors.length) {
            console.log(name, 'page errors:', errors);
            fail = 1;
        }
        await page.close();
    }
    await browser.close();
    console.log(fail ? 'shots: FAILED' : `shots: all passed, screenshots in ${out}`);
    process.exit(fail);
})();
