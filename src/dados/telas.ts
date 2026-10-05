import type { ImageMetadata } from 'astro';

export interface Tela {
  /** Casa com o `data-painel` e o id do radio na galeria. */
  id: string;
  nome: string;
  chamada: string;
  /**
   * Captura real da tela. Normalmente basta salvar o arquivo em
   * `src/assets/site/telas/tela-<id>.png`; GaleriaTelas.astro encontra o arquivo
   * sozinho. Este campo fica disponível para um caso excepcional que precise
   * importar uma imagem de outro lugar.
   */
  imagem?: ImageMetadata;
}

// O §9 do roteiro pede o percurso Dashboard → Doações → Financeiro → CRM →
// Impacto, com uma chamada curta explicando cada tela.
//
// As capturas reais entram automaticamente quando salvas em
// `src/assets/site/telas/tela-<id>.png` (também vale jpg, jpeg ou webp). O
// Dashboard foge à regra da moldura vazia porque GaleriaTelas.astro dá a ele, e
// só a ele, o painel desenhado em PainelAnimado.astro — que é honesto sobre ser
// um desenho, não uma captura, então não precisa esperar o arquivo chegar.
//
// Para acrescentar uma TELA NOVA (não só uma imagem numa tela já existente), as
// três listas de ids seletor por seletor no `<style>` de GaleriaTelas.astro
// também precisam ganhar a linha da tela nova; ver o comentário lá.
export const telas: Tela[] = [
  {
    id: 'dashboard',
    nome: 'Dashboard',
    chamada: 'A visão do mês inteiro numa tela: entradas, metas e o que precisa de atenção.',
  },
  {
    id: 'doacoes',
    nome: 'Doações',
    chamada: 'Doações avulsas e recorrentes, por Pix, cartão ou boleto, com a origem de cada uma.',
  },
  {
    id: 'financeiro',
    nome: 'Financeiro',
    chamada: 'Contas a pagar e a receber, fluxo de caixa e centros de custo no mesmo lugar.',
  },
  {
    id: 'crm',
    nome: 'CRM',
    chamada: 'O histórico de cada doador e as conversas de WhatsApp ligadas ao cadastro.',
  },
  {
    id: 'impacto',
    nome: 'Impacto',
    chamada: 'Atendimentos, projetos e indicadores que viram relatório sem trabalho extra.',
  },
];
