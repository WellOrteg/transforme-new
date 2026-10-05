const PALAVRAS_POR_MINUTO = 200;

/** Minutos de leitura estimados, com mínimo de 1. */
export function tempoLeitura(texto: string): number {
  const limpo = texto
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`~-]/g, ' ');
  const palavras = limpo.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(palavras / PALAVRAS_POR_MINUTO));
}
