# Auditoria e implementação de SEO — transforme.tech

Data: 4 de novembro de 2026. Mercado considerado: Brasil, português brasileiro.

## Resultado e escopo

Foi implementada uma base de SEO técnico e conteúdo comercial no projeto Astro existente. A versão local contém 25 páginas canônicas, 14 artigos preservados e três novas páginas de soluções. A publicação depende da autenticação da Cloudflare: a consulta de deployments pelo Wrangler retornou ausência de credencial. Nenhuma publicação foi confirmada nesta execução.

A pesquisa inclui documentação oficial de Google, OpenAI e Bing, observação de concorrentes brasileiros, revisão da estrutura dos 14 artigos, inspeção do código e dos arquivos gerados, testes HTTP públicos e o relatório Semrush enviado. Não houve acesso autenticado ao Search Console, Bing Webmaster Tools, GA4 ou à base completa do Semrush. Não foram medidos volumes de palavras-chave, dificuldade, conversões orgânicas ou posições reais no Google Brasil. As oportunidades abaixo são hipóteses de intenção e aderência ao produto, não estimativas de volume.

## Leitura do relatório enviado

O print mostra autoridade 25, tráfego orgânico estimado 373, 68 palavras-chave, 531 domínios de referência e cerca de 9,6 mil backlinks. Em IA, mostra visibilidade 14, uma menção e duas páginas citadas. São métricas da ferramenta, não visitantes ou resultados certificados pelo Google.

O panorama mundial e os quadros de pesquisa orgânica com bandeira dos Estados Unidos não devem ser misturados como se representassem o Brasil. Os concorrentes sugeridos no print compartilham nomes semelhantes; isso não prova disputa pelo mesmo comprador. A queda na curva de palavras-chave exige comparação por país, URL e consulta no Search Console antes de atribuir uma causa.

Os exemplos de páginas com 403 são principalmente subdomínios de organizações clientes. Não pertencem às rotas deste projeto. Avaliar cada campanha e seu estado de publicação antes de liberar indexação ou redirecionar. Uma campanha privada ou encerrada não deve ser aberta somente para recuperar métricas.

## Diagnóstico técnico e correções

| Item | Evidência inicial | Implementação ou conclusão |
| --- | --- | --- |
| Renderização | Astro estático | Mantida; conteúdo e links disponíveis sem JavaScript |
| Home | Título centrado no slogan | Título explicita sistema de gestão para ONGs e doações; descrição mantém organizações sociais e missionárias |
| Entidade | Sem grafo global de organização/site | Organization, WebSite e WebPage com identificadores estáveis e perfis sociais já existentes |
| E-book | Duas URLs com o mesmo conteúdo no sitemap | Canonical de ambas aponta para `/ebook/`; alias legado sai do sitemap e preserva parâmetros de parceiros |
| Canonical | URL baseada diretamente no pathname | Origem única, remoção de query/fragmento e convenção de barra final |
| Artigos | BlogPosting básico; autor institucional como pessoa | Autor institucional corrigido; publisher vinculado à entidade; categoria, idioma e imagem real quando disponível |
| Navegação do blog | Sem relacionados ou trilha | Breadcrumbs visíveis e estruturados; três artigos relacionados; links comerciais |
| Links antigos | Conteúdo apontava para slugs anteriores do WordPress | Links internos diretos aos destinos finais; redirect do antigo guia para o e-book |
| Sitemap | Incluía alias do e-book | Apenas URLs canônicas; exclui admin, 404 e alias |
| Robots | Público permitido, admin bloqueado | Mantida permissão geral, adicionada exclusão de API; bots de busca, incluindo OAI-SearchBot, herdam a regra pública |
| Página 404 | Sem noindex explícito | Meta noindex; header para o arquivo 404 |
| Administração | Área não editorial | Headers noindex para `/admin/*`; restrições existentes preservadas |
| Compartilhamento | OG básico | Nome do site, texto alternativo, metadados Twitter e imagem de capa do artigo quando existente |
| HTML do head | Pixel noscript com imagem dentro do head | Imagem movida ao body para preservar a interpretação do head sem JavaScript |
| Regressões | Testes pontuais de SEO | Auditoria de todas as URLs do sitemap integrada ao comando de CI |

O JSON-LD é serializado escapando `<`, evitando que conteúdo editorial encerre sua tag de script. Não foram inventados preços, avaliações, estrelas, certificações, endereços, datas de atualização ou resultados de clientes.

Testes públicos com curl confirmaram robots e sitemap acessíveis, HTTP → HTTPS com 301, www → domínio principal com 301 e URL inexistente com 404. Requisições por Python retornaram 403, mas isso não se reproduziu em curl. Essa divergência não comprova bloqueio do Googlebot. Validar requests de bots reais nos registros da CDN e na inspeção de URL do Search Console; não desativar proteções globalmente com base em user-agent simulado.

