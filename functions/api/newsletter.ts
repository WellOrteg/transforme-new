import { esquemaNewsletter } from '../../src/lib/validacao';
import { verificarTurnstile } from '../_shared/turnstile';
import { salvarLead } from '../_shared/persistencia';
import { destinatarios, enviarEmail } from '../_shared/email';
import { ASSUNTO_NEWSLETTER, montarEmailNewsletter } from '../_shared/modelo-email';

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
    email: form.get('email'),
    consentimento: form.get('consentimento') === 'on',
    turnstile: form.get('cf-turnstile-response'),
  };

  const r = esquemaNewsletter.safeParse(bruto);
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

  await salvarLead(env.DB, 'newsletter', r.data);

  // Mesmo raciocínio de contato.ts: o lead já foi gravado, a falha fica no log.
  try {
    await enviarEmail(
      env.RESEND_API_KEY,
      destinatarios(env.MAIL_TO),
      ASSUNTO_NEWSLETTER,
      montarEmailNewsletter(r.data.email),
    );
  } catch (e) {
    console.error('Aviso de newsletter não enviado:', e);
  }

  return Response.json({ ok: true });
};
