export interface Pergunta {
  pergunta: string;
  resposta: string;
}

// Perguntas e respostas reais coletadas da seção "Dúvidas comuns sobre a
// transforme.tech" do site atual (transforme.tech), verificadas por
// cross-check contra o HTML da home em 2026-08-18.
export const faq: Pergunta[] = [
  {
    pergunta: 'O que exatamente é a transforme.tech?',
    resposta: 'Somos um ecossistema que une tecnologia e impacto social. Oferecemos ferramentas de doações online, gestão de inscrições, gestão financeira e indicadores sociais para sua organização focar menos na burocracia e mais na missão.',
  },
  {
    pergunta: 'Como funciona o sistema de doações online?',
    resposta: 'O doador escolhe o valor e a frequência da contribuição. A plataforma automatiza pagamentos, recorrência e notificações por e-mail e WhatsApp.',
  },
  {
    pergunta: 'Preciso entender de tecnologia para usar?',
    resposta: 'Não. A interface é simples, intuitiva e conta com suporte humanizado. Também oferecemos suporte 24h por inteligência artificial para dúvidas de utilização.',
  },
  {
    pergunta: 'Posso gerenciar inscrições de eventos?',
    resposta: 'Sim. Temos módulo para inscrições online, controle de participantes, check-in e integração com o financeiro da organização.',
  },
  {
    pergunta: 'O que são indicadores sociais?',
    resposta: 'São dados que transformam suas ações em relatórios claros, mostrando o impacto real da organização para doadores, parceiros e lideranças.',
  },
  {
    pergunta: 'A plataforma é segura?',
    resposta: 'Sim. Utilizamos criptografia, boas práticas de segurança e proteção dos dados dos doadores e da instituição.',
  },
  {
    pergunta: 'Posso personalizar minha página de doação?',
    resposta: 'Sim. É possível aplicar logotipo, cores e mensagens personalizadas para manter a identidade visual da sua causa.',
  },
  {
    pergunta: 'Vocês oferecem consultoria também?',
    resposta: 'Sim. Além do software, oferecemos consultoria em gestão, relacionamento com doadores e indicadores sociais.',
  },
  {
    pergunta: 'A minha organização é grande ou pequena demais, isso é um problema?',
    resposta: 'Não, nossas soluções são dimensionadas de acordo com o tamanho e necessidade de cada organização, sempre otimizando o que já existe e ajudando a dar o próximo passo de crescimento.',
  },
  // As perguntas comerciais do §13 do roteiro do cliente. Elas eliminam
  // barreira antes do contato — preço, modularidade, porte mínimo, migração,
  // implantação, segurança e cancelamento. Eram oito: em 09/09/2026 o dono
  // tirou "Como funciona o suporte?".
  //
  // As respostas foram digitadas rápido no documento original. Corrigimos só o
  // evidente (moximo → máximo, ja → já, clausulas → cláusulas, atraves →
  // através, MEET → Meet) e fechamos as frases com ponto. Nenhuma afirmação
  // mudou: preço, prazo e política são compromisso comercial, não redação.
  {
    pergunta: 'Quanto custa a transforme.tech?',
    resposta: 'Temos planos mensais acessíveis e adaptados à realidade de sua organização.',
  },
  {
    pergunta: 'Posso contratar somente alguns módulos?',
    resposta: 'Sim, nossos planos e contratações são modulares.',
  },
  {
    pergunta: 'A plataforma atende organizações pequenas?',
    resposta:
      'Atendemos organizações que já possuam CNPJ e uma pessoa que seja dedicada aos trabalhos operacionais ou de captação de recursos.',
  },
  {
    pergunta: 'É possível migrar dados de outro sistema?',
    resposta: 'Sim, nossos consultores ajudam no processo de migração de dados.',
  },
  {
    pergunta: 'Vocês ajudam na implantação?',
    resposta:
      'Sim, nosso consultor vai ajudar para que utilizem o máximo do potencial de nossas soluções.',
  },
  {
    pergunta: 'Os dados da organização ficam seguros?',
    resposta: 'Sim, usamos certificado de segurança e servidores protegidos.',
  },
  {
    pergunta: 'Posso cancelar quando quiser?',
    resposta: 'Sim, não temos cláusulas de fidelização em nosso termo de adesão.',
  },
];
