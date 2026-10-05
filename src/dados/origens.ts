// De qual formulário veio cada lead. O valor vai para a coluna `origem` da
// tabela `leads`, para o filtro do painel /admin/leads/ e para o e-mail do
// comercial. Página nova com formulário = uma entrada nova aqui; as opções do
// painel (public/admin/leads/index.html) precisam acompanhar, e
// tests/origens.test.ts falha se só um lado mudar.
export const ORIGENS = {
  contato: 'Home — formulário de contato',
  eventos: 'Landing page de eventos (/mais_eventos/)',
  ebook: 'E-book Guia de doações',
  newsletter: 'Newsletter do rodapé',
} as const;

export type Origem = keyof typeof ORIGENS;

// As origens que chegam por /api/contato, num campo escondido do formulário.
export const ORIGENS_CONTATO = ['contato', 'eventos'] as const satisfies readonly Origem[];
export type OrigemContato = (typeof ORIGENS_CONTATO)[number];

export function ehOrigem(valor: unknown): valor is Origem {
  return typeof valor === 'string' && Object.hasOwn(ORIGENS, valor);
}

// Um POST sem o campo (cliente antigo em cache, envio manual) continua
// valendo como contato da home; valor desconhecido também, em vez de perder o lead.
export function origemDoContato(valor: unknown): OrigemContato {
  return (ORIGENS_CONTATO as readonly unknown[]).includes(valor) ? (valor as OrigemContato) : 'contato';
}
