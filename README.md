# guiksr.com

Personal site: blog, fotolog, filmes, coisas. Built with [Astro](https://astro.build) as plain static pages; one script (`src/scripts/trail.ts`) turns navigation into a trail of pages along a diagonal.

Needs Node 22.23.4 or newer (`.nvmrc` pins it; run `nvm use`).

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/
```

## Writing

Every page is a markdown file in `src/content/`. Its path is its address:

| file | address |
|---|---|
| `src/content/index.md` | `/` |
| `src/content/blog.md` | `/blog/` |
| `src/content/blog/janelas.md` | `/blog/janelas/` |

Frontmatter:

```yaml
---
title: janelas infinitas
kind: post          # home | índice | post | foto | filme | página
date: 2026-11-19    # optional; shown as "19 nov 2026" ("visto em …" for filmes)
description: …      # optional, for search/social previews
---
```

Links between pages are plain markdown links: `[blog](/blog)`. "linkado por" (backlinks) is computed from them at build time. Links to pages that don't exist yet show dashed.

### Blocks

```md
:::right
anything beside the text, in the right margin: a note, a photo…
:::

:::left
same, in the left margin
:::

:::facts
- ano: 2023
- direção: wim wenders
:::

:::photos
[![domingo de sol](https://gatinho.guiksr.com/400/400/5)](/fotolog/domingo)
![soneca](https://gatinho.guiksr.com/400/400/22)
:::
```

- A photo on its own line becomes a figure; its alt text is the caption. Clicking it opens it full screen.
- Linked photos (`[![…](…)](/page)`) open that page instead.
- Photos from gatinho.guiksr.com (`/<width>/<height>/<id>`) get their size reserved, and a sharper copy is requested for full screen.
- Margin blocks sit at the height where they appear in the text, never overlap, and stay inside the page. On narrow screens they fall back into the text.

## How it fits together

- `src/content.config.ts`: the `pages` collection and its frontmatter schema.
- `src/pages/[...slug].astro`: one static page per markdown file; `404.astro`.
- `src/components/Leaf.astro`: one page of the trail (meta, title, content, backlinks).
- `src/lib/remark-blocks.mjs`, `rehype-site.mjs`: the blocks above, links and photos.
- `src/scripts/trail.ts`: the trail, motion, margin lanes and lightbox. Without it, every page still works on its own.
- `prototypes/`: the HTML prototypes the design came from.
- Design notes: `PRODUCT.md`, `DESIGN.md`.
