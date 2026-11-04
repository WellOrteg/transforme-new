import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const rota of ['/sistema-gestao-ongs/', '/doacoes-online/', '/gestao-organizacoes-missionarias/']) {
  test(`${rota} tem conteúdo, navegação e dados estruturados sem JavaScript`, async ({ browser }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
    const page = await contexto.newPage();
    await page.goto(rota);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('head title')).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', `https://transforme.tech${rota}`);
    await expect(page.getByRole('link', { name: 'Falar com um especialista', exact: true }).last()).toHaveAttribute('href', /wa\.me/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const dados = await page.locator('script[type="application/ld+json"]').allTextContents();
    const grafos = dados.flatMap((d) => JSON.parse(d)['@graph'] ?? [JSON.parse(d)]);
    for (const pergunta of grafos.find((d) => d['@type'] === 'FAQPage').mainEntity) {
      await expect(page.getByRole('heading', { name: pergunta.name, exact: true })).toBeVisible();
      await expect(page.locator('main')).toContainText(pergunta.acceptedAnswer.text);
    }
    await page.screenshot({ path: `artifacts/seo/${rota.replaceAll('/', '')}-mobile.png`, fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: `artifacts/seo/${rota.replaceAll('/', '')}-desktop.png`, fullPage: true });
    await contexto.close();
  });
  test(`${rota} passa na auditoria de acessibilidade`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(rota);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  });
}
