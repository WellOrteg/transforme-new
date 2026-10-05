import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const config = readFileSync('src/content.config.ts', 'utf8');

describe('schema da coleção blog', () => {
  it('exige capaAlt quando existe capa', () => {
    expect(config).toContain('capaAlt para acessibilidade');
    expect(config).toMatch(/\.refine\(/);
  });

  it('trava os cinco autores existentes', () => {
    for (const a of ['transforme', 'André Kind', 'Emerson Santiago', 'Wesley Cavalheiro', 'Rafael Bandeira']) {
      expect(config).toContain(a);
    }
  });

  it('trava as quatro categorias existentes', () => {
    for (const c of ['Tecnologia', 'Pessoas', 'Transformação', 'Conheça a plataforma']) {
      expect(config).toContain(c);
    }
  });

  it('ignora arquivos com prefixo _', () => {
    expect(config).toContain('**/[^_]*.md');
  });
});
