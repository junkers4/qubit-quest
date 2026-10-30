// REQ-040..REQ-045 (and the on-screen half of REQ-011): plays every level in headless
// Chromium at four screen sizes, opens every helper window, fails on page errors, on any
// network request, on content running into the footer, and leaves screenshots in
// $QQ_SHOTS (default /tmp/qq) to look at.
const {chromium} = require('playwright');
const path = require('path');
const fs = require('fs');

const out = process.env.QQ_SHOTS || '/tmp/qq';
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out, {recursive: true});
const url = 'file://' + path.resolve(__dirname, '..', 'index.html');

const SIZES = [ // [name, options, take screenshots]
    ['desktop', {viewport: {width: 1280, height: 720}}, true],
    ['small', {viewport: {width: 960, height: 600}}, false],          // the smallest landscape: 320 x 200
    ['phone', {viewport: {width: 412, height: 915}, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true}, true],
    ['narrow', {viewport: {width: 320, height: 640}, deviceScaleFactor: 1.6, isMobile: true, hasTouch: true}, false], // 256 wide
];

let fail = 0;
const problem = msg => {
    console.log('FAIL ' + msg);
    fail = 1;
};

async function playAll(page, name, shots) {
    const shot = async tag => shots && page.screenshot({path: `${out}/${name}-${tag}.png`});
    const G = () => page.evaluate(() => {
        const g = QQ.game.G;
        return {screen: g.screen, level: g.level, step: g.step, pages: g.pages, overflow: g.overflow,
            overlay: g.overlay && {title: g.overlay.title, pages: g.overlay.pages}};
    });
    const levels = await page.evaluate(() => QQ.LEVELS.length);
    for (let i = 0; i < levels; i++) {
        const lv = 'L' + String(i + 1).padStart(2, '0');
        const steps = await page.evaluate(i => {
            QQ.game.startLevel(i);
            QQ.game.draw();
            return QQ.LEVELS[i].steps.length;
        }, i);
        for (let s = 0; s < steps; s++) {
            const type = await page.evaluate(() => QQ.LEVELS[QQ.game.G.level].steps[QQ.game.G.step].type);
            const tag = `${lv}-${s + 1}-${type}`;
            // REQ-041: the three helpers open on every step, show something, and close
            for (const open of ['openEli5', 'openCode', 'openRefs']) {
                const o = await page.evaluate(open => {
                    QQ.game[open]();
                    QQ.game.draw();
                    const ov = QQ.game.G.overlay;
                    return ov && {title: ov.title, pages: ov.pages};
                }, open);
                if (!o || !o.pages)
                    problem(`${name} ${tag}: ${open} shows nothing`);
                if (s === 0 && shots && (i % 6 === 0 || open === 'openCode' && i % 6 === 3))
                    await shot(`${lv}-${open.slice(4).toLowerCase()}`);
                await page.keyboard.press('Escape');
                if ((await G()).overlay)
                    problem(`${name} ${tag}: ${open} does not close`);
            }
            if (type === 'text') {
                await shot(tag);
                const pages = (await G()).pages;
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
                // the hint shows under the palette or in a window, never into the footer
                const hinted = await page.evaluate(() => {
                    QQ.game.hint();
                    QQ.game.draw();
                    const g = QQ.game.G, where = g.overlay ? 'window' : g.info ? 'inline' : null;
                    g.overlay = null;
                    return where;
                });
                if (!hinted)
                    problem(`${name} ${tag}: the hint shows nowhere`);
                await page.evaluate(() => { QQ.game.G.info = ''; QQ.game.draw(); });
                // play the reference solution the way a player taps it: wire, gate, more wires
                const solved = await page.evaluate(() => {
                    const g = QQ.game.G, S = QQ.LEVELS[g.level].steps[g.step];
                    for (const op of S.solution) {
                        const [name, ...wires] = op;
                        if (QQ.isBox(name, S.boxes)) {
                            QQ.game.place(name);
                            continue;
                        }
                        QQ.game.wire(wires[0]);
                        QQ.game.place(name);
                        if (S.qubits === 3 && wires.length > 1)
                            QQ.game.wire(wires[1]);
                        QQ.game.draw();
                    }
                    QQ.game.draw();
                    return !!g.ss[g.step].solved;
                });
                if (!solved)
                    problem(`${name} ${tag}: playing the solution did not solve it`);
                await shot(tag);
            }
            const st = await G();
            if (st.overflow)
                problem(`${name}: content runs into the footer: ${st.overflow}`);
            await page.evaluate(() => { QQ.game.G.overflow = null; QQ.game.next(); QQ.game.draw(); });
        }
        const st = await G();
        if (st.screen !== 'done')
            problem(`${name} level ${i + 1}: did not finish (${st.screen})`);
        if (i === 0 || i === levels - 1)
            await shot(`${lv}-done`);
    }
}

