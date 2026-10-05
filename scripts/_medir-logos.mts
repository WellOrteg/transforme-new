import { chromium } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

const arquivos = readdirSync('public/clientes').filter((f) => f.endsWith('.png'));
const nav = await chromium.launch();
const p = await nav.newPage();
await p.goto('about:blank');

const linhas: any[] = [];
for (const f of arquivos) {
  const b64 = readFileSync(`public/clientes/${f}`).toString('base64');
  linhas.push({
    arquivo: f,
    ...(await p.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = img.naturalWidth;
      cv.height = img.naturalHeight;
      const cx = cv.getContext('2d')!;
      cx.drawImage(img, 0, 0);
      const d = cx.getImageData(0, 0, cv.width, cv.height).data;
      let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1, comAlfa = false;
      for (let y = 0; y < cv.height; y++) {
        for (let x = 0; x < cv.width; x++) {
          const i = (y * cv.width + x) * 4;
          const a = d[i + 3];
          if (a < 250) comAlfa = true;
          const fundo = a < 16 || (d[i] > 244 && d[i + 1] > 244 && d[i + 2] > 244);
          if (!fundo) {
            if (x < x0) x0 = x;
            if (y < y0) y0 = y;
            if (x > x1) x1 = x;
            if (y > y1) y1 = y;
          }
        }
      }
      return {
        original: `${cv.width}x${cv.height}`,
        conteudo: `${x1 - x0 + 1}x${y1 - y0 + 1}`,
        sobra: Math.round((1 - ((x1 - x0 + 1) * (y1 - y0 + 1)) / (cv.width * cv.height)) * 100) + '%',
        alfa: comAlfa,
      };
    }, b64)),
  });
}
console.table(linhas);
await nav.close();
