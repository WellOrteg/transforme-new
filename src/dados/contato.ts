// O §16 do roteiro pede o WhatsApp permanentemente disponível, e o §2 o promove a
// CTA primário. São cinco pontos de contato na mesma página; se cada um escrever o
// número e a mensagem por conta própria, eles divergem na primeira manutenção.
//
// A mensagem existe para a equipe comercial saber que a conversa nasceu no site.
export const WHATSAPP_COMERCIAL = '554491510045';

export const MENSAGEM_WHATSAPP =
  'Olá! Conheci a transforme.tech pelo site e gostaria de entender como a plataforma pode ajudar minha organização.';

export function linkWhatsApp(mensagem: string = MENSAGEM_WHATSAPP): string {
  return `https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent(mensagem)}`;
}
