import { ehOrigem } from '../../../src/dados/origens';

interface Env { DB: D1Database; ADMIN_LEADS_TOKEN?: string }

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const resposta = (body: unknown, status = 200) => Response.json(body, { status, headers });

async function autenticar(request: Request, secret?: string): Promise<boolean> {
  if (!secret || secret.length < 32) return false;
  const recebido = request.headers.get('Authorization') ?? '';
  const encoder = new TextEncoder();
  const a = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(recebido)));
  const b = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(`Bearer ${secret}`)));
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a[i] ^ b[i];
  return diferenca === 0;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!await autenticar(request, env.ADMIN_LEADS_TOKEN)) return resposta({ erro: 'Acesso não autorizado. Confira a senha do painel.' }, 401);
  const params = new URL(request.url).searchParams;
  const parceiro = params.get('parceiro') ?? '';
  const origem = params.get('origem') ?? '';
  const pagina = Number(params.get('pagina') ?? '1');
  if (!Number.isSafeInteger(pagina) || pagina < 1 || pagina > 1000000 || parceiro.length > 80 || (origem !== '' && !ehOrigem(origem))) {
    return resposta({ erro: 'Filtro inválido.' }, 400);
  }
  const condicoes: string[] = [];
  const valores: string[] = [];
  if (parceiro === '__sem__') condicoes.push('parceiro IS NULL');
  else if (parceiro) { condicoes.push('parceiro = ?'); valores.push(parceiro); }
  if (origem) { condicoes.push('COALESCE(origem, tipo) = ?'); valores.push(origem); }
  const where = condicoes.length ? ` WHERE ${condicoes.join(' AND ')}` : '';
  try {
    const total = await env.DB.prepare(`SELECT COUNT(*) AS total FROM leads${where}`).bind(...valores).first<{ total: number }>();
    const leads = await env.DB.prepare(`SELECT id, nome, email, organizacao, whatsapp, desafio, mensagem, COALESCE(origem, tipo) AS origem, parceiro, criado_em FROM leads${where} ORDER BY id DESC LIMIT 100 OFFSET ?`).bind(...valores, (pagina - 1) * 100).all();
    const parceiros = await env.DB.prepare('SELECT parceiro, COUNT(*) AS total FROM leads WHERE origem = ? GROUP BY parceiro ORDER BY total DESC').bind('ebook').all();
    return resposta({ leads: leads.results, total: total?.total ?? 0, pagina, parceiros: parceiros.results });
  } catch { return resposta({ erro: 'Não foi possível consultar os leads. Verifique as migrações do banco.' }, 503); }
};
