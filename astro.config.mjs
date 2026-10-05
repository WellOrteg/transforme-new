import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://transforme.tech',
  output: 'static',
  integrations: [sitemap({ filter: (p) => !p.includes('/admin') })],
  vite: {
    plugins: [tailwindcss()],
    // Convenção usada pela migração do WordPress (Task 9) para referenciar
    // src/assets/ a partir do corpo Markdown dos posts: ~/assets/blog/arquivo.png
    resolve: { alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) } },
  },
});
