import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

function luminancia(hex: string): number {
  const h = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const l = c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
}

export function contraste(a: string, b: string): number {
  const [la, lb] = [luminancia(a), luminancia(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const CLARO = { superficie: '#F7F7F6', forte: '#0B0A60', suave: '#5F5B7A', acento: '#693ECC' };
const ESCURO = { superficie: '#05032C', forte: '#FFFFFF', suave: '#C8C3E6', acento: '#A992FF' };

describe('tokens de cor', () => {
  it('tema claro: todo texto passa AA sobre a superfície', () => {
    for (const cor of [CLARO.forte, CLARO.suave, CLARO.acento]) {
      expect(contraste(cor, CLARO.superficie)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('tema escuro: todo texto passa AA sobre a superfície', () => {
    for (const cor of [ESCURO.forte, ESCURO.suave, ESCURO.acento]) {
      expect(contraste(cor, ESCURO.superficie)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('branco sobre o botão de acento claro passa AA', () => {
    expect(contraste('#FFFFFF', '#693ECC')).toBeGreaterThanOrEqual(4.5);
  });

  it('branco sobre as duas pontas do gradiente de acento escuro passa AA', () => {
    expect(contraste('#FFFFFF', '#7F56DA')).toBeGreaterThanOrEqual(4.5); // roxo-500
    expect(contraste('#FFFFFF', '#693ECC')).toBeGreaterThanOrEqual(4.5); // roxo-600
  });

  it('#8C73FF não é usado como cor de texto no tema claro', () => {
    const css = readFileSync('src/styles/tokens.css', 'utf8');
    const blocoClaro = css.slice(css.indexOf(':root'), css.indexOf('[data-tema="escuro"]'));
    const linhasDeTexto = blocoClaro
      .split('\n')
      .filter((l) => /--texto-|--acento:/.test(l));
    for (const linha of linhasDeTexto) {
      expect(linha.toLowerCase()).not.toContain('roxo-400');
      expect(linha.toLowerCase()).not.toContain('8c73ff');
    }
  });
});
