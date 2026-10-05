import { expect, it, vi } from 'vitest';
import { onRequestGet } from '../functions/api/admin/leads';

const segredo = 'a'.repeat(48);
function consultar(db: unknown, token?: string, query = '', configurado: string | undefined = segredo) {
  return onRequestGet({ request: new Request('https://transforme.tech/api/admin/leads' + query, {headers:token?{Authorization:`Bearer ${token}`}:{}}), env:{DB:db,ADMIN_LEADS_TOKEN:configurado} } as any);
}
it('bloqueia acesso sem senha, com senha errada e sem configuração', async () => {
  for (const token of [undefined, 'errada']) expect((await consultar({},token)).status).toBe(401);
  expect((await consultar({},segredo,'','')).status).toBe(401);
});
it('filtra com parâmetros e retorna resultados sem cache', async () => {
  const bind=vi.fn();
  bind.mockReturnValue({first:async()=>({total:1}),all:async()=>({results:[]})});
  const prepare=vi.fn(()=>({bind}));
  const r=await consultar({prepare},segredo,'?origem=ebook&parceiro=fife_2026');
  expect(r.status).toBe(200);
  expect(r.headers.get('Cache-Control')).toBe('no-store');
  expect(bind).toHaveBeenCalledWith('fife_2026','ebook',0);
  expect(prepare.mock.calls[0][0]).not.toContain('fife_2026');
});
it('recusa paginação inválida', async () => {
  expect((await consultar({},segredo,'?pagina=-1')).status).toBe(400);
});
