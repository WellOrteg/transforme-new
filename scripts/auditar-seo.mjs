import { readFile, access, writeFile, mkdir } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const origem = 'https://transforme.tech';
const sitemap = await readFile('dist/sitemap-0.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
const erros = [];
const paginas = [];
const titulos = new Set();
const descricoes = new Set();
const documentos = new Map();
async function documento(rota) {
  if (!documentos.has(rota)) documentos.set(rota, new JSDOM(await readFile(`dist${rota}index.html`, 'utf8')).window.document);
  return documentos.get(rota);
}
for (const url of urls) {
  const rota = new URL(url).pathname;
  const doc = await documento(rota);
  const verificar = (condicao, mensagem) => { if (!condicao) erros.push(`${rota}: ${mensagem}`); };
  const titulo = doc.title;
  const descricao = doc.querySelector('meta[name="description"]')?.content;
  const canonical = doc.querySelector('link[rel="canonical"]')?.href;
  verificar(titulo && !titulos.has(titulo), 'título vazio ou duplicado');
  verificar(descricao && !descricoes.has(descricao), 'descrição vazia ou duplicada');
  titulos.add(titulo); descricoes.add(descricao);
  verificar(canonical === url, `canonical divergente: ${canonical}`);
  verificar(doc.querySelectorAll('link[rel="canonical"]').length === 1, 'canonical deve ser único');
  verificar(doc.querySelectorAll('h1').length === 1, 'deve haver um H1');
  verificar(!doc.querySelector('meta[name="robots"]')?.content.includes('noindex'), 'noindex no sitemap');
  verificar(doc.documentElement.lang === 'pt-BR', 'idioma ausente');
  verificar(doc.querySelector('main')?.textContent.trim().length > 200, 'conteúdo HTML insuficiente');
  let esquemas = [];
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    try { const dados = JSON.parse(script.textContent); esquemas.push(...(dados['@graph'] ?? [dados])); }
    catch { verificar(false, 'JSON-LD inválido'); }
  }
  verificar(esquemas.some((e) => e['@type'] === 'Organization'), 'Organization ausente');
  for (const img of doc.querySelectorAll('main img')) {
    verificar(img.hasAttribute('alt'), `imagem sem alt: ${img.src}`);
    verificar(img.hasAttribute('width') && img.hasAttribute('height'), `imagem sem dimensões: ${img.src}`);
  }
  for (const a of doc.querySelectorAll('a[href]')) {
    const destino = new URL(a.getAttribute('href'), url);
    if (destino.origin !== origem) continue;
    const caminho = decodeURIComponent(destino.pathname);
    try {
      await access(`dist${caminho}${caminho.endsWith('/') ? 'index.html' : ''}`);
      if (destino.hash && caminho.endsWith('/')) {
        verificar((await documento(caminho)).getElementById(decodeURIComponent(destino.hash.slice(1))), `âncora inexistente: ${destino.href}`);
      }
    } catch { verificar(false, `link interno sem destino direto: ${destino.href}`); }
  }
  const imagem = doc.querySelector('meta[property="og:image"]')?.content;
  verificar(!!imagem, 'imagem social ausente');
  if (imagem && new URL(imagem).origin === origem) {
    try { await access(`dist${new URL(imagem).pathname}`); } catch { verificar(false, 'imagem social inexistente'); }
  }
  paginas.push({ url, titulo, descricao, canonical, esquemas: esquemas.map((e) => e['@type']) });
}
const alias = await documento('/ebook_doacoes_online/');
if (alias.querySelector('link[rel="canonical"]')?.href !== `${origem}/ebook/`) erros.push('E-book legado sem canonical consolidado');
if (urls.some((u) => /\/admin|\/404|\/ebook_doacoes_online/.test(u))) erros.push('URL não canônica no sitemap');
const pagina404 = new JSDOM(await readFile('dist/404.html', 'utf8')).window.document;
if (!pagina404.querySelector('meta[name="robots"]')?.content.includes('noindex')) erros.push('404 sem noindex');
await mkdir('artifacts/seo', { recursive: true });
await writeFile('artifacts/seo/auditoria.json', JSON.stringify({ paginas: paginas.length, erros, inventario: paginas }, null, 2));
console.log(`${paginas.length} páginas canônicas auditadas; ${erros.length} erros.`);
for (const erro of erros) console.error(erro);
if (erros.length) process.exitCode = 1;
