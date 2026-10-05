import { test, expect } from '@playwright/test';

test('os quatro passos aparecem na ordem do roteiro', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#como-funciona');

  await expect(secao.getByRole('heading', { level: 2 })).toContainText(
    'Começar é mais simples do que parece.',
  );

  await expect(secao.locator('ol > li h3')).toHaveText([
    'Entendemos sua realidade',
    'Montamos a solução',
    'Implantamos juntos',
    'Você evolui com a gente',
  ]);

  await expect(secao).toContainText('Configuramos a plataforma e capacitamos sua equipe.');
});

// A seção existe para derrubar a objeção "será que vai ser difícil implantar?",
// então ela precisa terminar oferecendo a conversa.
test('a seção termina com o CTA para o formulário', async ({ page }) => {
  await page.goto('/');
  const cta = page.locator('#como-funciona').getByRole('link', {
    name: 'Quero conversar sobre minha organização',
  });
  await expect(cta).toHaveAttribute('href', '#contato');
});

test('o menu leva até os passos', async ({ page }) => {
  await page.goto('/');
  // Há dois <nav> dentro do header (desktop e mobile); o modo estrito do
  // Playwright exige mirar só o "Principal" para não casar os dois links.
  await page.locator('header nav[aria-label="Principal"]').getByRole('link', { name: 'Como funciona' }).click();
  await expect(page.locator('#como-funciona')).toBeInViewport();
});
