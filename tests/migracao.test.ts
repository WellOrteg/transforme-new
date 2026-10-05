// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { htmlParaMarkdown, montarFrontmatter, gerarRedirects } from '../scripts/migrar-wordpress';

const post = JSON.parse(readFileSync('tests/fixtures/post-wordpress.json', 'utf8'));

describe('htmlParaMarkdown', () => {
  const md = htmlParaMarkdown(post.html);

  it('converte negrito e itálico', () => {
    expect(md).toContain('**resolveu**');
    expect(md).toContain('_outro_');
  });

  it('converte h2 em ## para o sumário funcionar', () => {
    expect(md).toContain('## O problema seguinte');
  });

  it('remove comentários de bloco do WordPress', () => {
    expect(md).not.toContain('wp:paragraph');
  });

  it('remove parágrafos que só têm espaço não separável', () => {
    expect(md).not.toContain('&nbsp;');
    expect(md).not.toMatch(/\n\s* \s*\n/);
  });

  it('preserva imagem com o texto alternativo', () => {
    expect(md).toContain('![Gráfico de doações]');
  });

  it('reescreve o caminho da imagem para o repositório', () => {
    expect(md).toContain('](~/assets/blog/grafico.png)');
    expect(md).not.toContain('transforme.tech/wp-content');
  });

  it('converte lista', () => {
    expect(md).toContain('-   Item um');
  });

  it('não deixa três ou mais quebras de linha seguidas', () => {
    expect(md).not.toMatch(/\n{3,}/);
  });
});

describe('montarFrontmatter', () => {
  const fm = montarFrontmatter(post);

  it('escreve a data em ISO curto', () => {
    expect(fm).toContain('data: 2024-07-23');
  });

  it('cita títulos que contêm dois-pontos, senão o YAML quebra', () => {
    expect(fm).toContain('titulo: "Diga não ao PIX: uma nova cultura de doações!"');
  });

  it('mantém autor e categoria dentro dos valores permitidos', () => {
    expect(fm).toContain('autor: André Kind');
    expect(fm).toContain('categoria: Transformação');
  });

  it('abre e fecha o bloco de frontmatter', () => {
    expect(fm.startsWith('---\n')).toBe(true);
    expect(fm.trimEnd().endsWith('---')).toBe(true);
  });
});

describe('gerarRedirects', () => {
  it('gera 301 da raiz para /blog/ preservando o slug', () => {
    expect(gerarRedirects(['diga-nao-ao-pix'])).toBe('/diga-nao-ao-pix/  /blog/diga-nao-ao-pix/  301');
  });

  it('gera uma linha por slug', () => {
    const linhas = gerarRedirects(['a', 'b', 'c']).split('\n');
    expect(linhas).toHaveLength(3);
  });

  it('não gera redirect para slug vazio', () => {
    expect(gerarRedirects(['a', '', 'b']).split('\n')).toHaveLength(2);
  });
});
