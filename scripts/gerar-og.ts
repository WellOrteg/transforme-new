/**
 * Gera public/og-padrao.png (1200×630) renderizando a marca no Chromium do
 * Playwright — sem dependência nova de imagem, e reprodutível: rodar de novo
 * devolve o mesmo arquivo.
 *
 *   npx tsx scripts/gerar-og.ts   (ou: npm run og)
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = new URL('..', import.meta.url);
const fonte = readFileSync(fileURLToPath(new URL('public/fonts/NeueMachina-Regular.woff2', raiz))).toString('base64');
const inter = readFileSync(fileURLToPath(new URL('public/fonts/InterVariable.woff2', raiz))).toString('base64');

// Os dois arcos do símbolo, na mesma geometria travada por tests/marca.test.ts.
const ARCOS = `
  <path d="M 140.75 18.25 A 176.25 176.25 0 0 1 140.75 370.75" stroke-width="36.5" />
  <path d="M 140.75 317.5 A 123 123 0 0 1 140.75 71.5" stroke-width="35.5" />`;
const SORRISO = `<path d="M 95.65 170.7 A 60.75 60.75 0 0 0 217.15 170.7" stroke-width="32.5" />`;

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" /><style>
  @font-face { font-family: 'Neue Machina'; src: url(data:font/woff2;base64,${fonte}) format('woff2'); }
  @font-face { font-family: 'Inter'; src: url(data:font/woff2;base64,${inter}) format('woff2-variations'); font-weight: 100 900; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #05032C; position: relative; overflow: hidden;
         font-family: 'Inter', system-ui; color: #fff; }
  /* Mesmo glow do hero: roxo desfocado atrás do canto direito. */
  .glow { position: absolute; width: 900px; height: 900px; right: -260px; top: -300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(127,86,218,.55) 0%, rgba(105,62,204,.18) 45%, transparent 70%); }
  .grafismo { position: absolute; right: -60px; bottom: -170px; height: 820px; opacity: .16;
              fill: none; stroke: #A992FF; }
  .conteudo { position: absolute; inset: 0; padding: 86px 96px; display: flex; flex-direction: column;
              justify-content: space-between; }
  .marca { display: flex; align-items: center; gap: 16px; }
  .marca svg { height: 56px; fill: none; stroke: #fff; }
  .marca span { font-family: 'Neue Machina'; font-size: 34px; letter-spacing: -0.01em; }
  h1 { font-family: 'Neue Machina'; font-weight: 400; font-size: 82px; line-height: 1.06;
       letter-spacing: -0.025em; max-width: 15ch; }
  h1 em { font-style: normal; color: #A992FF; }
  .rodape { font-size: 26px; color: #C8C3E6; letter-spacing: .01em; }
</style></head><body>
  <div class="glow"></div>
  <svg class="grafismo" viewBox="0 0 335.25 389">${ARCOS}</svg>
  <div class="conteudo">
    <div class="marca">
      <svg viewBox="0 0 335.25 389">${ARCOS}${SORRISO}</svg>
      <span>transforme.tech</span>
    </div>
    <h1>Menos burocracia,<br /><em>mais transformação</em></h1>
    <div class="rodape">Gestão, captação de recursos e tecnologia para o terceiro setor</div>
  </div>
</body></html>`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await pagina.setContent(html, { waitUntil: 'load' });
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: fileURLToPath(new URL('public/og-padrao.png', raiz)) });
await navegador.close();
console.log('public/og-padrao.png gerado — 1200×630');
