import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGINAS = ['/suporte/', '/termo-de-adesao/', '/recursos-plataforma/', '/politica-de-privacidade/'];

for (const rota of PAGINAS) {
  test(`${rota} responde e tem h1 único`, async ({ page }) => {
    const resposta = await page.goto(rota);
    expect(resposta?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test(`${rota} passa no axe`, async ({ page }) => {
    await page.goto(rota);
    // O axe avalia a página em repouso: no meio de um fade ele mede a cor
    // composta, não a cor final, e acusa contraste que não existe depois de a
    // animação terminar. prefers-reduced-motion entrega o estado final de cara.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(r.violations).toEqual([]);
  });
}

test('nenhuma institucional aparece no menu principal', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Principal' });
  for (const rota of PAGINAS) {
    await expect(nav.locator(`a[href="${rota}"]`)).toHaveCount(0);
  }
});

test('suporte traz os três canais, com o WhatsApp de suporte', async ({ page }) => {
  await page.goto('/suporte/');
  await expect(page.locator('main a[href*="554491510045"]')).toHaveCount(1);
  await expect(page.locator('main a[href*="youtube.com"]')).toHaveCount(1);
  await expect(page.locator('a[href*="atendimento.transforme.solutions"]')).toHaveCount(1);
});

test('suporte usa o WhatsApp padronizado', async ({ page }) => {
  await page.goto('/suporte/');
  await expect(page.locator('main a[href*="554491510045"]')).toHaveCount(1);
});

test('recursos-plataforma tem sumário, por ser texto longo', async ({ page }) => {
  await page.goto('/recursos-plataforma/');
  await expect(page.locator('[data-sumario]')).toBeVisible();
});
