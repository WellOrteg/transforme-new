import type { NomeIcone } from '../components/landing/IconeTraco.astro';

// Textos da landing page antiga de eventos (WordPress, /mais_eventos/).

export const RECURSOS_EVENTOS: { icone: NomeIcone; titulo: string; texto: string }[] = [
  {
    icone: 'celular',
    titulo: 'Hotsites personalizados',
    texto: 'Crie hotsites ilimitados para receber suas inscrições, personalizados com a cara da sua organização.',
  },
  {
    icone: 'confere',
    titulo: 'Credibilidade para seus eventos',
    texto: 'Os boletos e faturas das taxas de inscrição levam o nome e a logo da sua organização, o que passa credibilidade para os inscritos.',
  },
  {
    icone: 'doacao',
    titulo: 'Receba os valores com rapidez e segurança',
    texto: 'Receba as inscrições via Pix, cartão de crédito nacional ou internacional, ou boleto bancário, por meio de uma conta digital, em até 1 dia útil (confira as condições).',
  },
  {
    icone: 'prancheta',
    titulo: 'Sua base de inscritos em um só lugar',
    texto: 'Os dados das inscrições ficam numa base com acesso exclusivo da sua organização, conforme as regras da LGPD.',
  },
  {
    icone: 'balao',
    titulo: 'Crie sua régua de comunicação',
    texto: 'Crie comunicações automáticas por WhatsApp e e-mail para avisar os inscritos sobre o vencimento dos boletos.',
  },
  {
    icone: 'grafico',
    titulo: 'Relatórios das inscrições com facilidade',
    texto: 'Tenha relatórios completos sobre suas inscrições com apenas alguns cliques.',
  },
];

export const FAQ_EVENTOS: { pergunta: string; resposta: string }[] = [
  {
    pergunta: 'A plataforma é gratuita?',
    resposta:
      'Não, mas, considerando todas as soluções oferecidas, a plataforma tem um excelente custo-benefício para a sua organização, especialmente para eventos com inscrição acima de R$ 200.',
  },
];
