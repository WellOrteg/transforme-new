import { test, expect } from '@playwright/test';

test('links antigos preservam a tag enviada ao servidor', async ({ page }) => {
  await page.goto('/ebook_doacoes_online/?parceiro=ricardo_baboo');
  await expect(page.locator('main [name="parceiro"]')).toHaveValue('ricardo_baboo');
  await expect(page.locator('main form')).toHaveAttribute('action', '/api/ebook');
});

test('envio abre o popup, permite baixar o PDF e fechar com Escape', async ({ page, request }) => {
  await page.route('**/api/ebook', route => route.fulfill({ json: { ok: true } }));
  await page.goto('/ebook/');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.locator('header a[href="/ebook/"]')).toHaveCount(0);
  const form = page.locator('main form');
  await form.locator('[name="nome"]').fill('Maria');
  await form.locator('[name="organizacao"]').fill('ONG');
  await form.locator('[name="whatsapp"]').fill('44999999999');
  await form.locator('[name="email"]').fill('maria@example.org');
  await form.getByRole('button', { name: 'Enviar e receber e-book' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading')).toHaveText('Baixe seu ebook aqui');
  const download = page.waitForEvent('download');
  await dialog.getByRole('link', { name: 'Baixar e-book' }).click();
  expect((await download).suggestedFilename()).toBe('guia-doacoes.pdf');
  const pdf = await request.get('/ebooks/guia-doacoes.pdf');
  expect(pdf.ok()).toBeTruthy();
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(form.getByRole('button')).toBeFocused();
});

test('falha mantém os dados e não abre o popup', async ({ page }) => {
  await page.route('**/api/ebook', route => route.fulfill({ status: 503, json: { ok: false, erros: { geral: 'Tente novamente.' } } }));
  await page.goto('/ebook/');
  const form = page.locator('main form');
  await form.locator('[name="nome"]').fill('Maria');
  await form.locator('[name="organizacao"]').fill('ONG');
  await form.locator('[name="whatsapp"]').fill('44999999999');
  await form.locator('[name="email"]').fill('maria@example.org');
  await form.getByRole('button').click();
  await expect(form.getByRole('alert')).toHaveText('Tente novamente.');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(form.locator('[name="email"]')).toHaveValue('maria@example.org');
  await expect(form.getByRole('button')).toBeEnabled();
});

test('página mostra a capa, os seis tópicos e o vídeo da landing antiga', async ({ page }) => {
  await page.goto('/ebook/');
  const capa = page.getByRole('img', { name: /Capa do e-book/ });
  await expect(capa).toBeVisible();
  await expect(capa).toHaveAttribute('width', /\d+/);
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(6);
  await expect(page.locator('[data-video] a[data-id="Vl2FjqBOdL8"]')).toHaveCount(1);
});