(async () => {
    const browser = await chromium.launch();
    for (const [name, opts, shots] of SIZES) {
        const context = await browser.newContext(opts);
        const page = await context.newPage();
        const errors = [], requests = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => m.type() === 'error' && errors.push(m.text()));
        // REQ-044: everything comes from the page's own files, nothing from the network
        await context.route('**/*', route => {
            const u = route.request().url();
            if (u.startsWith('file://') || u.startsWith('data:'))
                return route.continue();
            requests.push(u);
            return route.abort();
        });
        await page.goto(url);
        const shot = async tag => shots && page.screenshot({path: `${out}/${name}-${tag}.png`});
        await shot('title');

        // REQ-043: the pixel look: whole-number scaling, no smoothing, the red frame
        const look = await page.evaluate(() => {
            const cv = document.getElementById('screen');
            const scale = cv.getBoundingClientRect().width * devicePixelRatio / cv.width;
            const px = cv.getContext('2d').getImageData(2, Math.floor(cv.height / 2), 1, 1).data;
            return {scale, rendering: getComputedStyle(cv).imageRendering, frame: [...px.slice(0, 3)], w: cv.width, h: cv.height};
        });
        if (Math.abs(look.scale - Math.round(look.scale)) > 0.01 || look.rendering !== 'pixelated')
            problem(`${name}: canvas scaled by ${look.scale} with ${look.rendering}`);
        if (look.frame.join() !== '176,24,24')
            problem(`${name}: the frame is ${look.frame}, not #B01818`);
        console.log(`${name}: game screen ${look.w} x ${look.h}, scale ${look.scale.toFixed(2)}`);

        // REQ-042: the title menu's reference windows
        for (const open of ['openBook', 'openGlossary', 'openLibrary']) {
            const pages = await page.evaluate(open => {
                QQ.game[open]();
                QQ.game.draw();
                return QQ.game.G.overlay.pages;
            }, open);
            if (!pages)
                problem(`${name}: ${open} is empty`);
            await shot(open.slice(4).toLowerCase());
            await page.keyboard.press('Escape');
        }

        await playAll(page, name, shots);

        // REQ-045: progress is kept in the browser and survives a reload
        const done = await page.evaluate(() => Object.keys(QQ.game.progress()).length);
        await page.reload();
        const kept = await page.evaluate(() => Object.keys(QQ.game.progress()).length);
        const levels = await page.evaluate(() => QQ.LEVELS.length);
        if (done !== levels || kept !== levels)
            problem(`${name}: progress ${done} levels, after reload ${kept}, of ${levels}`);
        const mapPages = await page.evaluate(() => { QQ.game.G.screen = 'map'; QQ.game.draw(); return QQ.game.G.mapPage + 1; });
        await shot('map');
        if (!mapPages)
            problem(`${name}: no map`);
        if (errors.length)
            problem(`${name}: page errors: ${errors.join(' | ')}`);
        if (requests.length)
            problem(`${name}: network requests: ${requests.join(' ')}`);
        await context.close();
    }
    await browser.close();
    console.log(fail ? 'shots: FAILED' : `shots: all passed, screenshots in ${out}`);
    process.exit(fail);
})();
