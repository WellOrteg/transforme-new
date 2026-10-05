import { describe, it, expect } from 'vitest';
import { tempoLeitura } from '../src/lib/tempoLeitura';

describe('tempoLeitura', () => {
  it('texto curto tem no mínimo 1 minuto', () => {
    expect(tempoLeitura('Três palavras aqui')).toBe(1);
  });

  it('calcula a 200 palavras por minuto', () => {
    expect(tempoLeitura('palavra '.repeat(400))).toBe(2);
  });

  it('arredonda para cima', () => {
    expect(tempoLeitura('palavra '.repeat(210))).toBe(2);
  });

  it('ignora marcação Markdown na contagem', () => {
    const comMarcacao = '# Título\n\n' + '**palavra** '.repeat(200);
    expect(tempoLeitura(comMarcacao)).toBe(1);
  });
});
