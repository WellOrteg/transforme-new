# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Site institucional da transforme.tech (plataforma de gestão para organizações sociais e missionárias). Todo o código, comentários, nomes de arquivos/variáveis, testes e mensagens de commit são em **português** — mantenha essa convenção.

## Comandos

```bash
npm run dev          # Astro em http://localhost:4321 (sem as Pages Functions)
npm run build        # gera dist/
npm run cf:dev       # serve dist/ com wrangler + Functions + D1 local (rode build antes; segredos em .dev.vars, ver .dev.vars.exemplo)
npm test             # Vitest (tests/**/*.test.ts)
npm run test:e2e     # Playwright (tests/e2e/*.spec.ts) — faz build + astro preview sozinho
npm run verificar    # test + build + test:e2e — é exatamente o que o CI roda
npm run og           # regenera public/og-padrao.png

npx vitest run tests/validacao.test.ts            # um arquivo Vitest
npx vitest run -t "retorna true"                   # um teste Vitest pelo nome
npx playwright test tests/e2e/home-hero.spec.ts    # um arquivo e2e
npx playwright test -g "duas faixas escuras"       # um teste e2e pelo nome
```

Node >= 22.12. Não há lint separado; o tsconfig é `astro/tsconfigs/strict`.

### Deploy

O projeto Pages `transforme-tech` é de **upload direto** (sem Git conectado): `git push` não publica nada. O Pages não aceita `account_id` no `wrangler.toml`, e o wrangler pode ter em cache (`node_modules/.cache/wrangler/`) uma conta antiga, então passe a conta pela variável:

```bash
npm run build
CLOUDFLARE_ACCOUNT_ID=29642ffb6075399995cad1026e831083 npx wrangler pages deploy dist --project-name transforme-tech --branch main
CLOUDFLARE_ACCOUNT_ID=29642ffb6075399995cad1026e831083 npx wrangler d1 migrations apply transforme-leads --remote   # só quando houver migration nova
```

Aplique as migrations **antes** do `pages deploy`: contato, newsletter e e-book gravam a coluna `origem` (migration 0003), e sem ela todo envio de formulário falha.

Segredos de produção (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) já estão no projeto Pages. A chave pública do Turnstile entra no HTML no build e vem de `.env.production` (versionado); sem ela o widget some e a API recusa todo envio. Falhas da Resend não derrubam o formulário (o lead já está no D1): elas aparecem em `npx wrangler pages deployment tail --project-name transforme-tech`.

O `playwright.config.ts` define `ASTRO_PREVIEW_BACKGROUND=1` porque o Astro 7 detecta execução por agente de IA e manda o `astro preview` para background, o que quebra o `webServer` do Playwright. Não remova.

Testes Vitest que só leem arquivos (ex.: `tests/redirects.test.ts`) ficam em `tests/`, nunca em `tests/e2e/` — o Playwright tenta carregar tudo de lá e a descoberta da suíte inteira quebra.

## Arquitetura

**Site estático Astro 7 + Tailwind 4, hospedado no Cloudflare Pages.** `output: 'static'`; o único código de servidor são as Pages Functions em `functions/`.

- **Formulários (contato e newsletter):** `functions/api/*.ts` → valida com os schemas Zod de `src/lib/validacao.ts` (compartilhados com o front) → confere Turnstile (`functions/_shared/turnstile.ts`) → grava no D1 (`binding DB`, tabela `leads`, `functions/_shared/persistencia.ts`) → envia e-mail via Resend (`_shared/email.ts` + `_shared/modelo-email.ts`). Destinatários comerciais ficam fixos no código; `MAIL_TO` (lista separada por vírgula) só sobrescreve. Os formulários funcionam sem JavaScript (POST nativo) e são aprimorados por `fetch` quando há JS.
- **E-book e painel de leads:** `/ebook/` e `/ebook_doacoes_online/` (link antigo do WordPress) usam `<FormContato ebook />` → `functions/api/ebook.ts`, que grava o lead com `origem = 'ebook'` e a tag de `?parceiro=` e manda ao visitante o link do PDF (`public/ebooks/`). O painel `/admin/leads/` lê `functions/api/admin/leads.ts` e exige o segredo `ADMIN_LEADS_TOKEN` (≥ 32 caracteres). Detalhes em `docs/painel-leads.md`.
- **Origem de cada formulário:** todo lead grava a coluna `origem` (`contato`, `eventos`, `ebook`, `newsletter`), definida **uma única vez** em `src/dados/origens.ts`. Formulário de contato em página nova = `<FormContato origem="..." />` + entrada nova em `ORIGENS`/`ORIGENS_CONTATO` + `<option>` no filtro de `public/admin/leads/index.html` (`tests/origens.test.ts` falha se faltar). A origem aparece no painel e no assunto do e-mail do comercial. Landing pages: `/ebook_doacoes_online/` e `/mais_eventos/` (calculadora em `src/lib/calculadora-eventos.ts`).
- **Migrations D1** em `migrations/` são incrementais e numeradas. A coluna `mensagem` é legado de leads antigos e não deve ser removida.
- **Blog:** coleção `blog` em `src/content.config.ts` (Markdown em `src/content/blog/`, imagens em `src/assets/blog/` referenciadas como `~/assets/blog/...` — alias `~` → `src/`). Os 14 posts vieram do WordPress (`scripts/migrar-wordpress.ts`) e `public/_redirects` mantém os 301 dos slugs antigos.
- **CMS:** Sveltia CMS em `public/admin/` (login via GitHub). As `options` de autor/categoria em `public/admin/config.yml` **precisam bater** com os `enum` `AUTORES`/`CATEGORIAS` de `src/content.config.ts` — `tests/e2e/admin.spec.ts` falha se só um lado mudar. O guia do cliente para publicar está em `docs-cliente/`.
- **Conteúdo da home em dados:** textos repetíveis (FAQ, depoimentos, públicos, soluções, telas, contato) vivem em `src/dados/*.ts`; os componentes em `src/components/home/` só apresentam. O número e a mensagem do WhatsApp comercial existem **uma única vez** em `src/dados/contato.ts` (`linkWhatsApp()`) — nunca duplique.
- **Ordem da home** (`src/pages/index.astro`) segue o roteiro narrativo do cliente; não reordene seções sem mudar o argumento. Specs e planos que motivaram a home atual estão em `docs/superpowers/` (ignorado pelo git).
- **Layout:** `src/layouts/Base.astro` (SEO/OG, GTM, Meta Pixel, cabeçalho, rodapé, botão flutuante do WhatsApp), `Post.astro` e `Documento.astro` (páginas institucionais).

## Restrições verificadas pelos testes

- **Orçamento de JavaScript:** a home envia < 20 KB de JS (`tests/e2e/desempenho.spec.ts`). Turnstile carrega sob demanda. Evite ilhas de framework.
- **Movimento só em CSS** (`src/styles/movimento.css`): anima apenas `transform`/`opacity`, revelação por rolagem via `animation-timeline` (não IntersectionObserver), e todo estado inicial escondido fica dentro de `@media (prefers-reduced-motion: no-preference)`. CLS < 0,02.
- Toda `<img>` declara `width` e `height`.
- **Tokens de cor** em `src/styles/tokens.css` (`@theme` do Tailwind + variáveis semânticas); `tests/tokens.test.ts` confere contraste WCAG. Seções escuras usam `data-tema="escuro"`, e a home tem exatamente duas dentro de `<main>`.
- Acessibilidade verificada com `@axe-core/playwright` nos specs e2e.
