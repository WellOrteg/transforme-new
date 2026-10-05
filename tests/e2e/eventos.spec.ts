import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('cada formulário de contato informa de qual página veio', async ({ page }) => {
  await page.goto('/mais_eventos/');
  await expect(page.locator('main form[action="/api/contato"] input[name="origem"]')).toHaveValue('eventos');
  await page.goto('/');
  await expect(page.locator('main form[action="/api/contato"] input[name="origem"]')).toHaveValue('contato');
});

test('o envio da landing de eventos leva a origem ao servidor', async ({ page }) => {
  let corpo = '';
  await page.route('**/api/contato', async (route) => {
    corpo = route.request().postData() ?? '';
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto('/mais_eventos/');
  const form = page.locator('main form[action="/api/contato"]');
  await form.locator('[name="nome"]').fill('Maria');
  await form.locator('[name="organizacao"]').fill('ONG');
  await form.locator('[name="whatsapp"]').fill('44999999999');
  await form.locator('[name="email"]').fill('maria@example.org');
  await form.getByRole('button', { name: 'Enviar formulário' }).click();
  await expect(page.getByText('Mensagem enviada')).toBeVisible();
  expect(corpo).toMatch(/name="origem"\r\n\r\neventos/);
});

test('a calculadora mostra a economia e avisa quando ela não existe', async ({ page }) => {
  await page.goto('/mais_eventos/');
  const calc = page.locator('[data-calculadora]');
  await calc.getByLabel('Média de inscrições recebidas por ano').fill('500');
  await calc.getByLabel('Valor médio da inscrição (R$)').fill('300');
  await calc.getByRole('button', { name: 'Calcular economia' }).click();
  const resultado = page.locator('[data-resultado]');
  await expect(resultado).toContainText('R$ 150.000,00');
  await expect(resultado).toContainText('R$ 8.335,00');
  await expect(resultado).toContainText('R$ 6.665,00');
  await expect(resultado).toContainText('R$ 2.690,00');

  await calc.getByLabel('Média de inscrições recebidas por ano').fill('10');
  await calc.getByLabel('Valor médio da inscrição (R$)').fill('50');
  await calc.getByRole('button', { name: 'Calcular economia' }).click();
  await expect(resultado).toContainText('a economia ainda não aparece');
});

test('a landing de eventos passa no axe', async ({ page }) => {
  await page.goto('/mais_eventos/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('menor taxa do mercado');
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(6);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(r.violations).toEqual([]);
});
