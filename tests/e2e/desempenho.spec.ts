import { test, expect } from '@playwright/test';

// O orçamento vale para o JavaScript do próprio site. GTM e Meta Pixel, pedidos
// pelo marketing e carregados de outros domínios, ficam fora da conta.
test('a home envia menos de 20 KB de JavaScript', async ({ page, baseURL }) => {
  let bytes = 0;
  page.on('response', async (r) => {
    if (r.url().startsWith(baseURL!) && r.url().endsWith('.js') && r.status() === 200) {
      bytes += (await r.body().catch(() => Buffer.alloc(0))).length;
    }
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(bytes).toBeLessThan(20_000);
});

test('a página de post não tem deslocamento de layout acima de 0,02', async ({ page }) => {
  await page.goto('/blog/diga-nao-ao-pix/');
  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((lista) => {
          for (const e of lista.getEntries() as any[]) if (!e.hadRecentInput) total += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(total), 2500);
      }),
  );
  expect(cls).toBeLessThan(0.02);
});

test('toda imagem declara largura e altura, para não deslocar o layout', async ({ page }) => {
  await page.goto('/blog/');
  const semDimensao = await page
    .locator('img')
    .evaluateAll((imgs) => imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).length);
  expect(semDimensao).toBe(0);
});
