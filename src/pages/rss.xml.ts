import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.rascunho)).sort(
    (a, b) => b.data.data.valueOf() - a.data.data.valueOf(),
  );

  return rss({
    title: 'transforme.tech — Conteúdos',
    description: 'Captação de recursos, gestão e tecnologia para quem transforma realidades.',
    site: context.site!,
    customData: '<language>pt-br</language>',
    items: posts.map((p) => ({
      title: p.data.titulo,
      description: p.data.resumo,
      pubDate: p.data.data,
      link: `/blog/${p.id}/`,
      categories: [p.data.categoria],
      author: p.data.autor,
    })),
  });
}
