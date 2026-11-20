// Fake content, shaped like Nuxt Content files: content/<slug>.md with frontmatter.
// `::fotos ... ::` stands in for an MDC block component (components/content/Fotos.vue).
window.PAGES = {
  'index': {
    title: 'olá, sou o guiksr',
    kind: 'home',
    body: `
sou designer e programador. atualmente trabalho na [2na8](https://2na8.com).

isso aqui é meu cantinho na internet: um [blog](/blog), um [fotolog](/fotolog), um diário de [filmes](/filmes) e uma pilha de [coisas](/coisas) que me chamaram atenção.

cada link abre uma janela nova. dá pra copiar o link e mandar pra alguém, abre tudo do jeito que tá.

- [sobre](/sobre)
- [o que tô fazendo agora](/agora)
- [github](https://github.com/guiksr)
`,
  },

  'blog': {
    title: 'blog',
    kind: 'índice',
    body: `
textos curtos, longos, inacabados.

- 2026-11 · [janelas infinitas](/blog/janelas)
- 2026-10 · [fazendo o site de novo](/blog/site-novo)
- 2026-08 · [o ônibus das 7h12](/blog/onibus)
`,
  },

  'blog/janelas': {
    title: 'janelas infinitas',
    kind: 'post',
    date: '19 nov 2026',
    body: `
a ideia: navegar pelo site sem sair do lugar. cada link abre uma janela ao lado, numa grade em diagonal, e as janelas antigas ficam ali, visíveis, tipo um rastro.

![a mesa, com supervisão](https://gatinho.guiksr.com/720/480/3)

é parecido com as notas empilhadas do obsidian e de alguns jardins digitais, mas eu queria algo mais de **janela** e mais de **grade**. menos papel, mais mesa.

## links de mão dupla

toda página sabe quem aponta pra ela. lá embaixo tem o "linkado por". se você veio do [blog](/blog), o link de volta fica marcado.

## o link é o estado

a url guarda todas as janelas abertas. copiou, colou, abriu igualzinho.

> o site é o caderno de rascunho, não a exposição.

relacionado: [fazendo o site de novo](/blog/site-novo), [coisas](/coisas).
`,
  },

  'blog/site-novo': {
    title: 'fazendo o site de novo',
    kind: 'post',
    date: '02 out 2026',
    body: `
o site antigo era uma página rosa com meu nome e dois links. funcionou por anos, mas não tinha nada *meu* ali.

o novo é feito com nuxt + nuxt content. cada página é um arquivo \`.md\`. pra postar, eu crio um arquivo e pronto. com mdc dá pra usar uns componentes no meio do texto, tipo a grade de fotos do [fotolog](/fotolog).

![](https://gatinho.guiksr.com/720/400/18)

coisas que eu quero:

- escrever mais no [blog](/blog)
- registrar os [filmes](/filmes) que eu vejo
- um lugar pras fotos que não vão pro instagram

ainda falta um [rascunho sobre tipografia](/blog/tipografia).
`,
  },

  'blog/onibus': {
    title: 'o ônibus das 7h12',
    kind: 'post',
    date: '14 ago 2026',
    body: `
texto de exemplo. sobre pegar o mesmo ônibus todo dia e começar a reconhecer as pessoas.

quem vê o ônibus passar todo dia também é o rico, [da janela](/fotolog/janela).
`,
  },

  'fotolog': {
    title: 'fotolog',
    kind: 'índice',
    body: `
fotos de celular, sem filtro de qualidade. quase todas do rico.

::fotos
![domingo de sol](https://gatinho.guiksr.com/400/400/5 /fotolog/domingo)
![na janela](https://gatinho.guiksr.com/400/400/12 /fotolog/janela)
![soneca](https://gatinho.guiksr.com/400/400/22)
![desconfiado](https://gatinho.guiksr.com/400/400/30)
![caixa nova](https://gatinho.guiksr.com/400/400/8)
![18h](https://gatinho.guiksr.com/400/400/15)
::
`,
  },

  'fotolog/domingo': {
    title: 'domingo de sol',
    kind: 'foto',
    date: '12 out 2026',
    body: `
![](https://gatinho.guiksr.com/720/540/5)

luz boa, o rico achou o único quadrado de sol da casa e não saiu mais.

mais fotos no [fotolog](/fotolog).
`,
  },

  'fotolog/janela': {
    title: 'na janela',
    kind: 'foto',
    date: '14 ago 2026',
    body: `
![](https://gatinho.guiksr.com/720/540/12)

ele fica vendo o ônibus das 7h12 passar. tem um [texto sobre isso](/blog/onibus).
`,
  },

  'filmes': {
    title: 'filmes',
    kind: 'índice',
    body: `
diário de filmes. nota de 0 a 5, sem pensar muito.

- ★★★★½ · [perfect days](/filmes/perfect-days) · 2023
- ★★★★ · [past lives](/filmes/past-lives) · 2023
- ★★★½ · [aftersun](/filmes/aftersun) · 2022
- ★★★ · o rei leão (1994), revisto
`,
  },

  'filmes/perfect-days': {
    title: 'perfect days',
    kind: 'filme',
    date: 'visto em 03 set 2026',
    body: `
**perfect days** (2023), wim wenders. ★★★★½

texto de exemplo. um cara que limpa banheiros em tóquio e é feliz com a rotina. saí querendo tirar mais [fotos](/fotolog) de árvore.

parecido com [past lives](/filmes/past-lives), pelo silêncio.
`,
  },

  'filmes/past-lives': {
    title: 'past lives',
    kind: 'filme',
    date: 'visto em 21 jul 2026',
    body: `
**past lives** (2023), celine song. ★★★★

texto de exemplo. o filme inteiro cabe numa conversa de bar.

voltar pra [lista de filmes](/filmes).
`,
  },

  'coisas': {
    title: 'coisas',
    kind: 'índice',
    body: `
links e coisas que me chamaram atenção. sem ordem.

- [velvetyne](https://velvetyne.fr), fontes livres e esquisitas
- [nuxt content](https://content.nuxt.com), o motor desse site
- as notas empilhadas do obsidian, que inspiraram as [janelas](/blog/janelas)
- [perfect days](/filmes/perfect-days), de novo
`,
  },

  'sobre': {
    title: 'sobre',
    kind: 'página',
    body: `
oi. sou o guiksr, designer e programador. trabalho na [2na8](https://2na8.com).

![o rico, gerente do site](https://gatinho.guiksr.com/720/540/42)

esse site é feito à mão, em português, sem pressa. começa pela [home](/) ou pelo [blog](/blog).

- [github](https://github.com/guiksr)
`,
  },

  'agora': {
    title: 'agora',
    kind: 'página',
    body: `
o que tô fazendo agora (página de exemplo):

- refazendo esse site, [diário da obra](/blog/site-novo)
- vendo filmes devagar, [lista](/filmes)
- tirando foto do rico [na janela](/fotolog/janela)
`,
  },
};
