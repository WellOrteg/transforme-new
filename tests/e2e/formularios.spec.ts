import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('o formulário de contato pede os campos que qualificam o lead', async ({ page }) => {
  await page.goto('/#contato');
  for (const nome of ['nome', 'organizacao', 'whatsapp', 'email', 'desafio']) {
    const campo = page.locator(`#contato [name="${nome}"]`);
    await expect(campo).toBeVisible();
  }
  // A mensagem livre saiu: o roteiro trocou a caixa de texto pela qualificação.
  await expect(page.locator('#contato [name="mensagem"]')).toHaveCount(0);
});

test('só o desafio é opcional', async ({ page }) => {
  await page.goto('/#contato');
  for (const nome of ['nome', 'organizacao', 'whatsapp', 'email']) {
    await expect(page.locator(`#contato [name="${nome}"]`)).toHaveAttribute('required', '');
  }
  await expect(page.locator('#contato [name="desafio"]')).not.toHaveAttribute('required', '');
});

test('o campo de desafio sugere as opções do roteiro sem prender a elas', async ({ page }) => {
  await page.goto('/#contato');
  const campo = page.locator('#contato [name="desafio"]');
  await expect(campo).toHaveAttribute('type', 'text');

  const lista = await campo.getAttribute('list');
  expect(lista).toBeTruthy();
  await expect(page.locator(`datalist#${lista} option`)).toHaveCount(6);

  // Texto livre de verdade: aceita o que não está na lista.
  await campo.fill('Prestação de contas para o conselho');
  await expect(campo).toHaveValue('Prestação de contas para o conselho');
});

test('todo campo do formulário tem rótulo associado', async ({ page }) => {
  await page.goto('/#contato');
  for (const nome of ['nome', 'organizacao', 'whatsapp', 'email', 'desafio']) {
    const campo = page.locator(`#contato [name="${nome}"]`);
    const id = await campo.getAttribute('id');
    await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
  }

  // O campo da newsletter fica fora de #contato (é do rodapé), mas também
  // precisa de rótulo associado.
  const consentimento = page.locator('footer [name="consentimento"]');
  const idConsentimento = await consentimento.getAttribute('id');
  await expect(page.locator(`label[for="${idConsentimento}"]`)).toHaveCount(1);
});

test('o formulário posta para a Function mesmo sem JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/#contato');
  const form = page.locator('#contato form');
  await expect(form).toHaveAttribute('method', 'post');
  await expect(form).toHaveAttribute('action', '/api/contato');
  await ctx.close();
});

test('a newsletter exige o consentimento da LGPD', async ({ page }) => {
  await page.goto('/');
  const checkbox = page.locator('footer [name="consentimento"]');
  await expect(checkbox).toHaveAttribute('type', 'checkbox');
  await expect(checkbox).toHaveAttribute('required', '');
});

test('a região de erro é anunciada por leitores de tela', async ({ page }) => {
  await page.goto('/#contato');
  await expect(page.locator('#contato [role="alert"]')).toHaveAttribute('aria-live', 'polite');
});

test('os formulários passam no axe', async ({ page }) => {
  // O axe avalia a página em repouso: no meio de um fade ele mede a cor
  // composta, não a cor final, e acusa contraste que não existe depois de a
  // animação terminar. prefers-reduced-motion entrega o estado final de cara.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#contato');
  const r = await new AxeBuilder({ page }).include('#contato').withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(r.violations).toEqual([]);
});
