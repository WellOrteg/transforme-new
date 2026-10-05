import { test, expect } from '@playwright/test';

test('a faixa de logos afirma confiança, com o número do roteiro', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#prova-social');
  await expect(secao).toContainText('+200 organizações já confiam na transforme.tech');
  await expect(secao).toContainText(
    'OSCs, fundações, associações, acampamentos, igrejas, agências missionárias e muito mais…',
  );
});

test('os nove logos aparecem, e a cópia da fita é ignorada por leitores de tela', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#prova-social [data-fita] > ul').first().locator('img')).toHaveCount(9);
  await expect(page.locator('#prova-social [data-fita] ul[aria-hidden="true"]')).toHaveCount(1);
});

// Não inventamos nome de cliente: só três logos têm nome recuperável da fonte.
test('os logos sem nome conhecido usam alt genérico', async ({ page }) => {
  await page.goto('/');
  const alts = await page
    .locator('#prova-social [data-fita] > ul')
    .first()
    .locator('img')
    .evaluateAll((imgs) => imgs.map((i) => i.getAttribute('alt')));
  expect(alts.filter((a) => a === 'Logo de organização parceira')).toHaveLength(6);
});
