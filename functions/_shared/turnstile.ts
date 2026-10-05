export async function verificarTurnstile(token: string, segredo: string, ip: string | null): Promise<boolean> {
  const corpo = new FormData();
  corpo.append('secret', segredo);
  corpo.append('response', token);
  if (ip) corpo.append('remoteip', ip);

  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: corpo,
  });
  const dados = (await r.json()) as { success: boolean };
  return dados.success === true;
}
