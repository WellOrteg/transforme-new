import { test, expect } from '@playwright/test';

const AREAS = [
  'Captação e Doações',
  'Gestão Financeira',
  'Relacionamento e CRM',
  'Gestão de Impacto',
  'Eventos',
];

test('as cinco áreas do roteiro aparecem, na ordem', async ({ page }) => {
  await page.goto('/');
  const titulos = page.locator('#solucoes article h3');
  await expect(titulos).toHaveCount(5);
  await expect(titulos).toHaveText(AREAS);
});

test('cada área lista suas capacidades e termina com um resultado', async ({ page }) => {
  await page.goto('/');
  const artigos = page.locator('#solucoes article');

  for (let i = 0; i < AREAS.length; i++) {
    const area = artigos.nth(i);
    expect(await area.locator('li').count()).toBeGreaterThan(3);
    await expect(area).toContainText('Resultado:');
  }

  // Nenhuma capacidade some no reagrupamento — estas são as que o §6 nomeia e
  // que o site atual não pode deixar de mencionar.
  const secao = page.locator('#solucoes');
  for (const item of ['PIX', 'Recorrência', 'Portal do Doador', 'Fluxo de caixa', 'WhatsApp', 'Check-in']) {
    await expect(secao).toContainText(item);
  }
});

test('a âncora do menu chega nas soluções', async ({ page }) => {
  await page.goto('/');
  // O hero não tem mais link para cá — desde 08/09/2026 a única âncora para as
  // soluções é a do menu.
  await page
    .locator('header nav[aria-label="Principal"]')
    .getByRole('link', { name: 'Soluções' })
    .click();
  await expect(page.locator('#solucoes')).toBeInViewport();
});

// Os títulos das áreas usam SVG, não emoji: emoji renderiza diferente em cada
// sistema e não aceita a cor de acento.
test('os ícones das áreas são SVG', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#solucoes article svg')).toHaveCount(5);
});