## Pesquisa de mercado e mapa de intenção

A [Doare](https://doare.org/) organiza sua oferta por captação, relacionamento e infraestrutura, com destinos para funcionalidades e causas. A [Utilis](https://utilis.com.br/) explicita gestão de ONGs, módulos, implantação e migração. Essas observações indicam a utilidade de responder às perguntas de avaliação do comprador. Não equivalem a uma análise de ranking nem comprovam as alegações comerciais desses fornecedores.

| Prioridade | Grupo de consultas a acompanhar | Intenção | Destino |
| --- | --- | --- | --- |
| Alta | transforme.tech, transforme tech | Marca | `/` |
| Alta | sistema de gestão para ONGs, software para OSC, sistema terceiro setor | Avaliação comercial | `/sistema-gestao-ongs/` |
| Alta | plataforma de doações online, doações recorrentes para ONGs, página de doação | Avaliação comercial | `/doacoes-online/` |
| Alta | sistema para agência missionária, gestão missionária, apadrinhamento missionário | Avaliação comercial específica | `/gestao-organizacoes-missionarias/` |
| Média | inscrições online para eventos, plataforma de inscrições | Avaliação comercial | `/mais_eventos/` existente |
| Média | como escolher sistema para ONG | Informação antes da compra | `/blog/sistema-de-gestao-terceiro-setor/` |
| Média | como criar campanha de doação, captação de recursos online | Planejamento | `/blog/guia-definitivo-para-campanhas-de-doacoes-online/` |
| Média | Pix para ONGs, doação Pix recorrente | Informação sobre modalidades | `/blog/novas-modalidades-de-pix-para-ongs/` |
| Média | guia doações online, e-book captação | Material educativo | `/ebook/` |

As páginas novas explicam processos, requisitos, implantação e limites comerciais usando informações já publicadas no projeto. Cada uma tem finalidade distinta; não foram criadas variações por cidade ou páginas repetidas para cada sinônimo. Os artigos continuam como apoio informativo, ligados às páginas comerciais. Medir se o Google escolhe uma URL diferente para cada grupo antes de decidir por fusões ou redirecionamentos adicionais.

## Busca por IA

O [guia atual do Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) prioriza rastreamento, indexação, conteúdo útil e clareza; desaconselha tratar `llms.txt` e menções artificiais como atalhos. Também orienta conferir a inclusão nos recursos generativos e acompanhar o relatório correspondente no Search Console. Não existe promessa de seleção ou citação.

A [orientação da OpenAI para publishers](https://help.openai.com/en/articles/12627856) pede acesso do OAI-SearchBot para descoberta e uso em resumos. A regra pública atual permite esse acesso; CDN/WAF ainda precisam ser conferidos com tráfego real. Nenhuma preferência de treinamento foi alterada como requisito para busca.

O [Bing Webmaster Tools](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/) oferece acompanhamento de citações em experiências de IA suportadas. Citação, visita e lead são medidas diferentes e devem ser acompanhadas separadamente.

As perguntas e respostas novas são visíveis e correspondem ao schema. O FAQPage serve para descrição semântica: o [registro de atualizações do Google](https://developers.google.com/search/updates) informa que o resultado enriquecido de FAQ deixou de ser exibido em 2026. Não prometer destaque de FAQ na pesquisa por causa dessa marcação.

## Revisão editorial dos 14 artigos

Todos receberam as melhorias do layout, links relacionados, metadados e identificação da autoria. Links legados foram corrigidos em seis arquivos. Datas originais foram preservadas.

| Artigo | Próxima ação editorial |
| --- | --- |
| Sistema de gestão para terceiro setor | Prioridade alta: incluir um exemplo real de avaliação e revisar a repetição do início; manter finalidade informativa |
| Guia definitivo para campanhas | Prioridade alta: acrescentar exemplo autorizado com objetivo, execução e resultado, com evidências |
| Novas modalidades de Pix | Prioridade alta: revisão do responsável por pagamentos sobre disponibilidade de cada modalidade e condições vigentes |
| Diga não ao Pix | Prioridade alta: avaliar título e argumento à luz do conteúdo mais recente de Pix; evitar aparente contradição entre páginas |
| Captação de recursos e tecnologia | Atualizar exemplos com experiência real da equipe e referências verificáveis |
| Dashboard de captação | Identificar claramente que as telas e a versão 12 são históricas antes de apresentar como demonstração atual |
| Novo recurso: mural online | Conferir interface e disponibilidade atuais com produto |
| Atendimento em vulnerabilidade e crise | Conferir data editorial: publicação de 2021 contém referência posterior a enchentes; não inventar data de revisão |
| Google Meet | Tema periférico e tutorial antigo; revisar com documentação oficial se houver tráfego qualificado, sem exclusão automática |
| Lives e arrecadação | Atualizar orientações operacionais com uma experiência verificável |
| Parceria icons4u | Manter registro histórico; confirmar vigência antes de transformar em promessa comercial |
| Cinco anos de transformação | Preservar notícia de aniversário de 2021, sem reescrever sua data para parecer atual |
| Bem-vindo ao blog | Preservar contexto institucional e acompanhar utilidade/entradas |
| Como atrair oportunidades | Tema periférico; decidir com dados se merece atualização, sem apagar URL por baixa aderência aparente |

Reescritas que alteram afirmações do produto, resultados, história ou autoria precisam de informação factual da equipe. Esta entrega não simula revisão especializada nem acrescenta datas recentes a conteúdo antigo para sugerir frescor.

## Publicação e verificação externa

1. Autenticar no terminal com `npx wrangler login`; não registrar tokens no repositório ou no chat.
2. Executar `npm run verificar`.
3. No PowerShell, definir `$env:CLOUDFLARE_ACCOUNT_ID='29642ffb6075399995cad1026e831083'` e executar `npx wrangler pages deploy dist --project-name transforme-tech --branch main`. O projeto usa upload direto; git push não publica. Esta entrega não exige migration.
4. Conferir no domínio público as três páginas novas, canonical do e-book legado, robots, sitemap, redirects e headers de admin/404. O Astro preview não executa regras de Cloudflare `_redirects`/`_headers`.
5. Na propriedade correta do Search Console, enviar `https://transforme.tech/sitemap-index.xml`, inspecionar home e páginas novas e verificar canonical escolhido, disponibilidade para indexação e recursos generativos. O envio não garante inclusão.
6. No Bing Webmaster Tools, verificar/importar a propriedade e cadastrar o mesmo sitemap; acompanhar indexação e AI Performance.
7. Verificar os relatórios de experiência real. Os testes locais de JS, CLS e responsividade não equivalem aos dados de campo de [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals).

## Plano de acompanhamento de 90 dias

| Período após publicação | Trabalho | Evidência de conclusão |
| --- | --- | --- |
| Primeira semana | Validar deploy, sitemap e inspeções; registrar linha de base dos últimos 28/90 dias por país/dispositivo | Exportações GSC/Bing e URLs de produção verificadas |
| Semanas 2–4 | Acompanhar descoberta, indexação e canonical; revisar os artigos prioritários com produto | Problemas identificados e corrigidos com evidências |
| Segundo mês | Publicar estudo de caso autorizado e demonstração contextualizada; melhorar páginas com impressões e baixo CTR | Caso com fonte, período e métricas; comparação por consulta/URL |
| Terceiro mês | Comparar leads orgânicos qualificados, consultas sem marca e citações; ampliar só os temas com demanda demonstrada | Relatório comparável, sem confundir sazonalidade com efeito das alterações |

Registrar cliques orgânicos, impressões, CTR, posição por consulta e país, páginas indexadas, origem dos leads e conversão para contato. Para IA, registrar páginas citadas e referências de tráfego quando disponíveis. As tags GTM existentes foram preservadas, mas configuração de eventos/conversões no painel não foi acessada.

Para autoridade externa, priorizar estudos de caso autorizados com clientes, perfis institucionais consistentes e referências editoriais relevantes. Os 9,6 mil backlinks do print não provam qualidade nem penalidade. Não comprar links, não solicitar disavow em massa e não apagar subdomínios sem diagnóstico. Nenhum contato com terceiros foi enviado.

## Evidências reproduzíveis

- `npm test`: 83 testes unitários passaram.
- Build estático: 27 páginas geradas, incluindo alias e 404; 25 URLs canônicas no sitemap.
- `npm run seo:auditar`: verifica todo o sitemap, títulos/descrições únicos, canonical, H1, idioma, JSON-LD, imagens, links e âncoras; relatório em `artifacts/seo/auditoria.json`.
- Testes de navegador incluem conteúdo sem JavaScript, mobile de 390 px, desktop de 1440 px, acessibilidade, navegação, formulários e desempenho.
- Capturas das três páginas novas ficam em `artifacts/seo/`. Esses arquivos locais são ignorados no Git.

Limites: resultados orgânicos e de IA dependem de rastreamento, concorrência, qualidade continuada e sinais externos. Publicação, verificação de contas, dados de campo e métricas pós-publicação não foram confirmados nesta entrega local.
