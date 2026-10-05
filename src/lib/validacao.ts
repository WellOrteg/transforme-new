import { z } from 'zod';

// O formulário do roteiro qualifica o lead em vez de coletar texto livre: quem é,
// de que organização, por onde falar e qual o problema. `mensagem` saiu do
// formulário; a coluna continua no banco guardando os leads antigos.
export const esquemaContato = z.object({
  nome: z.string().trim().min(1, 'Informe seu nome').max(120, 'Informe um nome com no máximo 120 caracteres'),
  organizacao: z
    .string()
    .trim()
    .min(1, 'Informe o nome da sua organização')
    .max(160, 'Informe um nome de organização com no máximo 160 caracteres'),
  whatsapp: z
    .string()
    .trim()
    .min(8, 'Informe um WhatsApp com DDD')
    .max(40, 'Informe um WhatsApp com no máximo 40 caracteres'),
  email: z.string().trim().email('Informe um e-mail válido'),
  // Sem `.or(z.literal(''))`: `.max()` já aceita string vazia, então esse
  // segundo ramo nunca era exercitado.
  desafio: z.string().trim().max(200, 'Descreva o desafio em até 200 caracteres').optional(),
  turnstile: z.string().min(1),
});

export const esquemaNewsletter = z.object({
  email: z.string().trim().email('Informe um e-mail válido'),
  consentimento: z.literal(true, {
    message: 'É necessário o seu consentimento para receber nossos conteúdos',
  }),
  turnstile: z.string().min(1),
});

export type Contato = z.infer<typeof esquemaContato>;
export type Newsletter = z.infer<typeof esquemaNewsletter>;
