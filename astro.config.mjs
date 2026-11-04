import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://transforme.tech',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (p) => !['/admin', '/404', '/ebook_doacoes_online'].some((rota) => new URL(p).pathname.startsWith(rota)) })],
  vite: {
    plugins: [tailwindcss()],
    // Convenção usada pela migração do WordPress (Task 9) para referenciar
    // src/assets/ a partir do corpo Markdown dos posts: ~/assets/blog/arquivo.png
    resolve: { alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) } },
  },
});
