---
title: como esse site funciona
kind: página
description: astro, markdown e um script pequeno.
---

:::facts
- framework: astro
- páginas: markdown
- javascript: ~4,5 kb
- primeira visita: ~210 kb
- cada página nova: ~2 kb
:::

## astro e markdown

O site é estático, feito com [astro](https://astro.build): cada página é um arquivo markdown que vira HTML no build, e o código está no [github](https://github.com/guiksr/guiksr-site). A sintaxe dos blocos (`:::right`, `:::facts`, `:::photos`) é inspirada no [nuxt content](https://content.nuxt.com) e no [mdc](https://github.com/nuxt-modules/mdc).

## a navegação

Um script só intercepta os links internos, busca a próxima página e coloca ao lado da atual, sem recarregar. O caminho vai pro endereço, então o voltar do navegador funciona.

As notas e fotos que se revelam são blocos da margem escritos no markdown como qualquer outro, só que escondidos até alguém clicar na palavra que guarda eles. A ideia por trás de tudo isso está em [navegação](/navegacao).

## leve

A primeira visita na home baixa uns 210 kb, e mais da metade disso é a foto. Pra comparar, a página média da web passa de 2 MB. Depois disso, cada página nova custa uns 2 kb.

- **HTML pronto.** Cada página chega montada do build, com 1 a 3 kb comprimida. Nenhum framework roda no navegador.
- **Um script e um CSS.** ~4,5 kb de JavaScript e ~12 kb de CSS, baixados uma vez. Sem bibliotecas, rastreadores ou cookies.
- **Fontes no próprio site.** Duas fontes, ~66 kb juntas, divididas por alfabeto: o navegador só baixa a parte que a página usa.
- **Pré-carregamento.** A próxima página começa a baixar quando o mouse passa por cima do link, então o clique já encontra ela pronta.
- **Cache.** Cada página baixada fica guardada na memória. Voltar, fechar e abrir de novo não baixa nada.
- **Fotos sob demanda.** Uns 140 kb cada, em média, com o tamanho reservado e carregadas só quando chegam perto da tela.
- **Animação barata.** Só posição e transparência, que a placa de vídeo resolve sozinha. E nenhuma pra quem pede menos movimento.
