export const SITE = 'https://transforme.tech';

/** URLs públicas consistentes entre canonical, sitemap e dados estruturados. */
export function urlCanonica(caminho: string): string {
  const url = new URL(caminho, SITE);
  const rota = url.pathname.replace(/\/+$/, '');
  return `${SITE}${rota || ''}/`;
}

/** Evita que conteúdo editorial encerre a tag script de JSON-LD. */
export function serializarJsonLd(dados: unknown): string {
  return JSON.stringify(dados).replace(/</g, '\\u003c');
}

export const organizacao = {
  '@type': 'Organization',
  '@id': `${SITE}/#organizacao`,
  name: 'transforme.tech',
  url: `${SITE}/`,
  description: 'Plataforma de gestão, doações online e impacto para organizações sociais e missionárias.',
  sameAs: [
    'https://instagram.com/transforme.tech',
    'https://linkedin.com/company/transforme-tech',
    'https://facebook.com/transforme.tech',
    'https://www.youtube.com/@transformetech',
  ],
};
