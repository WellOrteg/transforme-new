export interface Publico {
  titulo: string;
  texto: string;
}

// Os quatro públicos do §5 do roteiro do cliente, com o rótulo e o texto que ele
// escreve para cada um. Antecipam a pergunta "isso é para mim?" antes de a página
// começar a falar de funcionalidade.
export const publicos: Publico[] = [
  {
    titulo: 'ONG / OSC',
    texto:
      'Captação, gestão, indicadores sociais, gestão de inscrições, relacionamento e prestação de contas em uma estrutura integrada.',
  },
  {
    titulo: 'Associações e Fundações',
    texto: 'Mais governança, transparência e controle sobre recursos e projetos.',
  },
  {
    titulo: 'Organizações Missionárias',
    texto: 'Gestão de mantenedores, missionários, ofertas e relacionamento.',
  },
  {
    titulo: 'Empresas, Igrejas e Projetos Sociais',
    texto: 'Ferramentas para indicadores de projetos, eventos, missionários e iniciativas de impacto.',
  },
];
