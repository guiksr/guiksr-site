---
title: gatinho.guiksr.com
kind: post
date: 2026-11-20
---

toda foto desse site vem do [gatinho.guiksr.com](https://gatinho.guiksr.com), um cdn de gatinho que eu fiz pra servir fotos do rico.

:::right
![o próprio](https://gatinho.guiksr.com/480/600/5)
:::

## como funciona

o endereço é o tamanho: `/<largura>/<altura>/<foto>`.

- `/400/600/5` é a foto 5 em 400×600
- `/200/200` é uma foto aleatória
- até 2000px de cada lado

um servidor em node com express e [sharp](https://sharp.pixelplumbing.com) recorta e redimensiona sob demanda, e guarda o resultado em cache. o código tá no [github](https://github.com/guiksr/gatinho).

:::facts
- tamanho máx.: 2000px
- feito com: express, sharp
- mora no: heroku
:::

## aqui no site

como o tamanho tá no endereço, o site já sabe quanto espaço reservar antes da foto chegar, e nada pula na tela. enquanto carrega, aparece uma versão de 12px em mosaico que vai ficando nítida. e quando você clica numa foto, ela abre pedindo uma cópia do tamanho da sua tela.

voltar pro [blog](/blog).
