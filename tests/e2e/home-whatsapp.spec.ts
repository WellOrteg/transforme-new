import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('o botão flutuante está em toda página, com a mensagem pronta', async ({ page }) => {
  for (const rota of ['/', '/blog/', '/suporte/']) {
    await page.goto(rota);
    const botao = page.locator('[data-zap-flutuante]');
    await expect(botao).toBeVisible();
    await expect(botao).toHaveAttribute('href', /wa\.me\/554491510045/);
    await expect(botao).toHaveAttribute('href', /Conheci%20a%20transforme\.tech%20pelo%20site/);
  }
});

// O §16 é explícito: o rótulo é a oferta, não o nome do aplicativo. Mira
// [data-zap-flutuante] e não getByRole(...).first(): o cabeçalho e o
// MenuMobile têm CTAs com o MESMO nome acessível, então `.first()` resolvia
// para o CTA do cabeçalho e o teste ficava cego a uma regressão no botão
// flutuante — o que ele deveria guardar.
test('o botão flutuante se anuncia como conversa, não como "WhatsApp"', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-zap-flutuante]')).toHaveAccessibleName('Falar com um especialista');
});

test('o botão flutuante tem alvo de toque de pelo menos 44px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const caixa = (await page.locator('[data-zap-flutuante]').boundingBox())!;
  expect(caixa.height).toBeGreaterThanOrEqual(44);
  expect(caixa.width).toBeGreaterThanOrEqual(44);
});

// Trava a propriedade central do invólucro sticky de BotaoWhatsApp.astro: um
// `position: fixed` ingênuo cobre o rodapé sempre que ele está na tela. A home
// tem o link do YouTube no canto inferior direito do rodapé — exatamente onde
// o botão flutua — então é a rota onde a regressão apareceria primeiro.
test('o botão flutuante não cobre o rodapé ao rolar até o fim da página', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const botao = (await page.locator('[data-zap-flutuante]').boundingBox())!;
  const linksRodape = await page.locator('footer a').all();

  const sobrepostos: string[] = [];
  for (const link of linksRodape) {
    const caixa = await link.boundingBox();
    if (!caixa) continue;
    const sobrepoe =
      botao.x < caixa.x + caixa.width &&
      caixa.x < botao.x + botao.width &&
      botao.y < caixa.y + caixa.height &&
      caixa.y < botao.y + botao.height;
    if (sobrepoe) sobrepostos.push((await link.textContent())?.trim() ?? '(sem texto)');
  }

  expect(sobrepostos).toEqual([]);
});

test('o botão flutuante não some nem quebra o axe no mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const r = await new AxeBuilder({ page }).include('[data-zap-flutuante]').withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(r.violations).toEqual([]);
});

test('o cabeçalho leva ao WhatsApp e traz os seis itens do menu', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('header nav[aria-label="Principal"]');
  for (const rotulo of ['Soluções', 'Para quem', 'Como funciona', 'Clientes', 'Dúvidas comuns', 'Conteúdos']) {
    await expect(nav.getByRole('link', { name: rotulo })).toBeVisible();
  }
  // Correção ao brief: o MenuMobile também renderiza um CTA de WhatsApp dentro
  // de <header> (md:hidden esconde visualmente, mas mantém no DOM), então a
  // contagem sem filtro de visibilidade dá 2, não 1. Na viewport padrão do
  // Playwright (1280px), ":visible" casa só o CTA de desktop.
  await expect(page.locator('header a[href*="554491510045"]:visible')).toHaveCount(1);
});
