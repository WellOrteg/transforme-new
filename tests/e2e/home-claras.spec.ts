import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('a seção "para quem" lista os quatro públicos', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#para-quem').getByRole('heading', { level: 3 })).toHaveCount(4);
});

test('a home tem exatamente duas faixas escuras', async ({ page }) => {
  await page.goto('/');
  // hero + bloco da plataforma; o rodapé é contentinfo e não conta como faixa da página
  await expect(page.locator('main [data-tema="escuro"]')).toHaveCount(2);
});

test('a home inteira passa no axe', async ({ page }) => {
  // O axe avalia a página em repouso: no meio de um fade ele mede a cor
  // composta, não a cor final, e acusa contraste que não existe depois de a
  // animação terminar. prefers-reduced-motion entrega o estado final de cara.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(r.violations).toEqual([]);
});

// A ordem é o produto desta reescrita: cada seção responde a uma pergunta e só
// funciona depois de a anterior ter sido respondida.
test('as seções da home seguem a ordem do roteiro', async ({ page }) => {
  await page.goto('/');
  const ids = await page.locator('main section[id]').evaluateAll((s) => s.map((e) => e.id));
  expect(ids).toEqual([
    'prova-social',
    'dor',
    'para-quem',
    'solucoes',
    'video-cliente',
    'como-funciona',
    'produto',
    'numeros',
    'depoimentos',
    'faq',
    'contato',
  ]);
});

test('a descrição da home traz o posicionamento novo', async ({ page }) => {
  await page.goto('/');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toContain('organizações sociais e missionárias');
  expect(desc!.length).toBeGreaterThan(50);
});
