import { test, expect } from '@playwright/test';

// O item 14 do documento do dono: vídeo de cliente real com a primeira frase
// dele por escrito ao lado. A frase é o que faz alguém apertar o play — se ela
// sumir, sobra um retângulo preto no meio da página.
test('a seção mostra o depoimento em vídeo com a frase de abertura escrita', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#video-cliente');

  await expect(secao.getByRole('heading', { level: 2 })).toContainText(
    'Veja o que mudou para quem usa.',
  );
  await expect(secao).toContainText('Nós começamos em dezembro com R$ 500 ou R$ 600');
  await expect(secao).toContainText('Casa de Nazaré');
});

// São 7,6 MB. Eles só podem sair do servidor depois do play — quem só rola a
// página leva a capa de 50 KB.
test('o vídeo não baixa nada antes de alguém pedir', async ({ page }) => {
  const pedidos: string[] = [];
  page.on('request', (r) => {
    if (/depoimento-casa-de-nazare\.mp4/.test(r.url())) pedidos.push(r.url());
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  expect(pedidos).toEqual([]);
  const video = page.locator('#video-cliente video');
  await expect(video).toHaveAttribute('preload', 'none');
  await expect(video).toHaveAttribute('poster', /depoimento-casa-de-nazare-capa\.webp/);
});

// O documento coloca o vídeo entre "uma plataforma para toda a sua gestão" e
// "como a transforme.tech trabalha com você".
test('o vídeo entra depois das soluções e antes do como funciona', async ({ page }) => {
  await page.goto('/');
  const ordem = await page
    .locator('main section[id]')
    .evaluateAll((secoes) => secoes.map((s) => s.id));
  expect(ordem.indexOf('video-cliente')).toBeGreaterThan(ordem.indexOf('solucoes'));
  expect(ordem.indexOf('video-cliente')).toBeLessThan(ordem.indexOf('como-funciona'));
});

// O vídeo declara largura e altura: sem isso a caixa nasce com 150px de altura
// e empurra a página quando a capa chega.
test('o vídeo reserva o espaço dele antes de carregar', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('#video-cliente video');
  await expect(video).toHaveAttribute('width', '540');
  await expect(video).toHaveAttribute('height', '960');
});
