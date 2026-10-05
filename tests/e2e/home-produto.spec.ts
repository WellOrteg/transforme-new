import { test, expect } from '@playwright/test';

test('a seção do produto mantém a promessa do painel único', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#produto');
  await expect(secao.getByRole('heading', { level: 2 })).toContainText('Tudo num painel só.');
  await expect(secao).toContainText(
    'Captação, doadores, financeiro e impacto em tempo real — sem planilhas paralelas e sem retrabalho.',
  );
});

test('a galeria oferece as cinco telas do roteiro', async ({ page }) => {
  await page.goto('/');
  const abas = page.locator('#produto [data-galeria] label');
  await expect(abas).toHaveText(['Dashboard', 'Doações', 'Financeiro', 'CRM', 'Impacto']);
});

// A galeria é CSS puro por causa do orçamento de 20 KB de JavaScript da home.
test('trocar de tela funciona sem JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');

  await expect(page.locator('#produto [data-painel="dashboard"]')).toBeVisible();
  await expect(page.locator('#produto [data-painel="financeiro"]')).toBeHidden();

  await page.locator('#produto [data-galeria] label', { hasText: 'Financeiro' }).click();

  await expect(page.locator('#produto [data-painel="financeiro"]')).toBeVisible();
  await expect(page.locator('#produto [data-painel="dashboard"]')).toBeHidden();
  await ctx.close();
});

test('as telas fornecidas aparecem como capturas reais', async ({ page }) => {
  await page.goto('/');

  for (const tela of ['Doações', 'Financeiro', 'CRM', 'Impacto']) {
    await page.locator('#produto [data-galeria] label', { hasText: tela }).click();
    const painel = page.locator(`#produto [data-painel="${tela === 'Doações' ? 'doacoes' : tela.toLowerCase()}"]`);
    await expect(painel.locator('img')).toHaveCount(1);
    await expect(painel).not.toContainText('Captura de tela ainda não fornecida');
  }
});

// O spec (§8) promete abas "navegáveis por teclado e com foco visível" — é
// essa promessa que justifica ter escolhido radio em vez de JavaScript para a
// galeria. O anel de foco é escrito à mão como cinco seletores irmãos em
// GaleriaTelas.astro; um refactor de markup pode quebrar só o anel, em
// silêncio, sem quebrar a troca de tela — por isso os dois são checados aqui.
test('as abas da galeria são navegáveis por teclado, trocam de tela pelas setas e mostram foco visível', async ({
  page,
}) => {
  await page.goto('/');

  // Chega ao grupo de rádios só de Tab — sem contar quantos Tabs seriam
  // necessários, o que quebraria a cada elemento focável novo antes da
  // galeria. Radios do mesmo `name` só param no que está marcado (o
  // Dashboard, o primeiro), então o alvo é sempre esse id.
  let id: string | null = null;
  for (let i = 0; i < 100 && id !== 'tela-dashboard'; i++) {
    await page.keyboard.press('Tab');
    id = await page.evaluate(() => document.activeElement?.id ?? null);
  }
  expect(id).toBe('tela-dashboard');

  // Uma seta troca a tela: os rádios do mesmo `name` formam um grupo nativo.
  await page.keyboard.press('ArrowRight');

  await expect(page.locator('#produto [data-painel="doacoes"]')).toBeVisible();
  await expect(page.locator('#produto [data-painel="dashboard"]')).toBeHidden();

  // O radio fica fora da tela (sr-only); quem navega por teclado precisa ver
  // o anel de foco no RÓTULO da aba ativa, não no próprio radio.
  const rotulo = page.locator('#produto [data-galeria] label[for="tela-doacoes"]');
  const contorno = await rotulo.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(contorno).not.toBe('none');
});

test('a home continua com exatamente duas faixas escuras', async ({ page }) => {
  await page.goto('/');
  const escuras = page.locator('main [data-tema="escuro"]');
  await expect(escuras).toHaveCount(2);
  await expect(escuras.nth(1)).toContainText('painel');
});
