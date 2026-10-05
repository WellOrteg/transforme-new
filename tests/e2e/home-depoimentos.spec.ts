import { test, expect } from '@playwright/test';

test('o título vem do documento do dono', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#depoimentos').getByRole('heading', { level: 2 })).toContainText(
    'Quem transforma com a gente.',
  );
});

// Em 09/09/2026 os seis cartões viraram um bloco só, com as citações passando.
// O que este teste guarda é que "um bloco só" não virou "menos depoimentos".
test('os seis depoimentos ficam num bloco só', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#depoimentos [data-depoimentos]')).toHaveCount(1);
  await expect(page.locator('#depoimentos [data-depoimentos] blockquote')).toHaveCount(6);
  await expect(page.locator('#depoimentos [data-depoimentos] figure')).toHaveCount(6);
});

// Asserção posicional: o bloco abre com as três personas do §12 (organização
// missionária, responsável financeiro, ONG/OSC), na ordem fixada em
// Depoimentos.astro. Era o que os três cartões de destaque diziam.
test('a vez de cada um começa pelas três personas do roteiro', async ({ page }) => {
  await page.goto('/');
  const figuras = page.locator('#depoimentos [data-depoimentos] figure');
  await expect(figuras.nth(0)).toContainText('Diretor Executivo da AMTB');
  await expect(figuras.nth(1)).toContainText('Diretor Financeiro da MCM');
  await expect(figuras.nth(2)).toContainText('Projeto Educacional e Social Casa da Amizade');
});

test('cada depoimento traz foto, nome e cargo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#depoimentos [data-depoimentos] figure img')).toHaveCount(6);
  await expect(page.locator('#depoimentos')).toContainText('Rodrigo Gomes');
});

// A alternância é enfeite: com prefers-reduced-motion as seis ficam em coluna,
// todas legíveis. Sem esta garantia, quem pede menos movimento veria uma só.
test('com prefers-reduced-motion as seis citações ficam visíveis de uma vez', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const opacidades = await page
    .locator('#depoimentos [data-depoimentos] figure')
    .evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).opacity)));
  expect(opacidades).toHaveLength(6);
  for (const o of opacidades) expect(o).toBe(1);
});

// Os três reels que o dono mandou em 09/09/2026. A frase escrita ao lado é o
// que faz alguém apertar o play; os megabytes só saem do servidor depois disso.
test('os três depoimentos em vídeo trazem frase e autor, sem baixar antes do play', async ({ page }) => {
  const pedidos: string[] = [];
  page.on('request', (r) => {
    if (/\/video\/depoimento-.*\.mp4/.test(r.url())) pedidos.push(r.url());
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  const cartoes = page.locator('#depoimentos [data-video-depoimento]');
  await expect(cartoes).toHaveCount(3);
  await expect(cartoes).toContainText([
    'Gilliardi Tolentino',
    'Jader',
    'Eliana',
  ]);
  await expect(cartoes.first()).toContainText('é uma ferramenta fantástica');

  const preloads = await cartoes
    .locator('video')
    .evaluateAll((els) => els.map((e) => e.getAttribute('preload')));
  expect(preloads).toEqual(['none', 'none', 'none']);
  expect(pedidos).toEqual([]);
});
