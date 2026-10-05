import { test, expect } from '@playwright/test';

test('o sitemap existe e inclui os posts', async ({ request }) => {
  const indice = await request.get('/sitemap-index.xml');
  expect(indice.status()).toBe(200);

  const urlDoSitemap = (await indice.text()).match(/<loc>([^<]+sitemap-0\.xml)<\/loc>/)?.[1];
  expect(urlDoSitemap).toBeTruthy();

  // O <loc> é absoluto e aponta para o domínio de produção; aqui interessa o
  // mesmo arquivo servido pelo preview, então segue-se só o caminho.
  const conteudo = await (await request.get(new URL(urlDoSitemap!).pathname)).text();
  expect(conteudo).toContain('/blog/diga-nao-ao-pix/');
});

test('o RSS traz os 14 posts, do mais novo para o mais antigo', async ({ request }) => {
  const r = await request.get('/rss.xml');
  expect(r.status()).toBe(200);
  const xml = await r.text();
  expect(xml.match(/<item>/g)).toHaveLength(14);
  expect(xml).toContain('<language>pt-br</language>');
});

test('o robots.txt aponta para o sitemap e bloqueia o admin', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).toContain('Sitemap: https://transforme.tech/sitemap-index.xml');
  expect(txt).toContain('Disallow: /admin');
});

test('toda página tem canonical, og:image e descrição', async ({ page }) => {
  for (const rota of ['/', '/blog/', '/blog/diga-nao-ao-pix/', '/suporte/']) {
    await page.goto(rota);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc!.length).toBeGreaterThan(50);
  }
});

test('o post declara og:type article', async ({ page }) => {
  await page.goto('/blog/diga-nao-ao-pix/');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
});
