export interface Area {
  /** Casa com o ícone de mesmo id em `IconeArea.astro`. */
  id: string;
  titulo: string;
  itens: string[];
  resultado: string;
}

// O §6 do roteiro do cliente: as capacidades da plataforma não são eliminadas,
// são agrupadas. Cada área termina com o resultado que ela produz — é o que
// mantém a seção falando de benefício, e não de lista de funcionalidade.
export const areas: Area[] = [
  {
    id: 'captacao',
    titulo: 'Captação e Doações',
    itens: [
      'Páginas de Doações online',
      'PIX',
      'Cartão',
      'Recorrência',
      'Vaquinha online',
      'Portal do Doador',
    ],
    resultado: 'mais facilidade para captar e manter doadores.',
  },
  {
    id: 'financeiro',
    titulo: 'Gestão Financeira',
    itens: [
      'Contas a receber',
      'Contas a pagar',
      'Fluxo de caixa',
      'Gestão por Centros de custo',
      'Aprovação de despesas',
      'Dashboards',
      'Relatórios',
    ],
    resultado: 'mais controle e clareza sobre os recursos.',
  },
  {
    id: 'crm',
    titulo: 'Relacionamento e CRM',
    itens: ['WhatsApp', 'Disparos automáticos', 'Comunicação', 'Histórico', 'Atendimento', 'Automação'],
    resultado: 'relacionamentos mais próximos e organizados.',
  },
  {
    id: 'impacto',
    titulo: 'Gestão de Impacto',
    itens: ['Atendidos', 'Projetos', 'Atividades', 'Indicadores', 'Relatórios'],
    resultado: 'transforme atividades em evidências de impacto.',
  },
  {
    id: 'eventos',
    titulo: 'Eventos',
    itens: [
      'Inscrições',
      'Check-in',
      'Página de Eventos',
      'Identificação Facial',
      'Flexível para os vários tipos de eventos',
      'Venda de produtos e serviços',
      'Melhores taxas',
    ],
    resultado: 'menos operação manual e mais organização.',
  },
];
