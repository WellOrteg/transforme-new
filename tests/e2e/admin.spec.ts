import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

test('a página do admin carrega', async ({ page }) => {
  const r = await page.goto('/admin/');
  expect(r?.status()).toBe(200);
});

// A asserção é sobre o HTML servido, não sobre o DOM depois da carga: é o HTML
// servido que o buscador lê, e o Sveltia injeta uma segunda meta robots em
// runtime — duas iguais quebrariam o modo estrito do locator.
test('o admin não é indexado por buscadores', async ({ request }) => {
  const html = await (await request.get('/admin/')).text();
  expect(html).toMatch(/<meta name="robots" content="[^"]*noindex/);
});

test('os campos do CMS batem com o schema da coleção', () => {
  const cfg = parse(readFileSync('public/admin/config.yml', 'utf8'));
  const blog = cfg.collections.find((c: any) => c.name === 'blog');
  const nomes = blog.fields.map((f: any) => f.name);
  for (const campo of ['titulo', 'resumo', 'data', 'autor', 'categoria', 'capa', 'capaAlt', 'rascunho']) {
    expect(nomes).toContain(campo);
  }
});

test('autor e categoria são listas fechadas, como no schema', () => {
  const cfg = parse(readFileSync('public/admin/config.yml', 'utf8'));
  const blog = cfg.collections.find((c: any) => c.name === 'blog');
  const autor = blog.fields.find((f: any) => f.name === 'autor');
  const categoria = blog.fields.find((f: any) => f.name === 'categoria');
  expect(autor.widget).toBe('select');
  expect(autor.options).toHaveLength(5);
  expect(categoria.options).toHaveLength(4);
});
