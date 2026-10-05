# Como publicar um post no blog

Guia para publicar conteúdo no site da transforme.tech sem precisar de ninguém da equipe técnica.

Você vai precisar de: uma conta no GitHub com acesso ao repositório do site, e um navegador.

---

## 1. Entrar no painel

Acesse **https://transforme.tech/admin** e clique em **Sign in with GitHub**.

Na primeira vez o GitHub pede autorização para o painel. Autorize — isso acontece só uma vez por navegador.

Depois de entrar, você vê a lista **Posts do blog** com tudo que já está publicado.

## 2. Criar o post

Clique em **New Post** (Novo Post), no canto superior direito.

O formulário tem os campos abaixo. Nenhum deles é decorativo: cada um alimenta uma parte do site ou do Google.

| Campo | O que preencher |
|---|---|
| **Título** | Até 90 caracteres. É o `<h1>` da página e o título que aparece no Google. Acima disso o Google corta no meio da frase. |
| **Resumo** | Entre 60 e 200 caracteres. Aparece no card do blog e como descrição no Google e no WhatsApp. Menos de 60 caracteres não descreve nada; mais de 200 é cortado. |
| **Data de publicação** | A data que sai no post e ordena a listagem do blog. |
| **Autor** | Lista fechada. Para publicar em nome da empresa, escolha `transforme`. |
| **Categoria** | Lista fechada, quatro opções. É o filtro da página do blog. |
| **Imagem de capa** | Opcional. Se não houver, o site desenha uma capa com os arcos da marca — e fica bom. |
| **Descrição da imagem** | **Obrigatório sempre que houver capa.** É o texto que quem não enxerga ouve no lugar da imagem. Descreva o que está na foto, não repita o título. |
| **Rascunho** | Ligado = o post não aparece no site. Use para deixar algo pronto e publicar depois. |
| **Conteúdo** | O texto do post. |

### Sobre o campo Conteúdo

Use os botões da barra de formatação para **negrito**, títulos, listas e links.

Duas regras que valem a pena seguir:

- **Use "Título 2" para as seções.** O sumário lateral do post é montado automaticamente a partir deles. Post sem Título 2 é post sem sumário.
- **Ao inserir uma imagem, escreva a descrição alternativa.** Mesma razão da capa.

Não use "Título 1" no corpo: o `<h1>` da página já é o título do post.

## 3. Publicar

Clique em **Publish** → **Publish now**.

O site é reconstruído a cada publicação. **Espere cerca de 1 minuto** e recarregue `https://transforme.tech/blog/` — o post estará lá.

Se depois de 2 minutos não apareceu, é sinal de que a publicação falhou na validação (quase sempre: resumo curto demais, ou capa sem descrição). Volte ao painel, corrija e publique de novo.

## 4. Editar um post que já está no ar

Abra `https://transforme.tech/admin`, clique no post na lista, altere o que precisar e clique em **Publish**. Mesma espera de 1 minuto.

Para tirar um post do ar sem apagá-lo, ligue **Rascunho** e publique.

---

## Perguntas frequentes

**Posso mudar o endereço (URL) de um post?**
Pode, mas evite depois de publicado: quem já compartilhou o link cai num erro 404. Se for realmente necessário, avise a equipe técnica para criar o redirecionamento.

**Apaguei um post sem querer.**
Nada se perde: todo histórico fica no GitHub. Fale com a equipe técnica.

**A imagem ficou gigante / pesada.**
O site redimensiona sozinho. Suba a imagem no tamanho original mesmo — quanto maior a qualidade, melhor o resultado.
