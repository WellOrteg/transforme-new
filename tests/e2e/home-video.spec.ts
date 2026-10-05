import { test, expect } from '@playwright/test';

// O player do YouTube passa de 600 KB de JavaScript — sozinho ele estoura o
// orçamento verificado em desempenho.spec.ts. Por isso a home serve a capa e só
// busca o player quando alguém pede para ver.
test('o vídeo de apresentação não busca nada do YouTube antes do clique', async ({ page }) => {
  const pedidos: string[] = [];
  // doubleclick fica de fora: o GTM do Base.astro já o chama em toda página,
  // com ou sem vídeo, e o que este teste guarda é o player.
  page.on('request', (r) => {
    if (/youtube|ytimg|googlevideo/.test(r.url())) pedidos.push(r.url());
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.locator('[data-video] iframe')).toHaveCount(0);
  expect(pedidos).toEqual([]);
});

test('o clique traz o player, na versão sem cookies', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-video] a').click();

  await expect(page.locator('[data-video] iframe')).toHaveAttribute(
    'src',
    /youtube-nocookie\.com\/embed\/cDZmDhgqD2E/,
  );
});

test('sem JavaScript a capa continua sendo um link para o vídeo', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');

  const link = page.locator('[data-video] a');
  await expect(link).toHaveAttribute('href', /youtube\.com\/watch\?v=cDZmDhgqD2E/);
  await ctx.close();
});

// O mockup abre o hero e pesa 600 KB de vídeo. A primeira pintura tem de ser o
// pôster, não o vídeo — daí `preload="none"`, com o play só depois do `load`.
test('o mockup começa pela capa, não pelo vídeo', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('[data-mockup] video');

  await expect(video).toHaveAttribute('preload', 'none');
  await expect(video).toHaveAttribute('poster', /mockup-plataforma-capa\.webp/);
});

// Quem pede menos movimento fica na capa, e aí os 600 KB não são baixados.
test('com menos movimento o mockup nem busca o vídeo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const pedidos: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/video/mockup') && r.url().endsWith('.mp4')) pedidos.push(r.url());
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  expect(pedidos).toEqual([]);
});

test('o mockup toca sozinho no hero', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('[data-mockup] video');

  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.paused), { timeout: 10_000 })
    .toBe(false);
});

test('o mockup fica parado na capa para quem pede menos movimento', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const video = page.locator('[data-mockup] video');
  await video.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

// Desde 09/09/2026 ele mora na seção da dor, ao lado do parágrafo que responde
// as cinco perguntas — a seção "Não somos apenas uma plataforma", que era a
// casa dele, saiu da home.
test('o vídeo de apresentação fica na seção da dor', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#dor [data-video]')).toHaveCount(1);
});
