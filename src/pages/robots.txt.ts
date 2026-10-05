import type { APIContext } from 'astro';

export function GET({ site }: APIContext): Response {
  const corpo = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    '',
    `Sitemap: ${new URL('sitemap-index.xml', site).href}`,
    '',
  ].join('\n');

  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
