import { esquemaContato } from '../../src/lib/validacao';
import { verificarTurnstile } from '../_shared/turnstile';
import { salvarLead } from '../_shared/persistencia';
import { destinatarios, enviarEmail } from '../_shared/email';
import { ASSUNTO_CONTATO, montarEmailContato } from '../_shared/modelo-email';

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  // Opcional: sem ele valem os três endereços comerciais de _shared/email.ts.
  MAIL_TO?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const form = await request.formData();
  const bruto = {
    nome: form.get('nome'),
    organizacao: form.get('organizacao'),
    whatsapp: form.get('whatsapp'),
    email: form.get('email'),
    // `desafio` é opcional no schema, e z.string().optional() recusa `null`
    // (só aceita string ou undefined) — sem isso, um POST sem o campo tomava
    // 400 num campo que deveria ser dispensável.
    desafio: form.get('desafio') ?? undefined,
    turnstile: form.get('cf-turnstile-response'),
  };

  const r = esquemaContato.safeParse(bruto);
  if (!r.success) {
    const erros: Record<string, string> = {};
    for (const i of r.error.issues) erros[String(i.path[0])] = i.message;
    return Response.json({ ok: false, erros }, { status: 400 });
  }

  const ok = await verificarTurnstile(
    r.data.turnstile,
    env.TURNSTILE_SECRET_KEY,
    request.headers.get('CF-Connecting-IP'),
  );
  if (!ok) {
    return Response.json(
      { ok: false, erros: { geral: 'Não foi possível confirmar que você não é um robô. Tente novamente.' } },
      { status: 400 },
    );
  }

  await salvarLead(env.DB, 'contato', r.data);

  // O lead já está no D1. Se a Resend falhar, o visitante não tem o que fazer
  // com o erro; ele fica no log (wrangler pages deployment tail) e o lead não se perde.
  try {
    await enviarEmail(
      env.RESEND_API_KEY,
      destinatarios(env.MAIL_TO),
      ASSUNTO_CONTATO,
      montarEmailContato(r.data),
    );
  } catch (e) {
    console.error('Aviso de contato não enviado:', e);
  }

  return Response.json({ ok: true });
};
