export interface Depoimento {
  texto: string;
  autor: string;
  organizacao: string;
  /** Base do arquivo em src/assets/site/retrato-<foto>.jpg. */
  foto: string;
}

// Os seis depoimentos do carrossel "Clientes satisfeitos" do site atual, com o
// texto inteiro que cada pessoa deu — não a primeira frase.
//
// Quais três aparecem em destaque, e em que ordem, é decidido só em
// Depoimentos.astro (`ordemDestaques`), não aqui. Havia um campo `destaque`
// neste array; foi removido porque duplicava esse critério — um segundo
// lugar que precisaria ser mantido em sincronia manual com `ordemDestaques`,
// e que divergia em silêncio se alguém esquecesse.
export const depoimentos: Depoimento[] = [
  {
    texto:
      'Uma plataforma que ajuda a mudar o mundo! Tecnologia top! Um time muito massa, com profissionais comprometidos que amam o que fazem.',
    autor: 'Renato Ribeiro',
    organizacao: 'Fundador da Marca Para Mim',
    foto: 'renato-ribeiro',
  },
  {
    texto:
      'Indico a transforme.tech para quem quer, além de um prestador de serviços, um parceiro ministerial. As soluções tecnológicas oferecidas por eles suprem várias carências dentro das organizações missionárias, com preços justos e serviço impecável!',
    autor: 'Rodrigo Gomes',
    organizacao: 'Diretor Executivo da AMTB',
    foto: 'rodrigo-gomes',
  },
  {
    texto:
      'A transforme.tech é uma ferramenta espetacular para organizações missionárias, uma forma simples e organizada de manter informações no mesmo lugar e ter um banco de dados. Além disso, tem uma equipe super solícita que sempre desenvolve novas funcionalidades',
    autor: 'Dani Marçal',
    organizacao: 'Gestora Financeira da Mocidade para Cristo do Brasil',
    foto: 'dani-marcal',
  },
  {
    texto:
      'A transforme.tech chegou em nossa instituição como uma parceira fundamental. A captação de recursos foi potencializada através da plataforma. Campanhas também foram operacionalizadas, em especial neste período de pandemia. Ser assessorada por uma equipe sempre disponível e pronta para ajudar é um diferencial da transforme.tech!',
    autor: 'Márcia Kopanyshyn',
    organizacao: 'Projeto Educacional e Social Casa da Amizade',
    foto: 'marcia-kopanyshyn',
  },
  {
    texto:
      'A transforme.tech começou a trabalhar com a MCM (Missão Cristã Mundial) logo no início da pandemia, exato momento onde o uso da tecnologia teve um papel crucial na arrecadação de recursos online. Parabenizamos o desenvolvimento que ela tem tido a cada dia, também agradecemos a atenção com que sempre nos atendem!',
    autor: 'Newton Marques',
    organizacao: 'Diretor Financeiro da MCM',
    foto: 'newton-marques',
  },
  {
    texto:
      'A transforme.tech veio colaborar com a gestão das doações para a Irmandade Betânia de uma maneira fácil, profissional e transparente. Desde o início da parceria, tivemos ótimos resultados: desde o atendimento, suporte, uso da plataforma e até mesmo espaços personalizados que a organização demandava. Trouxe maiores resultados e transparência à mobilização de recursos da organização!',
    autor: 'Carolina Chueire',
    organizacao: 'Irmandade Betânia',
    foto: 'carolina-chueire',
  },
];
