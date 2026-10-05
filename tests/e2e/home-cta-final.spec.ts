import { test, expect } from '@playwright/test';

test('o CTA final propõe o próximo passo, não "cadastre-se"', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#contato');
  await expect(secao.getByRole('heading', { level: 2 })).toContainText(
    'Pronto para dar o próximo passo?',
  );
  await expect(secao).toContainText('Vamos entender a realidade da sua organização');
});

test('o WhatsApp é o CTA primário e o formulário o secundário', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#contato');

  const zap = secao.locator('a[href*="554491510045"]');
  await expect(zap).toHaveCount(1);
  await expect(zap).toContainText('Falar com um especialista no WhatsApp');

  await expect(secao.getByRole('link', { name: 'Quero solicitar uma apresentação' })).toHaveAttribute(
    'href',
    '#contato-nome',
  );
});

// A ressalva existe para reduzir o custo percebido de clicar.
test('a ressalva do compromisso aparece', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contato')).toContainText(
    'Sem compromisso. Uma conversa de 20 minutos para entender seu cenário.',
  );
});

test('o formulário tem o título do roteiro', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contato')).toContainText(
    'Quer receber uma apresentação da transforme.tech?',
  );
});
