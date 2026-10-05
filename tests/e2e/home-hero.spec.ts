import { test, expect } from '@playwright/test';

test('o hero traz o posicionamento novo como h1', async ({ page }) => {
  await page.goto('/');
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toContainText('+ de 10 anos potencializando');
  await expect(h1).toContainText('através da tecnologia');
});

// O §2 desenha o WhatsApp como CTA principal. Em 08/09/2026 o dono tirou do
// hero o link secundário "Conhecer a transforme.tech" — a contagem abaixo
// guarda essa decisão: o hero oferece uma saída só.
test('o CTA do hero é o WhatsApp, e é o único link da faixa', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('main section').first();

  const zap = hero.locator('a[href*="554491510045"]');
  await expect(zap).toHaveCount(1);
  await expect(zap).toHaveAttribute('href', /Conheci%20a%20transforme\.tech%20pelo%20site/);

  await expect(hero.locator('a')).toHaveCount(1);
});

test('o hero é uma faixa escura', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('[data-tema="escuro"]').first();
  await expect(secao).toBeVisible();
});

test('o título usa a fonte display em peso Regular', async ({ page }) => {
  await page.goto('/');
  const peso = await page
    .getByRole('heading', { level: 1 })
    .evaluate((el) => getComputedStyle(el).fontWeight);
  expect(peso).toBe('400');
});

// A linha abaixo do título é a promessa do produto — o que a pessoa leva. O
// tempo de estrada, que antes vinha num parágrafo próprio, agora está no h1.
test('o hero diz o que a plataforma resolve, em uma linha', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('main section').first();
  await expect(hero).toContainText('Organize sua gestão');
  await expect(hero).toContainText('em um só lugar');
});
