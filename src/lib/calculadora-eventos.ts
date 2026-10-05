// A conta da calculadora "Confira sua economia" da landing page antiga de
// eventos (pasta calculadora/, que rodava no WordPress). As taxas e a fórmula
// são as mesmas de lá; só saíram da tela para poderem ser testadas.

// Média das três formas de pagamento: cada uma soma a taxa do meio de
// pagamento com 2,9% e divide por três, como no script original.
const TAXAS_TRANSFORME = [
  (3.99 + 2.9) / 3, // cartão de crédito
  (1.8 + 2.9) / 3, // Pix
  (1.8 + 2.9) / 3, // boleto
];
const CUSTO_FIXO_TRANSFORME = 190;

const TAXA_MAIS_CONHECIDO = 0.1;
const TAXA_MAIS_BARATO = 0.072;
const POR_INSCRICAO_MAIS_BARATO = 0.45;

export interface ResultadoEconomia {
  receitaAnual: number;
  transforme: number;
  maisConhecido: number;
  maisBarato: number;
  economiaMaisConhecido: number;
  economiaMaisBarato: number;
  /** A calculadora só mostra o resultado quando a transforme.tech sai mais barata que os dois. */
  compensa: boolean;
}

export function calcularEconomia(inscricoesPorAno: number, ticketMedio: number): ResultadoEconomia {
  const receitaAnual = inscricoesPorAno * ticketMedio;
  const transforme =
    TAXAS_TRANSFORME.reduce((soma, taxa) => soma + receitaAnual * (taxa / 100), 0) + CUSTO_FIXO_TRANSFORME;
  const maisConhecido = receitaAnual * TAXA_MAIS_CONHECIDO;
  const maisBarato = receitaAnual * TAXA_MAIS_BARATO + inscricoesPorAno * POR_INSCRICAO_MAIS_BARATO;
  const economiaMaisConhecido = maisConhecido - transforme;
  const economiaMaisBarato = maisBarato - transforme;
  return {
    receitaAnual,
    transforme,
    maisConhecido,
    maisBarato,
    economiaMaisConhecido,
    economiaMaisBarato,
    compensa: economiaMaisConhecido >= 0 && economiaMaisBarato >= 0,
  };
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
