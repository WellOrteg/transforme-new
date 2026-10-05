import type { Origem } from '../../src/dados/origens';

export interface LeadGravavel {
  nome?: string;
  email: string;
  organizacao?: string;
  whatsapp?: string;
  desafio?: string;
  /** Só os leads recebidos antes do formulário novo têm mensagem. */
  mensagem?: string;
}

export async function salvarLeadEbook(db: D1Database, dados: LeadGravavel, parceiro: string | null): Promise<void> {
  await db.prepare(
    'INSERT INTO leads (tipo, nome, email, organizacao, whatsapp, desafio, mensagem, origem, parceiro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).bind('contato', dados.nome ?? null, dados.email, dados.organizacao ?? null,
    dados.whatsapp ?? null, dados.desafio || null,
    'Origem: formulário do e-book Guia de doações', 'ebook', parceiro).run();
}

export async function salvarLead(
  db: D1Database,
  tipo: 'contato' | 'newsletter',
  dados: LeadGravavel,
  origem: Origem,
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO leads (tipo, nome, email, organizacao, whatsapp, desafio, mensagem, origem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      tipo,
      dados.nome ?? null,
      dados.email,
      dados.organizacao ?? null,
      dados.whatsapp ?? null,
      // `||`, não `??`: `desafio` sendo opcional no formulário, string vazia
      // também deve virar NULL no banco, não uma linha "preenchida" com nada.
      dados.desafio || null,
      dados.mensagem ?? null,
      origem,
    )
    .run();
}
