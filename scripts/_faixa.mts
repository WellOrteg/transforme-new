import { chromium } from '@playwright/test';
const nav = await chromium.launch();
const p = await nav.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelector('[data-fita-janela]')!.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(600);
const c = (await p.locator('[data-fita-janela]').boundingBox())!;
await p.screenshot({ path: process.argv[2] + '/faixa.png', clip: { x: 0, y: c.y - 90, width: 1440, height: c.height + 180 } });
await nav.close();
