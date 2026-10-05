import { describe, it, expect } from 'vitest';
import { WHATSAPP_COMERCIAL, MENSAGEM_WHATSAPP, linkWhatsApp } from '../src/dados/contato';

describe('linkWhatsApp', () => {
  it('aponta para o número comercial', () => {
    expect(WHATSAPP_COMERCIAL).toBe('554491510045');
    expect(linkWhatsApp()).toContain('https://wa.me/554491510045');
  });

  it('leva a mensagem do roteiro já codificada', () => {
    expect(MENSAGEM_WHATSAPP).toBe(
      'Olá! Conheci a transforme.tech pelo site e gostaria de entender como a plataforma pode ajudar minha organização.',
    );
    expect(linkWhatsApp()).toContain('?text=Ol%C3%A1');
    expect(linkWhatsApp()).toContain('Conheci%20a%20transforme.tech%20pelo%20site');
  });

  it('aceita uma mensagem própria', () => {
    expect(linkWhatsApp('Oi')).toBe('https://wa.me/554491510045?text=Oi');
  });

  it('não deixa espaço cru no link', () => {
    expect(linkWhatsApp()).not.toContain(' ');
  });
});
