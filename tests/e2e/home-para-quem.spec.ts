import { test, expect } from '@playwright/test';

test('os quatro públicos do roteiro aparecem com o texto do §5', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#para-quem');

  await expect(secao.getByRole('heading', { level: 2 })).toContainText(
    'É para organizações como a sua.',
  );

  for (const titulo of [
    'ONG / OSC',
    'Associações e Fundações',
    'Organizações Missionárias',
    'Empresas, Igrejas e Projetos Sociais',
  ]) {
    await expect(secao.getByRole('heading', { name: titulo, level: 3 })).toBeVisible();
  }

  await expect(secao).toContainText('Mais governança, transparência e controle sobre recursos e projetos.');
});
