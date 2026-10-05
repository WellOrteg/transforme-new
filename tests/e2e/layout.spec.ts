import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('a página declara português do Brasil', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test('o cabeçalho tem os seis links de navegação', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Principal' });
  for (const rotulo of ['Soluções', 'Para quem', 'Como funciona', 'Clientes', 'Dúvidas comuns', 'Conteúdos']) {
    await expect(nav.getByRole('link', { name: rotulo })).toBeVisible();
  }
});

test('a navegação funciona só pelo teclado, com foco visível', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focado = page.locator(':focus');
  await expect(focado).toBeVisible();
  const contorno = await focado.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(contorno).not.toBe('none');
});

test('o rodapé leva às páginas institucionais fora do menu', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Institucional' });
  for (const destino of ['/suporte/', '/termo-de-adesao/', '/recursos-plataforma/', '/politica-de-privacidade/']) {
    await expect(nav.locator(`a[href="${destino}"]`)).toHaveCount(1);
  }
});

test('a página 404 existe e oferece caminho de volta', async ({ page }) => {
  await page.goto('/rota-que-nao-existe/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('não');
  await expect(page.getByRole('link', { name: /início|home/i })).toBeVisible();
});

test('nenhuma violação de acessibilidade na home', async ({ page }) => {
  await page.goto('/');
  // O axe avalia a página em repouso: no meio de um fade ele mede a cor
  // composta, não a cor final, e acusa contraste que não existe depois de a
  // animação terminar. prefers-reduced-motion entrega o estado final de cara.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(r.violations).toEqual([]);
});
