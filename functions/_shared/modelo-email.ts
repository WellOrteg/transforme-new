// O modelo que o dono mandou em 09/09/2026, o mesmo que o formulário antigo do
// WordPress disparava. Ele cita doze campos; o formulário do site coleta cinco,
// e o dono escolheu manter assim — então as seções sem dado (doações, eventos,
// consentimentos) não são impressas. Uma tabela com meia dúzia de "—" diria à
// equipe comercial que o formulário está quebrado.
//
// A seção "Soluções de Interesse" do modelo virou "Principal desafio": é o
// campo livre que o formulário realmente pergunta, e sem ele o e-mail perderia
// a única resposta que qualifica o lead.
//
// Tudo em atributo `style`: cliente de e-mail não carrega folha externa e boa
// parte deles ignora <style> no <head>.

export const ASSUNTO_CONTATO = 'Nova mensagem do formulário do site da transforme.tech';
export const ASSUNTO_NEWSLETTER = 'Nova inscrição na newsletter do site da transforme.tech';

export interface DadosContato {
  nome: string;
  organizacao: string;
  whatsapp: string;
  email: string;
  desafio?: string;
}

export function escapar(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

const ABERTURA = `<table style="width:100%; max-width:600px; margin:auto; font-family:Arial, sans-serif; border-collapse:collapse; border:1px solid #e0e0e0;">
  <tr>
    <td style="background-color:#8C73FF; color:white; padding:20px; text-align:center; font-size:24px;">
      Nova Resposta do Formulário
    </td>
  </tr>`;

const RODAPE = `  <tr>
    <td style="padding:20px; text-align:center; font-size:12px; color:#888;">
      E-mail gerado automaticamente por Transforme.tech • Não responda este e-mail.
    </td>
  </tr>
</table>`;

export function montarEmailContato(d: DadosContato): string {
  const desafio = d.desafio?.trim();

  const secaoDesafio = desafio
    ? `  <tr>
    <td style="padding:20px;">
      <h2 style="color:#333;">Principal desafio</h2>
      <p>${escapar(desafio)}</p>
    </td>
  </tr>
`
    : '';

  return `${ABERTURA}
  <tr>
    <td style="padding:20px; background-color:#f9f9f9;">
      <h2 style="color:#333;">Informações do Contato</h2>
      <p><strong>Nome:</strong> ${escapar(d.nome)}</p>
      <p><strong>E-mail:</strong> ${escapar(d.email)}</p>
      <p><strong>Telefone:</strong> ${escapar(d.whatsapp)}</p>
      <p><strong>Organização:</strong> ${escapar(d.organizacao)}</p>
    </td>
  </tr>
${secaoDesafio}${RODAPE}`;
}

export function montarEmailNewsletter(email: string): string {
  return `${ABERTURA}
  <tr>
    <td style="padding:20px; background-color:#f9f9f9;">
      <h2 style="color:#333;">Nova inscrição na newsletter</h2>
      <p><strong>E-mail:</strong> ${escapar(email)}</p>
    </td>
  </tr>
${RODAPE}`;
}
