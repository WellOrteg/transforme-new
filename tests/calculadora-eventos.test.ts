import { describe, expect, it } from 'vitest';
import { calcularEconomia, formatarReais } from '../src/lib/calculadora-eventos';

describe('calculadora de economia em eventos', () => {
  // 500 inscrições × R$ 300 = R$ 150.000 por ano.
  // transforme.tech: 150.000 × 5,43% + 190 = 8.335
  // mais conhecido: 10% = 15.000 · mais barato: 7,2% + 0,45 × 500 = 11.025
  it('reproduz a conta da calculadora antiga', () => {
    const r = calcularEconomia(500, 300);
    expect(r.receitaAnual).toBe(150000);
    expect(r.transforme).toBeCloseTo(8335, 6);
    expect(r.maisConhecido).toBeCloseTo(15000, 6);
    expect(r.maisBarato).toBeCloseTo(11025, 6);
    expect(r.economiaMaisConhecido).toBeCloseTo(6665, 6);
    expect(r.economiaMaisBarato).toBeCloseTo(2690, 6);
    expect(r.compensa).toBe(true);
  });

  it('não promete economia quando o custo fixo pesa mais que as taxas', () => {
    expect(calcularEconomia(10, 50).compensa).toBe(false);
  });

  it('formata em reais', () => {
    expect(formatarReais(8335).replace(/\s/g, ' ')).toBe('R$ 8.335,00');
  });
});
