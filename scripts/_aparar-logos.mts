// Prepara os logos de public/clientes/ para a faixa da home.
//
// 1. Apara a moldura vazia do arquivo original. Sem isso a caixa da imagem
//    inclui a sobra e a marca aparece muito menor que a altura pedida no CSS —
//    cada logo encolhendo numa proporção diferente.
// 2. Reduz para o dobro da altura em que o logo é exibido. Os arquivos vinham
//    do site antigo com até 1280px de lado para renderizar a 68px.
//
// A altura de exibição repete a conta de FaixaLogos.astro (normalização pela
// área). Sobrescreve os arquivos; o original está no git.
import { chromium } from '@playwright/test';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';

const REFERENCIA = 92;
const DENSIDADE = 2;

const arquivos = readdirSync('public/clientes').filter((f) => f.endsWith('.png'));
const nav = await chromium.launch();
const p = await nav.newPage();
await p.goto('about:blank');

const linhas: unknown[] = [];
for (const f of arquivos) {
  const antes = statSync(`public/clientes/${f}`).size;
  const b64 = readFileSync(`public/clientes/${f}`).toString('base64');
  const r = await p.evaluate(async ([b64, ref, dens]) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + (b64 as string);
    await img.decode();
    const cv = document.createElement('canvas');
    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    const cx = cv.getContext('2d')!;
    cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, cv.width, cv.height).data;
    let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
    for (let y = 0; y < cv.height; y++) {
      for (let x = 0; x < cv.width; x++) {
        const i = (y * cv.width + x) * 4;
        const a = d[i + 3];
        // Fundo = transparente ou quase branco: nos dois casos some na faixa clara.
        const fundo = a < 16 || (d[i] > 244 && d[i + 1] > 244 && d[i + 2] > 244);
        if (!fundo) {
          if (x < x0) x0 = x;
          if (y < y0) y0 = y;
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        }
      }
    }
    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;
    const exibida = Math.round(Math.min(68, Math.max(44, (ref as number) / Math.sqrt(w / h))));
    const alvoH = Math.min(h, exibida * (dens as number));
    const alvoW = Math.round((w * alvoH) / h);
    const saida = document.createElement('canvas');
    saida.width = alvoW;
    saida.height = alvoH;
    const sx = saida.getContext('2d')!;
    sx.imageSmoothingQuality = 'high';
    sx.drawImage(cv, x0, y0, w, h, 0, 0, alvoW, alvoH);
    return { original: `${cv.width}x${cv.height}`, w: alvoW, h: alvoH, exibida, dados: saida.toDataURL('image/png') };
  }, [b64, REFERENCIA, DENSIDADE] as const);

  writeFileSync(`public/clientes/${f}`, Buffer.from(r.dados.split(',')[1], 'base64'));
  linhas.push({
    arquivo: f,
    original: r.original,
    arquivado: `${r.w}x${r.h}`,
    exibido: `${r.exibida}px de altura`,
    peso: `${Math.round(antes / 1024)}kB → ${Math.round(statSync(`public/clientes/${f}`).size / 1024)}kB`,
  });
}
console.table(linhas);
await nav.close();
