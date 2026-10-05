# Painel de leads

Acesse `/admin/leads/`. A senha é o segredo `ADMIN_LEADS_TOKEN` (no mínimo 32 caracteres aleatórios). O painel mantém a senha apenas na memória da aba; recarregar ou sair exige nova autenticação. Nenhum dado de lead é incluído no HTML público. A API exige a senha e não permite cache.

## Configuração

Local: configure `ADMIN_LEADS_TOKEN` em `.dev.vars`, aplique `npx wrangler d1 migrations apply transforme-leads --local` e reinicie o Wrangler.

Produção: aplique `npx wrangler d1 migrations apply transforme-leads --remote` antes de publicar. Configure `ADMIN_LEADS_TOKEN` nos segredos do projeto Cloudflare Pages (ou `npx wrangler pages secret put ADMIN_LEADS_TOKEN --project-name transforme-tech`). Use um segredo diferente do ambiente local. Publique o build e as Functions após configurar o segredo.

O admin do blog continua em `/admin/`; o painel de leads fica em `/admin/leads/`, fora dos menus públicos.

## Atribuição

Tanto `/ebook/` quanto `/ebook_doacoes_online/` aceitam `?parceiro=ricardo_baboo`, `?parceiro=fife_2026`, `?parceiro=sits_2026` e novos identificadores com até 80 letras sem acentos, números, hífens ou sublinhados. A tag é normalizada para minúsculas. Sem tag, o cadastro fica sem parceiro. Não há atribuição persistente entre páginas ou visitas: vale a tag da página em que o formulário foi enviado.

Os números contam cadastros, não visitantes únicos nem entregas de e-mail. A tag é informada no link pelo navegador, não comprova indicação para fins de comissão. Cadastros antigos não têm parceiro retroativo. O painel permite filtrar a origem e o parceiro, paginar e exportar todos os resultados do filtro em CSV.

## Origem dos formulários

Cada formulário grava de qual página veio, na coluna `origem`, e o painel filtra por ela:

| Origem | Formulário |
|---|---|
| `contato` | Contato da home |
| `eventos` | Landing page de eventos (`/mais_eventos/`) |
| `ebook` | E-book Guia de doações (`/ebook/` e `/ebook_doacoes_online/`) |
| `newsletter` | Newsletter do rodapé |

A lista fica em `src/dados/origens.ts`. O e-mail que chega ao comercial traz a linha "Formulário" e, fora da home, o nome da página no assunto. Leads gravados antes da migração 0003 não têm origem e aparecem como `contato` ou `newsletter`, conforme o tipo.
