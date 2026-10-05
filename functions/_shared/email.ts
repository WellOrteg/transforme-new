// O remetente precisa ser um endereço do domínio verificado na Resend — o dono
// definiu form-site@transforme.tech em 09/09/2026.
export const REMETENTE = 'form-site@transforme.tech';

// Os três endereços da equipe comercial, que o dono mandou no mesmo dia. Eles
// ficam no código, e não num segredo do projeto, porque não são credencial:
// assim o site continua entregando mesmo se ninguém configurar MAIL_TO. Quem
// quiser desviar os avisos (um teste, uma caixa temporária) define MAIL_TO com
// uma lista separada por vírgula, e ela vence.
export const DESTINATARIOS = [
  'comercial01@transforme.tech',
  'comercial02@transforme.tech',
  'comercial@transforme.tech',
];

export function destinatarios(mailTo?: string): string[] {
  const lista = (mailTo ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  return lista.length > 0 ? lista : DESTINATARIOS;
}

export async function enviarEmail(
  chave: string,
  para: string | string[],
  assunto: string,
  html: string,
): Promise<void> {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: REMETENTE,
      to: Array.isArray(para) ? para : [para],
      subject: assunto,
      html,
    }),
  });
  // O corpo traz o motivo (chave inválida, domínio não verificado...), que é o
  // que se procura no log quando o aviso não chega.
  if (!r.ok) throw new Error(`Resend respondeu ${r.status}: ${await r.text().catch(() => '')}`);
}
