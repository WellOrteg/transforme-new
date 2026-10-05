import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

// O projeto nasceu com o favicon padrão do Astro e ele passou meses no lugar.
it('o favicon SVG é o símbolo da transforme.tech, com versão para tema escuro', () => {
  const svg = readFileSync('public/favicon.svg', 'utf8');
  expect(svg).toContain('aria-label="transforme.tech"');
  expect(svg).toContain('#0B0A60');
  expect(svg).toContain('prefers-color-scheme: dark');
});

it('o favicon.ico é um ícone de verdade, com 16 e 32 px', () => {
  const ico = readFileSync('public/favicon.ico');
  expect(ico.readUInt16LE(2)).toBe(1);
  const tamanhos = Array.from({ length: ico.readUInt16LE(4) }, (_, i) => ico[6 + 16 * i]);
  expect(tamanhos).toEqual(expect.arrayContaining([16, 32]));
});
