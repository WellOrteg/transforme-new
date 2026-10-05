import { esquemaContato } from '../../src/lib/validacao';
import { EBOOK_URL } from '../../src/dados/ebook';
import { verificarTurnstile } from '../_shared/turnstile';
import { salvarLeadEbook } from '../_shared/persistencia';
import { enviarEmail } from '../_shared/email';
import { escapar } from '../_shared/modelo-email';

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    let form: FormData;
    try { form = await request.formData(); }
    catch { return Response.json({ ok: false, erros: { geral: 'Formulário inválido.' } }, { status: 400 }); }
    const resultado = esquemaContato.safeParse({
      nome: form.get('nome'), organizacao: form.get('organizacao'),
      whatsapp: form.get('whatsapp'), email: form.get('email'),
      desafio: form.get('desafio') ?? undefined,
      turnstile: form.get('cf-turnstile-response'),
    });
    if (!resultado.success) {
      const erros: Record<string, string> = {};
      for (const issue of resultado.error.issues) erros[String(issue.path[0])] = issue.message;
      return Response.json({ ok: false, erros }, { status: 400 });
    }
    const dados = resultado.data;
    if (!await verificarTurnstile(dados.turnstile, env.TURNSTILE_SECRET_KEY, request.headers.get('CF-Connecting-IP'))) {
      return Response.json({ ok: false, erros: { geral: 'Não foi possível confirmar que você não é um robô. Tente novamente.' } }, { status: 400 });
    }
    const parceiroBruto = form.get('parceiro');
    const parceiro = typeof parceiroBruto === 'string' ? parceiroBruto.trim().toLowerCase() : '';
    if (parceiro && !/^[a-z0-9_-]{1,80}$/.test(parceiro)) {
      return Response.json({ ok: false, erros: { parceiro: 'Identificação de parceiro inválida.' } }, { status: 400 });
    }
    await salvarLeadEbook(env.DB, dados, parceiro || null);
    const url = new URL(EBOOK_URL, new URL(request.url).origin).href;
    await enviarEmail(env.RESEND_API_KEY, dados.email, 'Seu e-book: Guia de doações — transforme.tech',
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#252238">
        <h1>Seu guia de doações chegou!</h1>
        <p>Olá, ${escapar(dados.nome)}!</p>
        <p>Obrigado pelo interesse. Seu e-book gratuito está disponível no botão abaixo:</p>
        <p><a href="${escapar(url)}" style="display:inline-block;background:#6844c4;color:#fff;padding:16px 24px;border-radius:24px">Baixar e-book</a></p>
        <p>Guarde este e-mail para acessar o guia quando quiser.</p>
        <p>Equipe transforme.tech</p>
      </div>`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, erros: { geral: 'Não foi possível enviar o e-book agora. Tente novamente em instantes.' } }, { status: 503 });
  }
};
