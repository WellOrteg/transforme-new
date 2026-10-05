import { beforeEach, expect, it, vi } from 'vitest';
import { onRequestPost } from '../functions/api/ebook';
import { verificarTurnstile } from '../functions/_shared/turnstile';
import { salvarLeadEbook } from '../functions/_shared/persistencia';
import { enviarEmail } from '../functions/_shared/email';

vi.mock('../functions/_shared/turnstile', () => ({ verificarTurnstile: vi.fn() }));
vi.mock('../functions/_shared/persistencia', () => ({ salvarLeadEbook: vi.fn() }));
vi.mock('../functions/_shared/email', () => ({ enviarEmail: vi.fn() }));
beforeEach(() => { vi.resetAllMocks(); vi.mocked(verificarTurnstile).mockResolvedValue(true); });

async function enviar(email = 'pessoa@example.org', parceiro = '') {
  const form = new FormData();
  form.set('parceiro', parceiro);
  for (const [chave, valor] of Object.entries({ nome: '<Maria>', organizacao: 'ONG', whatsapp: '44999999999', email, 'cf-turnstile-response': 'token' })) form.set(chave, valor);
  return onRequestPost({ request: new Request('https://transforme.tech/api/ebook', { method: 'POST', body: form }), env: { DB: {}, RESEND_API_KEY: 'teste', TURNSTILE_SECRET_KEY: 'teste' } } as any);
}

it('entrega o link do PDF ao visitante e registra a origem do lead', async () => {
  expect((await enviar()).status).toBe(200);
  expect(enviarEmail).toHaveBeenCalledWith('teste', 'pessoa@example.org', expect.stringContaining('Guia de doações'), expect.stringContaining('https://transforme.tech/ebooks/guia-doacoes.pdf'));
  expect(vi.mocked(enviarEmail).mock.calls[0][3]).toContain('&lt;Maria&gt;');
  expect(salvarLeadEbook).toHaveBeenCalledWith({}, expect.objectContaining({ email: 'pessoa@example.org' }), null);
});
it('recusa e-mail inválido antes de gravar ou enviar', async () => {
  expect((await enviar('invalido')).status).toBe(400);
  expect(salvarLeadEbook).not.toHaveBeenCalled();
  expect(enviarEmail).not.toHaveBeenCalled();
});
it('recusa captcha inválido antes de gravar ou enviar', async () => {
  vi.mocked(verificarTurnstile).mockResolvedValue(false);
  expect((await enviar()).status).toBe(400);
  expect(salvarLeadEbook).not.toHaveBeenCalled();
  expect(enviarEmail).not.toHaveBeenCalled();
});
it('não confirma sucesso se o serviço de e-mail falhar', async () => {
  vi.mocked(enviarEmail).mockRejectedValue(new Error('falha'));
  const response = await enviar();
  expect(response.status).toBe(503);
  expect(await response.json()).toMatchObject({ ok: false });
});

it('normaliza e salva a tag do parceiro', async () => {
  expect((await enviar('pessoa@example.org', 'FIFE_2026')).status).toBe(200);
  expect(salvarLeadEbook).toHaveBeenCalledWith({}, expect.any(Object), 'fife_2026');
});
it('recusa tags inv?lidas', async () => {
  expect((await enviar('pessoa@example.org', '<script>')).status).toBe(400);
  expect(salvarLeadEbook).not.toHaveBeenCalled();
});
