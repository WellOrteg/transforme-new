import { test, expect } from '@playwright/test';

test('o bloco da plataforma é a segunda faixa escura', async ({ page }) => {
  await page.goto('/');
  const escuras = page.locator('main [data-tema="escuro"]');
  await expect(escuras).toHaveCount(2);
  await expect(escuras.nth(1)).toContainText(/painel|plataforma/i);
});

test('os depoimentos usam marcação semântica de citação', async ({ page }) => {
  await page.goto('/');
  // 6 depoimentos reais coletados do site atual (ver src/dados/depoimentos.ts),
  // não os 3 placeholders originalmente previstos no brief.
  await expect(page.locator('#depoimentos [data-depoimentos] blockquote')).toHaveCount(6);
});
