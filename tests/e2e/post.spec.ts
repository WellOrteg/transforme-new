import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const POST = '/blog/diga-nao-ao-pix/';

test('o cabeçalho do post é escuro e o corpo é claro', async ({ page }) => {
  await page.goto(POST);
  await expect(page.locator('main [data-tema="escuro"]')).toHaveCount(1);
  await expect(page.locator('article.prose')).toBeVisible();
});

test('mostra categoria, autor, data e tempo de leitura', async ({ page }) => {
  await page.goto(POST);
  const cabecalho = page.locator('main [data-tema="escuro"]');
  // diga-nao-ao-pix.md é categoria "Tecnologia" e autor "transforme" (dados reais migrados do WordPress na Task 10).
  await expect(cabecalho).toContainText('Tecnologia');
  await expect(cabecalho).toContainText('transforme');
  await expect(cabecalho.locator('time')).toBeVisible();
  await expect(cabecalho).toContainText(/min de leitura/);
});

test('o sumário lista os h2 do artigo e leva até eles', async ({ page }) => {
  await page.goto(POST);
  const itens = page.locator('[data-sumario] a');
  expect(await itens.count()).toBeGreaterThan(0);
  const href = await itens.first().getAttribute('href');
  expect(href).toMatch(/^#/);
  await expect(page.locator(href!)).toBeAttached();
});

test('a barra de progresso avança ao rolar', async ({ page }) => {
  await page.goto(POST);
  const barra = page.locator('[data-progresso] > i');
  const antes = await barra.evaluate((el) => el.getBoundingClientRect().width);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(200);
  const depois = await barra.evaluate((el) => el.getBoundingClientRect().width);
  expect(depois).toBeGreaterThan(antes);
});

test('sem JavaScript o artigo continua legível', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(POST);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('article.prose p').first()).toBeVisible();
  await ctx.close();
});

test('publica dados estruturados BlogPosting', async ({ page }) => {
  await page.goto(POST);
  const blocos = await page.locator('script[type="application/ld+json"]').allTextContents();
  const artigo = blocos.map((t) => JSON.parse(t)).find((o) => o['@type'] === 'BlogPosting');
  expect(artigo.headline).toBeTruthy();
  expect(artigo.datePublished).toBeTruthy();
});

test('a página de post passa no axe', async ({ page }) => {
  // O axe avalia a página em repouso: no meio de um fade ele mede a cor
  // composta, não a cor final, e acusa contraste que não existe depois de a
  // animação terminar. prefers-reduced-motion entrega o estado final de cara.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(POST);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(r.violations).toEqual([]);
});
