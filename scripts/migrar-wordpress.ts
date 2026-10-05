import TurndownService from 'turndown';
import { basename } from 'node:path';

export interface PostWP {
  slug: string;
  titulo: string;
  html: string;
  data: string;
  autor: string;
  categoria: string;
  resumo: string;
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  bulletListMarker: '-',
});

turndown.addRule('imagemLocal', {
  filter: 'img',
  replacement: (_conteudo, no) => {
    const el = no as HTMLImageElement;
    const alt = el.getAttribute('alt') ?? '';
    const src = el.getAttribute('src') ?? '';
    return `![${alt}](~/assets/blog/${basename(new URL(src, 'https://transforme.tech').pathname)})`;
  },
});

export function htmlParaMarkdown(html: string): string {
  const semComentarios = html.replace(/<!--[\s\S]*?-->/g, '');
  return turndown
    .turndown(semComentarios)
    .replace(/ /g, ' ')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function montarFrontmatter(p: PostWP): string {
  const citar = (v: string) => (/[:#\-{}[\]&*!|>%@`"']/.test(v) ? `"${v.replace(/"/g, '\\"')}"` : v);
  return [
    '---',
    `titulo: ${citar(p.titulo)}`,
    `resumo: ${citar(p.resumo)}`,
    `data: ${p.data.slice(0, 10)}`,
    `autor: ${p.autor}`,
    `categoria: ${p.categoria}`,
    'rascunho: false',
    '---',
    '',
  ].join('\n');
}

export function gerarRedirects(slugs: string[]): string {
  return slugs
    .filter(Boolean)
    .map((s) => `/${s}/  /blog/${s}/  301`)
    .join('\n');
}

import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'https://transforme.tech/wp-json/wp/v2';
const SITE = 'https://transforme.tech';

async function buscarMapa(rota: 'categories' | 'users'): Promise<Map<number, string>> {
  const r = await fetch(`${BASE}/${rota}?per_page=100&_fields=id,name`);
  const lista = (await r.json()) as { id: number; name: string }[];
  return new Map(lista.map((i) => [i.id, i.name]));
}

// O endpoint /wp/v2/users está bloqueado neste site (401 ao listar, 404 por id -
// hardening comum de segurança do WordPress). O feed RSS público expõe o nome do
// autor em <dc:creator> por post, então usamos isso como alternativa, indexado
// por slug. Confirmado manualmente contra a API ao vivo antes de codificar isto.
async function buscarAutoresViaFeed(): Promise<Map<string, string>> {
  const mapa = new Map<string, string>();
  for (let pagina = 1; pagina <= 10; pagina++) {
    const url = pagina === 1 ? `${SITE}/feed/` : `${SITE}/feed/?paged=${pagina}`;
    const r = await fetch(url);
    if (!r.ok) break;
    const xml = await r.text();
    const itens = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    if (itens.length === 0) break;
    for (const item of itens) {
      const link = (item.match(/<link>(.*?)<\/link>/) ?? [])[1] ?? '';
      const creator = (item.match(/<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>/) ?? [])[1] ?? '';
      const slug = link.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '');
      if (slug && creator) mapa.set(slug, creator);
    }
  }
  return mapa;
}

// O excerpt.rendered do WordPress traz entidades HTML (&nbsp;, &#8220; etc.) que
// sobrevivem à remoção de tags por regex. Sem isso o resumo do frontmatter fica
// com lixo tipo "&nbsp;" literal no meio do texto. Cobre só as entidades vistas
// nos 14 posts reais, não é um decoder genérico.
function decodificarEntidades(texto: string): string {
  return texto
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8230;/g, '…')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

async function migrar(): Promise<void> {
  const [categorias, autoresPorSlug] = await Promise.all([buscarMapa('categories'), buscarAutoresViaFeed()]);

  const r = await fetch(`${BASE}/posts?per_page=100&_embed=false`);
  const posts = (await r.json()) as any[];

  mkdirSync('src/content/blog', { recursive: true });
  mkdirSync('src/assets/blog', { recursive: true });

  const slugs: string[] = [];

  for (const p of posts) {
    const post: PostWP = {
      slug: p.slug,
      titulo: p.title.rendered.replace(/&#8217;/g, '’').replace(/&amp;/g, '&'),
      html: p.content.rendered,
      data: p.date,
      autor: autoresPorSlug.get(p.slug) ?? 'transforme',
      categoria: categorias.get(p.categories?.[0]) ?? 'Tecnologia',
      resumo: decodificarEntidades(p.excerpt.rendered.replace(/<[^>]+>/g, '')).slice(0, 200),
    };

    // Baixar as imagens referenciadas antes de reescrever os caminhos
    for (const m of post.html.matchAll(/src="(https:\/\/transforme\.tech\/wp-content\/uploads\/[^"]+)"/g)) {
      const url = m[1];
      const nome = url.split('/').pop()!;
      const img = await fetch(url);
      writeFileSync(`src/assets/blog/${nome}`, Buffer.from(await img.arrayBuffer()));
    }

    writeFileSync(
      `src/content/blog/${post.slug}.md`,
      montarFrontmatter(post) + '\n' + htmlParaMarkdown(post.html) + '\n',
    );
    slugs.push(post.slug);
    console.log(`migrado: ${post.slug}`);
  }

  mkdirSync('public', { recursive: true });
  writeFileSync('public/_redirects', gerarRedirects(slugs) + '\n');
  console.log(`\n${slugs.length} posts migrados`);
}

if (process.argv[1]?.endsWith('migrar-wordpress.ts')) {
  await migrar();
}
