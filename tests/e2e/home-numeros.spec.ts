import { test, expect } from '@playwright/test';

// Os quatro números fechados pelo dono em 09/09/2026 — os três do §10 do roteiro
// mais os atendimentos registrados. O teste fixa os valores exatos porque são
// afirmação factual sobre o negócio, não escolha de redação.
test('os quatro números do negócio aparecem com seus rótulos', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#numeros');

  const esperado: [string, string][] = [
    ['+200', 'organizações ativas'],
    ['+ de R$ 50 milhões', 'em doações por ano'],
    ['+109%', 'de crescimento anual em doações recorrentes'],
    ['+ 2 milhões', 'de atendimentos registrados'],
  ];

  for (const [valor, rotulo] of esperado) {
    await expect(secao).toContainText(valor);
    await expect(secao).toContainText(rotulo);
  }
});

// A home não pode afirmar dois tamanhos de base ao mesmo tempo: a faixa de
// logos repete o número da seção de números.
test('a faixa de logos afirma o mesmo número da seção de números', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#prova-social')).toContainText('+200 organizações');
  await expect(page.locator('main')).not.toContainText('+100');
  await expect(page.locator('main')).not.toContainText('+40%');
});
