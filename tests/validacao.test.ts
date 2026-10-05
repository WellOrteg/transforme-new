import { describe, it, expect } from 'vitest';
import { esquemaContato, esquemaNewsletter } from '../src/lib/validacao';

describe('esquemaContato', () => {
  const valido = {
    nome: 'Maria Silva',
    organizacao: 'ONG Exemplo',
    whatsapp: '(44) 99999-0000',
    email: 'maria@ong.org.br',
    desafio: 'Captação de recursos',
    turnstile: 'token',
  };

  it('aceita um envio válido', () => {
    expect(esquemaContato.safeParse(valido).success).toBe(true);
  });

  it('aceita sem o desafio, que é opcional', () => {
    const { desafio, ...semDesafio } = valido;
    expect(esquemaContato.safeParse(semDesafio).success).toBe(true);
  });

  it('recusa e-mail inválido com mensagem em português', () => {
    const r = esquemaContato.safeParse({ ...valido, email: 'nao-e-email' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('Informe um e-mail válido');
  });

  it('recusa nome vazio', () => {
    const r = esquemaContato.safeParse({ ...valido, nome: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('Informe seu nome');
  });

  // A organização é o que qualifica o lead — é a razão de o formulário existir
  // na forma nova, então ela deixou de ser opcional.
  it('recusa organização vazia', () => {
    const r = esquemaContato.safeParse({ ...valido, organizacao: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('Informe o nome da sua organização');
  });

  it('recusa WhatsApp curto demais para ser um telefone', () => {
    const r = esquemaContato.safeParse({ ...valido, whatsapp: '123' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('Informe um WhatsApp com DDD');
  });

  // Estouros de `.max()`: antes, essas quatro mensagens vinham em inglês
  // direto do zod ("Too big: expected string to have <=N characters") e sem
  // dizer qual campo — e caía assim, sem tradução, na tela de quem enviou.
  it('recusa nome com mais de 120 caracteres, com mensagem em português', () => {
    const r = esquemaContato.safeParse({ ...valido, nome: 'a'.repeat(121) });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('Informe um nome com no máximo 120 caracteres');
  });

  it('recusa organização com mais de 160 caracteres, com mensagem em português', () => {
    const r = esquemaContato.safeParse({ ...valido, organizacao: 'a'.repeat(161) });
    expect(r.success).toBe(false);
    if (!r.success)
      expect(r.error.issues[0].message).toBe('Informe um nome de organização com no máximo 160 caracteres');
  });

  it('recusa WhatsApp com mais de 40 caracteres, com mensagem em português', () => {
    const r = esquemaContato.safeParse({ ...valido, whatsapp: '1'.repeat(41) });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('Informe um WhatsApp com no máximo 40 caracteres');
  });

  it('recusa desafio com mais de 200 caracteres, com mensagem em português', () => {
    const r = esquemaContato.safeParse({ ...valido, desafio: 'a'.repeat(201) });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('Descreva o desafio em até 200 caracteres');
  });

  it('recusa envio sem token do Turnstile', () => {
    const { turnstile, ...semToken } = valido;
    expect(esquemaContato.safeParse(semToken).success).toBe(false);
  });

  it('remove espaços em volta do e-mail', () => {
    const r = esquemaContato.parse({ ...valido, email: '  maria@ong.org.br  ' });
    expect(r.email).toBe('maria@ong.org.br');
  });
});

describe('esquemaNewsletter', () => {
  it('exige consentimento explícito, como manda a LGPD', () => {
    const base = { email: 'a@b.com', consentimento: false, turnstile: 't' };
    const r = esquemaNewsletter.safeParse(base);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toContain('consentimento');
  });

  it('aceita com consentimento marcado', () => {
    expect(esquemaNewsletter.safeParse({ email: 'a@b.com', consentimento: true, turnstile: 't' }).success).toBe(true);
  });
});
