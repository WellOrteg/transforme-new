import { test, expect } from '@playwright/test';

// O §4 é onde o site passa a vender o problema, não o software. Ele precisa vir
// depois da prova social e antes de "para quem".
test('a seção da dor nomeia o problema antes de oferecer a solução', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#dor');
  await expect(secao.getByRole('heading', { level: 2 })).toContainText(
    'Sua organização passa por isso?',
  );

  // As cinco dores que o dono escreveu em 09/09/2026. São a seção inteira: se
  // uma sumir, a pergunta do título fica sem o que responder.
  for (const dor of [
    'Uma infinidade de planilhas espalhadas?',
    'Vários sistemas separados e não integrados?',
    'Processos manuais e trabalhosos em sua gestão financeira?',
    'Perde doadores mês a mês pela falta de comunicação com eles?',
    'Não conseguem saber o impacto socioambiental gerado pelo trabalho que realizam?',
  ]) {
    await expect(secao.getByText(dor)).toBeVisible();
  }

  await expect(secao).toContainText('reúne em um único ecossistema');
});

test('a dor vem depois da prova social e antes do "para quem"', async ({ page }) => {
  await page.goto('/');
  const ordem = await page
    .locator('main section[id]')
    .evaluateAll((secoes) => secoes.map((s) => s.id));
  expect(ordem.indexOf('dor')).toBeGreaterThan(ordem.indexOf('prova-social'));
  expect(ordem.indexOf('dor')).toBeLessThan(ordem.indexOf('para-quem'));
});
