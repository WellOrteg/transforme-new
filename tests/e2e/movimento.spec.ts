import { test, expect } from '@playwright/test';

/** Rola a página inteira em passos, como quem lê, e devolve o CLS acumulado. */
async function clsAoRolar(page: import('@playwright/test').Page): Promise<number> {
  await page.evaluate(() => {
    (window as any).__cls = 0;
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  const altura = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < altura; y += 600) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(400);
  return page.evaluate(() => (window as any).__cls as number);
}

test('a sequência de entrada do hero termina com tudo visível', async ({ page }) => {
  await page.goto('/');
  const alvos = page.locator('[data-entra]');
  expect(await alvos.count()).toBeGreaterThan(2);
  await page.waitForTimeout(1600);
  const opacidades = await alvos.evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
  for (const o of opacidades) expect(Number(o)).toBe(1);
});

test('o que é revelado por rolagem termina visível', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(900);
  const escondidos = await page
    .locator('[data-revela]')
    .evaluateAll((els) => els.filter((e) => Number(getComputedStyle(e).opacity) < 1).length);
  expect(escondidos).toBe(0);
});

test('com prefers-reduced-motion nada depende de animação para aparecer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const invisiveis = await page
    .locator('[data-entra], [data-revela], [data-revela-grupo] > *')
    .evaluateAll((els) => els.filter((e) => Number(getComputedStyle(e).opacity) < 1).length);
  expect(invisiveis).toBe(0);
});

test('a fita de logos não se move com prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const nome = await page.locator('[data-fita]').evaluate((el) => getComputedStyle(el).animationName);
  expect(nome).toBe('none');
});

// A fita nunca fica parada, então as checagens de estabilidade do Playwright
// nunca terminariam: rolagem e ponteiro são comandados na mão.
test('a fita de logos se move e pausa sob o ponteiro', async ({ page }) => {
  await page.goto('/');
  const fita = page.locator('[data-fita]');
  await page.evaluate(() => document.querySelector('[data-fita]')!.scrollIntoView({ block: 'center' }));
  expect(await fita.evaluate((el) => getComputedStyle(el).animationName)).not.toBe('none');

  // O ponteiro mira a janela, não a fita: a fita transborda de propósito para os
  // dois lados e o centro da caixa dela cai fora da tela.
  const caixa = (await page.locator('[data-fita-janela]').boundingBox())!;
  await page.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
  await expect
    .poll(() => fita.evaluate((el) => getComputedStyle(el).animationPlayState))
    .toBe('paused');
});

test('a duplicata da fita é ignorada por leitores de tela', async ({ page }) => {
  await page.goto('/');
  const nomes = await page.locator('[data-fita] [aria-hidden="true"]').count();
  expect(nomes).toBeGreaterThan(0);
});

test('rolar a home inteira não desloca o layout', async ({ page }) => {
  await page.goto('/');
  expect(await clsAoRolar(page)).toBeLessThan(0.02);
});

test('sem JavaScript a home continua inteira e visível', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Dúvidas comuns/i })).toBeVisible();
  const invisiveis = await page
    .locator('[data-revela]')
    .evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height === 0).length);
  expect(invisiveis).toBe(0);
  await ctx.close();
});

test('o cabeçalho se separa da página ao rolar, sem JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  const fio = (el: Element) => Number(getComputedStyle(el, '::after').opacity);
  const cabecalho = page.locator('header');
  expect(await cabecalho.evaluate(fio)).toBeLessThan(0.1);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  expect(await cabecalho.evaluate(fio)).toBeGreaterThan(0.9);
  await ctx.close();
});

test('o cabeçalho acompanha a rolagem', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(200);
  const caixa = await page.locator('header').boundingBox();
  expect(caixa!.y).toBeLessThan(4);
});

test('a barra de progresso acompanha a rolagem em escala, não em largura', async ({ page }) => {
  await page.goto('/blog/diga-nao-ao-pix/');
  const barra = page.locator('[data-progresso] > i');
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2));
  await page.waitForTimeout(200);
  const { largura, janela } = await barra.evaluate((el) => ({
    largura: el.getBoundingClientRect().width,
    janela: window.innerWidth,
  }));
  // Metade do artigo: a barra cobre perto de metade da janela. O bug que isto
  // pega é o antigo desenho por largura sobrevivendo junto com o scaleX, que
  // daria 25% em vez de 50%.
  expect(largura / janela).toBeGreaterThan(0.4);
  expect(largura / janela).toBeLessThan(0.6);
});
