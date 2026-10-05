// Nota: o brief original propunha `tests/e2e/redirects.spec.ts` importando
// `test`/`expect` de '@playwright/test', rodado via `vitest run` (Step 6).
// Duas correções foram necessárias: (1) test() do Playwright lança
// "Playwright Test did not expect test() to be called here" fora do runner
// do Playwright — os testes abaixo não usam nenhuma fixture do Playwright
// (sem `page`/`browser`), só node:fs, então importar de 'vitest' resolve sem
// mudar nenhuma asserção; (2) manter o arquivo dentro de tests/e2e/ (o
// testDir configurado em playwright.config.ts) fazia `npx playwright test
// --list` tentar carregá-lo com o runner do Playwright e quebrar a descoberta
// da suíte inteira ("Total: 0 tests in 0 files"). Por isso o arquivo vive em
// tests/redirects.test.ts, seguindo a mesma convenção de nome dos outros
// testes Vitest do projeto (tokens.test.ts, marca.test.ts etc.).
import { test, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

const SLUGS_ORIGINAIS = [
  'novas-modalidades-de-pix-para-ongs',
  'transforme-tech-e-icons4u-unem-forcas-para-transformar-realidades',
  'diga-nao-ao-pix',
  'guia-definitivo-para-campanhas-de-doacoes-online',
  '5-anos-gerando-transformacao-de-realidades',
  'como-atender-pessoas-em-vulnerabilidade-social-em-crise',
  'como_atrair_oportunidades',
  'sistema-de-gestao-terceiro-setor',
  'captacao-de-recursos-e-tecnologia',
  'como-utilizar-o-google-meet-videochamadas',
  'novo-recurso-o-mural-online',
  'dashboard-de-captacao-de-recursos',
  'bem-vindo-ao-blog-da-transforme-tech',
  'transmissoes-ao-vivo-lives-e-a-arrecadacao-de-recursos',
];

test('os 14 posts foram migrados', () => {
  const arquivos = readdirSync('src/content/blog').filter((f) => f.endsWith('.md'));
  expect(arquivos).toHaveLength(14);
});

test('cada slug original tem um 301 para o novo endereço', () => {
  const redirects = readFileSync('public/_redirects', 'utf8');
  for (const slug of SLUGS_ORIGINAIS) {
    expect(redirects).toContain(`/${slug}/  /blog/${slug}/  301`);
  }
});

test('cada slug original virou um arquivo Markdown', () => {
  const arquivos = readdirSync('src/content/blog');
  for (const slug of SLUGS_ORIGINAIS) {
    expect(arquivos).toContain(`${slug}.md`);
  }
});

test('nenhum post ficou com resíduo de HTML do WordPress', () => {
  for (const f of readdirSync('src/content/blog')) {
    const texto = readFileSync(`src/content/blog/${f}`, 'utf8');
    expect(texto, f).not.toContain('wp-content');
    expect(texto, f).not.toContain('<!-- wp:');
    expect(texto, f).not.toContain('elementor');
  }
});
