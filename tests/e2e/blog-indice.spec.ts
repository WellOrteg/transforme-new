import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('lista os 14 posts', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.locator('article[data-post]')).toHaveCount(14);
});

test('o cabeçalho do blog é escuro e compacto', async ({ page }) => {
  await page.goto('/blog/');
  const cabecalho = page.locator('main [data-tema="escuro"]').first();
  await expect(cabecalho.getByRole('heading', { level: 1 })).toContainText('Conteúdos');
});

test('o filtro tem as quatro categorias mais "Todos"', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.locator('[data-filtro] button, [data-filtro] a')).toHaveCount(5);
});

test('filtrar por categoria reduz a lista', async ({ page }) => {
  await page.goto('/blog/');
  await page.getByRole('button', { name: 'Pessoas' }).click();
  const visiveis = page.locator('article[data-post]:visible');
  expect(await visiveis.count()).toBeLessThan(14);
  for (const cat of await visiveis.evaluateAll((els) => els.map((e) => e.getAttribute('data-categoria')))) {
    expect(cat).toBe('Pessoas');
  }
});

test('sem JavaScript, todos os posts continuam visíveis', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/blog/');
  await expect(page.locator('article[data-post]')).toHaveCount(14);
  await ctx.close();
});

test('o índice do blog passa no axe', async ({ page }) => {
  // O axe avalia a página em repouso: no meio de um fade ele mede a cor
  // composta, não a cor final, e acusa contraste que não existe depois de a
  // animação terminar. prefers-reduced-motion entrega o estado final de cara.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/blog/');
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(r.violations).toEqual([]);
});
