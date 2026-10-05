export const EBOOK_URL = '/ebooks/guia-doacoes.pdf';

// O vídeo e os seis tópicos vêm da landing page antiga do e-book, no WordPress.
export const VIDEO_EBOOK = {
  id: 'Vl2FjqBOdL8',
  titulo: 'Você que lidera uma organização acredita na tecnologia? Conheça a transforme.tech!',
};

import type { NomeIcone } from '../components/landing/IconeTraco.astro';

export const TOPICOS_EBOOK: { icone: NomeIcone; titulo: string; texto: string }[] = [
  {
    icone: 'confere',
    titulo: 'Ideias comprovadas',
    texto: 'Acesse ideias testadas e comprovadas em nossa caminhada de 8 anos com organizações do terceiro setor.',
  },
  {
    icone: 'balao',
    titulo: 'Crie campanhas encantadoras',
    texto: 'Saiba como criar campanhas com mensagens cativantes para conquistar a empatia dos doadores com a sua causa.',
  },
  {
    icone: 'doacao',
    titulo: 'Como receber doações online',
    texto: 'Conheça as melhores ferramentas e meios para divulgar as campanhas e receber as doações online.',
  },
  {
    icone: 'pessoas',
    titulo: 'Relacionamento com doadores',
    texto: 'Aprenda a construir relacionamento com seus doadores para aumentar a recorrência das doações.',
  },
  {
    icone: 'grafico',
    titulo: 'Mensuração de resultados',
    texto: 'Tenha orientações para mensuração de resultados e aprimoramento contínuo das suas campanhas.',
  },
  {
    icone: 'ia',
    titulo: 'Inteligência artificial (I.A.) e outras ferramentas',
    texto: 'Descubra inteligências artificiais e outras ferramentas que podem facilitar a construção das suas campanhas.',
  },
];
