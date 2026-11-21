---
title: meu setup de terminal
kind: post
date: 2026-11-20
description: ghostty, oh my zsh, herdr, ttt e claude code. quase tudo que eu faço hoje acontece numa janela de terminal.
---

:::facts
- terminal: ghostty
- shell: zsh + oh my zsh
- agentes: herdr
- editor: ttt
- ia: claude code
:::

Faz um tempo que quase tudo que eu faço no computador acontece numa janela de terminal. Não por purismo: é que as ferramentas boas de agora moram ali. Esse é o setup de hoje, de baixo pra cima.

Todas as escolhas também passaram por um critério: ser fácil de começar. Eu tinha um vscode muito customizado, e o que mais me prendia nele eram os atalhos. Não queria decorar um monte de atalhos novos só pra testar um setup, então fui atrás de ferramentas que funcionam com o mouse desde o primeiro dia. Os atalhos eu vou descobrindo aos poucos.

## ghostty

O terminal é o [ghostty](https://ghostty.org). Rápido, nativo no mac e com boa configuração padrão.

## zsh e oh my zsh

Dentro dele roda o zsh com [oh my zsh](https://ohmyz.sh) e o tema [powerlevel10k](https://github.com/romkatv/powerlevel10k). Os plugins que eu uso de verdade são poucos:

- `zsh-autosuggestions`, que sugere o resto do comando a partir do histórico;
- `zsh-syntax-highlighting`, que pinta o comando de vermelho antes de eu errar;
- `git`, `npm` e `brew`, pelos atalhos.

O `$EDITOR` é o [micro](https://micro-editor.github.io), pra quando algum comando abre um editor no meio do caminho. E tudo é instalado pelo homebrew.

## herdr

O [herdr](https://herdr.dev) é um multiplexador de terminal feito pra agentes de IA. Ele organiza o trabalho em workspaces, abas e painéis. Além disso o herdr traz persistência para as sessões do terminal.

As notificações são a melhor parte. Quando um agente termina ou trava esperando uma resposta minha, chega uma notificação do sistema avisando. Parece pouco, mas muda o jeito de trabalhar.

## por que não o vscode

Ele é feito em [electron](https://www.electronjs.org), que empacota um chromium em cada aplicativo: o editor, o slack, o teams, o discord, cada um com o seu navegador particular, cada um comendo a sua fatia de RAM pra mostrar texto numa janela.

:::right{#claude}
nota: o claude code também não é nenhum peso pena. seis sessões abertas passam de 1 GB. mas pelo menos ele trabalha.
:::

Pra comparar, agora, enquanto eu escrevo isso, o ghostty está usando uns 100 MB, o herdr uns 20 MB e o ttt uns 160 MB. Tudo junto, menos de 300 MB. Sem contar o :revela[claude code]{#claude}.


## ttt

O editor é o [ttt](https://tttedit.dev), uma IDE inteira dentro do terminal: árvore de arquivos, busca, painel de git, diff lado a lado, autocomplete com LSP. Ele também abre um pull request do github direto pela URL, pra revisar.

Como quem escreve a maior parte do código hoje é o agente, o editor virou mais um lugar pra ler e revisar do que pra digitar. O ttt é bom nisso.

## claude code

E o [claude code](https://www.anthropic.com/claude-code) é quem faz o trabalho pesado. Esse site, por exemplo, foi feito quase todo conversando com ele.

Algumas coisas que deixaram ele mais útil pra mim:

- **o estilo conciso**, que corta a narração e deixa só o resultado;
- **plugins de LSP** pra typescript, vue e rust, assim ele navega pelo código como um editor e não só por busca de texto;
- **skills próprias** pra tarefas que eu repito, como abrir PR e fazer deploy;
- **um `CLAUDE.md` global** com as minhas regras, tipo commit de uma linha só e sem assinatura no fim.

## no fim

O terminal virou uma mesa de trabalho: o ghostty é a mesa, o herdr organiza as pilhas, o ttt é onde eu leio e o claude code é quem faz. Nada disso estava aqui um ano atrás, então provavelmente vai mudar de novo.
