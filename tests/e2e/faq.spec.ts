import { test, expect } from '@playwright/test';

test('cada pergunta é um summary dentro de details', async ({ page }) => {
  await page.goto('/');
  const detalhes = page.locator('#faq details');
  expect(await detalhes.count()).toBe(16);
  await expect(page.locator('#faq details > summary').first()).toBeVisible();
});

test('a resposta abre com Enter no teclado', async ({ page }) => {
  await page.goto('/');
  const primeiro = page.locator('#faq details').first();
  await expect(primeiro).not.toHaveAttribute('open', '');
  await primeiro.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(primeiro).toHaveAttribute('open', '');
});

test('o FAQ publica dados estruturados FAQPage', async ({ page }) => {
  await page.goto('/');
  const jsonld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = jsonld.map((t) => JSON.parse(t)).find((o) => o['@type'] === 'FAQPage');
  expect(faq).toBeTruthy();
  expect(faq.mainEntity.length).toBe(16);
});

// O §13 acrescenta as perguntas comerciais, que são as que eliminam barreira
// antes do contato — preço, modularidade, migração, cancelamento.
test('as perguntas comerciais do roteiro estão no FAQ', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#faq');
  for (const pergunta of [
    'Quanto custa a transforme.tech?',
    'Posso contratar somente alguns módulos?',
    'A plataforma atende organizações pequenas?',
    'É possível migrar dados de outro sistema?',
    'Vocês ajudam na implantação?',
    'Os dados da organização ficam seguros?',
    'Posso cancelar quando quiser?',
  ]) {
    // Correção ao brief: o <summary> contém a pergunta mais o <span>+</span> do
    // indicador, então o texto normalizado termina em "+" e a correspondência
    // exata falha. As oito perguntas são distintas o bastante para a
    // correspondência por substring não colidir.
    await expect(secao.getByText(pergunta)).toBeVisible();
  }
  await expect(secao).toContainText('não temos cláusulas de fidelização');
});

// O dono pediu o link direto no menu em 10/09/2026: quem procura preço ou prazo
// não deveria ter de rolar a home inteira para achar as respostas.
test('o menu principal leva direto às dúvidas comuns', async ({ page }) => {
  await page.goto('/');
  await page
    .locator('header nav[aria-label="Principal"]')
    .getByRole('link', { name: 'Dúvidas comuns' })
    .click();
  await expect(page.locator('#faq')).toBeInViewport();
});

// O menu por extenso só cabe a partir de 1145px (a medição está em
// Cabecalho.astro). Abaixo disso o botão de menu tem de trazer os mesmos itens.
test('abaixo de 1145px o link vive dentro do botão de menu', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/');

  await expect(page.locator('header nav[aria-label="Principal"]')).toBeHidden();
  await page.locator('header details summary').click();
  await expect(
    page.locator('header nav[aria-label="Principal (mobile)"]').getByRole('link', { name: 'Dúvidas comuns' }),
  ).toBeVisible();
});
