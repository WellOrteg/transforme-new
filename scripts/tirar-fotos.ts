import { chromium } from '@playwright/test';

const destino = process.argv[2] ?? '.';
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } });

// Meio da sequência de entrada do hero, para ver a orquestração acontecendo.
await pagina.goto('http://localhost:4321/', { waitUntil: 'commit' });
await pagina.waitForTimeout(320);
await pagina.screenshot({ path: `${destino}/entrada-meio.png` });

await pagina.waitForTimeout(1800);
await pagina.screenshot({ path: `${destino}/entrada-fim.png` });

// Cabeçalho depois de rolar, com o fio aceso.
await pagina.evaluate(() => window.scrollTo(0, 500));
await pagina.waitForTimeout(400);
await pagina.screenshot({ path: `${destino}/rolado.png` });

// Uma seção no meio da revelação por rolagem.
await pagina.evaluate(() => document.querySelector('#depoimentos')!.scrollIntoView({ block: 'end' }));
await pagina.waitForTimeout(60);
await pagina.screenshot({ path: `${destino}/revela.png` });

// Estado de repouso do blog, com cartão sob o ponteiro.
await pagina.goto('http://localhost:4321/blog/', { waitUntil: 'networkidle' });
await pagina.waitForTimeout(600);
await pagina.hover('[data-post]:nth-child(2) a');
await pagina.waitForTimeout(500);
await pagina.screenshot({ path: `${destino}/blog-hover.png` });

await navegador.close();
console.log('fotos em ' + destino);
