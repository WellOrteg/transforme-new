import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verificarTurnstile } from '../functions/_shared/turnstile';
import { salvarLead } from '../functions/_shared/persistencia';
import { DESTINATARIOS, destinatarios, enviarEmail } from '../functions/_shared/email';
import {
  montarEmailContato,
  montarEmailNewsletter,
} from '../functions/_shared/modelo-email';

beforeEach(() => vi.restoreAllMocks());

describe('verificarTurnstile', () => {
  it('retorna true quando a Cloudflare confirma', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ success: true })));
    expect(await verificarTurnstile('t', 's', '1.2.3.4')).toBe(true);
  });

  it('retorna false quando a Cloudflare recusa', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ success: false })));
    expect(await verificarTurnstile('t', 's', null)).toBe(false);
  });
});

describe('salvarLead', () => {
  it('grava com os campos opcionais nulos, não undefined', async () => {
    const bind = vi.fn().mockReturnValue({ run: vi.fn() });
    const db = { prepare: vi.fn().mockReturnValue({ bind }) } as unknown as D1Database;

    await salvarLead(db, 'newsletter', { email: 'a@b.com' }, 'newsletter');

    expect(bind).toHaveBeenCalledWith('newsletter', null, 'a@b.com', null, null, null, null, 'newsletter');
  });

  it('grava desafio em branco como NULL, não como string vazia', async () => {
    const bind = vi.fn().mockReturnValue({ run: vi.fn() });
    const db = { prepare: vi.fn().mockReturnValue({ bind }) } as unknown as D1Database;

    await salvarLead(db, 'contato', { email: 'a@b.com', desafio: '' }, 'contato');

    expect(bind).toHaveBeenCalledWith('contato', null, 'a@b.com', null, null, null, null, 'contato');
  });

  it('grava o lead qualificado inteiro', async () => {
    const bind = vi.fn().mockReturnValue({ run: vi.fn() });
    const db = { prepare: vi.fn().mockReturnValue({ bind }) } as unknown as D1Database;

    await salvarLead(db, 'contato', {
      nome: 'Maria Silva',
      email: 'maria@ong.org.br',
      organizacao: 'ONG Exemplo',
      whatsapp: '(44) 99999-0000',
      desafio: 'Captação de recursos',
    }, 'eventos');

    expect(bind).toHaveBeenCalledWith(
      'contato',
      'Maria Silva',
      'maria@ong.org.br',
      'ONG Exemplo',
      '(44) 99999-0000',
      'Captação de recursos',
      null,
      'eventos',
    );
  });
});

describe('modelo de e-mail', () => {
  const dados = {
    nome: 'Maria Silva',
    organizacao: 'ONG Exemplo',
    whatsapp: '(44) 99999-0000',
    email: 'maria@ong.org.br',
    desafio: 'Captação de recursos',
  };

  it('traz os campos do formulário no lugar certo do modelo', () => {
    const html = montarEmailContato(dados);

    expect(html).toContain('Nova Resposta do Formulário');
    expect(html).toContain('<strong>Nome:</strong> Maria Silva');
    expect(html).toContain('<strong>E-mail:</strong> maria@ong.org.br');
    expect(html).toContain('<strong>Telefone:</strong> (44) 99999-0000');
    expect(html).toContain('<strong>Organização:</strong> ONG Exemplo');
    expect(html).toContain('Captação de recursos');
    expect(html).toContain('Não responda este e-mail');
  });

  // O modelo do dono é um formulário de doze campos; o do site coleta cinco.
  // Nenhum marcador do modelo pode sobrar impresso no e-mail da equipe.
  it('não deixa marcador do modelo antigo escapar', () => {
    const html = montarEmailContato(dados);
    expect(html).not.toContain('[field');
    expect(html).not.toContain('qtd_doacoes');
    expect(html).not.toContain('promove_eventos');
  });

  it('omite a seção do desafio quando ninguém respondeu', () => {
    expect(montarEmailContato({ ...dados, desafio: '   ' })).not.toContain('Principal desafio');
    expect(montarEmailContato({ ...dados, desafio: undefined })).not.toContain('Principal desafio');
  });

  // O e-mail é HTML e vai para a caixa da equipe: um campo com tag dentro não
  // pode virar marcação.
  it('escapa o que veio do formulário', () => {
    const html = montarEmailContato({ ...dados, nome: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('a newsletter usa o mesmo layout', () => {
    const html = montarEmailNewsletter('alguem@exemplo.org');
    expect(html).toContain('Nova Resposta do Formulário');
    expect(html).toContain('alguem@exemplo.org');
  });
});

describe('destinatários', () => {
  it('sem MAIL_TO, manda para os três endereços comerciais', () => {
    expect(destinatarios(undefined)).toEqual([
      'comercial01@transforme.tech',
      'comercial02@transforme.tech',
      'comercial@transforme.tech',
    ]);
    expect(destinatarios('')).toEqual(DESTINATARIOS);
    expect(destinatarios('   ,  ')).toEqual(DESTINATARIOS);
  });

  it('MAIL_TO vence, e aceita lista separada por vírgula', () => {
    expect(destinatarios('a@b.com, c@d.com')).toEqual(['a@b.com', 'c@d.com']);
  });
});

describe('enviarEmail', () => {
  it('manda pela Resend com o remetente do domínio e a lista de destinatários', async () => {
    const fetchFalso = vi.fn(async () => Response.json({ id: '1' }));
    vi.stubGlobal('fetch', fetchFalso);

    await enviarEmail('chave', ['a@b.com', 'c@d.com'], 'Assunto', '<p>oi</p>');

    const [url, opcoes] = fetchFalso.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    const corpo = JSON.parse(String(opcoes.body));
    expect(corpo.from).toBe('form-site@transforme.tech');
    expect(corpo.to).toEqual(['a@b.com', 'c@d.com']);
    expect(corpo.subject).toBe('Assunto');
  });

  it('estoura quando a Resend recusa', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nao', { status: 422 })));
    await expect(enviarEmail('chave', 'a@b.com', 'x', 'y')).rejects.toThrow('422');
  });
});
