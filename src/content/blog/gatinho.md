---
title: gatinho.guiksr.com
kind: post
date: 2026-11-20
description: o placekitten saiu do ar, então eu fiz o meu.
---

:::facts
- desde: novembro de 2024
- fotos: 46 gatinhos
- tamanho máx.: 2000px
- feito com: express, sharp
:::

Por muito tempo eu usei o placekitten em todo projeto. Era um serviço simples: você colocava o tamanho no endereço e ele devolvia uma foto de gatinho daquele tamanho. Perfeito pra preencher o lugar das imagens enquanto o conteúdo de verdade não chegava.

E os clientes amavam. Uma caixa cinza escrita "imagem" passa despercebida, mas um gatinho no lugar da foto do produto não passa. Ficava óbvio onde ainda faltava imagem, e de um jeito que fazia todo mundo rir na reunião em vez de reclamar.

:::right
![](https://gatinho.guiksr.com/480/600/5)
:::

Até que o placekitten parou de funcionar. De repente meus layouts estavam cheios de imagens quebradas, e eu tinha um problema pra resolver.

## o meu próprio placekitten

Então eu fiz o [gatinho.guiksr.com](https://gatinho.guiksr.com). Funciona do mesmo jeito: o endereço é o tamanho.

- `/400/600` devolve um gatinho aleatório em 400×600
- `/400/600/5` devolve sempre o gatinho 5, pra quando a foto não pode mudar a cada carregamento
- até 2000px de cada lado

Por trás é um servidor pequeno em node, com express e [sharp](https://sharp.pixelplumbing.com). Ele recorta e redimensiona a foto na hora e guarda o resultado em cache, então o segundo pedido do mesmo tamanho já sai pronto. O código está no [github](https://github.com/guiksr/gatinho).

Agora os gatinhos são meus, e não saem do ar sem eu saber.
