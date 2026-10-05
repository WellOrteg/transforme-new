import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npm run build && npx astro preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    // Astro 7 detecta execução por agentes de IA e força `astro preview` para
    // um processo daemon em background (ver node_modules/astro/dist/cli/preview/index.js,
    // isRunByAgent()). Isso quebra o gerenciamento de webServer do Playwright,
    // que espera o processo do comando permanecer em primeiro plano até ser
    // encerrado. ASTRO_PREVIEW_BACKGROUND desliga essa detecção.
    env: { ASTRO_PREVIEW_BACKGROUND: '1' },
  },
});
