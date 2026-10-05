import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ORIGENS, origemDoContato } from '../src/dados/origens';
import { assuntoContato, montarEmailContato, ASSUNTO_CONTATO } from '../functions/_shared/modelo-email';
import { onRequestPost } from '../functions/api/contato';
import { salvarLead } from '../functions/_shared/persistencia';
import { enviarEmail } from '../functions/_shared/email';

vi.mock('../functions/_shared/turnstile', () => ({ verificarTurnstile: vi.fn().mockResolvedValue(true) }));
vi.mock('../functions/_shared/persistencia', () => ({ salvarLead: vi.fn() }));
vi.mock('../functions/_shared/email', () => ({ enviarEmail: vi.fn(), destinatarios: () => ['comercial@example.org'] }));
beforeEach(() => vi.clearAllMocks());

async function enviarContato(origem?: string) {
  const form = new FormData();
  for (const [k, v] of Object.entries({ nome: 'Maria', organizacao: 'ONG', whatsapp: '44999999999', email: 'maria@example.org', 'cf-turnstile-response': 't' })) form.set(k, v);
  if (origem !== undefined) form.set('origem', origem);
  const req = new Request('https://transforme.tech/api/contato', { method: 'POST', body: form });
  return onRequestPost({ request: req, env: { DB: {}, RESEND_API_KEY: 'x', TURNSTILE_SECRET_KEY: 'x' } } as any);
}

describe('origem do formulário de contato', () => {
  it('grava e avisa o comercial de que o lead veio da landing de eventos', async () => {
    expect((await enviarContato('eventos')).status).toBe(200);
    expect(salvarLead).toHaveBeenCalledWith({}, 'contato', expect.any(Object), 'eventos');
    const [, , assunto, html] = vi.mocked(enviarEmail).mock.calls[0];
    expect(assunto).toContain(ORIGENS.eventos);
    expect(html).toContain(ORIGENS.eventos);
  });

  it('sem o campo, ou com valor desconhecido, vale como contato da home', async () => {
    await enviarContato();
    await enviarContato('<script>');
    await enviarContato('ebook');
    for (const chamada of vi.mocked(salvarLead).mock.calls) expect(chamada[3]).toBe('contato');
  });

  it('o assunto da home continua o mesmo de sempre', () => {
    expect(assuntoContato('contato')).toBe(ASSUNTO_CONTATO);
    expect(origemDoContato('eventos')).toBe('eventos');
  });

  it('o e-mail escapa e mostra o formulário de origem', () => {
    const html = montarEmailContato({ nome: 'A', organizacao: 'B', whatsapp: '1', email: 'a@b.c' }, 'eventos');
    expect(html).toContain('<strong>Formulário:</strong> Landing page de eventos (/mais_eventos/)');
  });
});

it('o filtro do painel de leads oferece exatamente as origens conhecidas', () => {
  const html = readFileSync('public/admin/leads/index.html', 'utf8');
  const select = html.match(/<select id="origem">([\s\S]*?)<\/select>/)![1];
  const valores = [...select.matchAll(/value="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
  expect(valores.sort()).toEqual(Object.keys(ORIGENS).sort());
});
