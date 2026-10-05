export interface LeadGravavel {
  nome?: string;
  email: string;
  organizacao?: string;
  whatsapp?: string;
  desafio?: string;
  /** Só os leads recebidos antes do formulário novo têm mensagem. */
  mensagem?: string;
}

export async function salvarLead(
  db: D1Database,
  tipo: 'contato' | 'newsletter',
  dados: LeadGravavel,
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO leads (tipo, nome, email, organizacao, whatsapp, desafio, mensagem) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
    )
    .run();
}
