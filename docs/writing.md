# Writing for guiksr.com

Everything you can put in a page, and what it turns into.

## Pages

Every page is a markdown file in `src/content/`. Its path is its address:

| file                          | address           |
| ----------------------------- | ----------------- |
| `src/content/index.md`        | `/`               |
| `src/content/sobre.md`        | `/sobre/`         |
| `src/content/blog.md`         | `/blog/`          |
| `src/content/blog/gatinho.md` | `/blog/gatinho/`  |

A section is a page (`blog.md`) plus a folder with the same name (`blog/`). Section pages are written by hand: **a new post only shows up in the list once you link it from `blog.md`.**

The header links come from `SECTIONS` in `src/layouts/Site.astro`.

### Adding a post

1. Create `src/content/blog/<slug>.md` with the frontmatter below.
2. Add a line to `src/content/blog.md`: `- 2026-11 · [title](/blog/<slug>)`.
3. `npm run dev` and open it.

## Frontmatter

```yaml
---
title: fazendo o site de novo # required; becomes the page's <h1> and tab title
kind: post # required; see below
date: 2026-11-19 # optional; shown as "19 nov 2026"
description: … # optional; search and social previews
---
```

| kind     | use for                    | what changes                              |
| -------- | -------------------------- | ----------------------------------------- |
| `home`   | `index.md` only            | bigger pink title                         |
| `índice` | section pages (`blog.md`)  | —                                         |
| `post`   | blog posts                 | —                                         |
| `página` | standalone pages (`sobre`) | —                                         |
| `foto`   | a single photo page        | —                                         |
| `filme`  | a film log entry           | date reads "visto em 19 nov 2026"         |

The kind and date show in the small line above the title (`/blog/site-novo  post · 19 nov 2026`).

The title is rendered for you: don't start the body with `# title`.

## Text

| markdown                | result                                                   |
| ----------------------- | -------------------------------------------------------- |
| paragraphs              | 13px mono                                                |
| `## heading`            | display font, 17px. Use `##` only; `###` is unstyled     |
| `- item`                | list with `→` bullets                                    |
| `**bold**`              | brighter white                                           |
| `_italic_`              | italic mono                                              |
| `` `code` ``            | tinted background                                        |
| `> quote`               | big display font; quote marks are added, don't type them |
| `"quotes"`, `--`, `...` | curly quotes, dashes and ellipses (smart punctuation)    |

Numbered lists, tables and code blocks work but have no styling yet.

## Links

```md
[blog](/blog) internal: opens beside the current page
[gatinho](https://gatinho.guiksr.com) external: new tab, gets a ↗
```

- Internal links are written as plain paths (`/blog/gatinho`); the trailing slash is added for you.
- A link to a page that doesn't exist yet is shown dashed and opens an "ainda não existe" page. Handy for drafts.
- **linkado por** (backlinks) at the end of each page is built from every `[text](/path)` in the other pages.
- Modifier-click (⌘/ctrl) or middle-click still opens a page on its own.

## Photos

Photos come from [gatinho.guiksr.com](https://gatinho.guiksr.com): `/<width>/<height>/<id>`, max 2000px per side.

```md
![caption text](https://gatinho.guiksr.com/720/540/5)
```

- On its own line, an image becomes a figure: the alt text is the caption (leave it empty for none).
- The size in the URL reserves its space, so nothing jumps while it loads; a 12px mosaic sharpens in until it arrives.
- Clicking it opens it full screen, at a sharper size fitted to the screen.
- A linked photo opens the page instead: `[![domingo](https://gatinho.guiksr.com/400/400/5)](/blog/gatinho)`.
- An image inside a sentence stays a plain inline image, without any of the above.
- Photos that aren't on gatinho go in `public/`, named `<name>-<w>x<h>.<ext>` so their space is reserved too: `![](/eu-720x960.jpg)`. They don't get the mosaic's tiny preview or a sharper copy in full screen.

## Blocks

Blocks are fenced with `:::name` and `:::`, each on its own line.

### `:::right` and `:::left`: margin notes

```md
:::right
nota: anything beside the text, even a photo.

![o rico](https://gatinho.guiksr.com/480/600/22)
:::
```

On wide screens (over 1000px) they move into the side lanes, at the height where they appear in the text, so place them right before the paragraph they belong to. They never overlap and never run past the end of the page. On narrow screens they sit in the text where you wrote them. `:::left` shares its lane with the "veio de / segue pra" links.

### `:::facts`: fact sheet

```md
:::facts
- ano: 2023
- direção: wim wenders
- nota: ★★★★½
:::
```

Each `key: value` line becomes a row, shown in the right lane. Values are plain text: links inside them lose their link.

### `:::photos`: photo grid

```md
:::photos
[![domingo de sol](https://gatinho.guiksr.com/400/400/5)](/blog/gatinho)
![soneca](https://gatinho.guiksr.com/400/400/22)
![desconfiado](https://gatinho.guiksr.com/400/400/30)
:::
```

A three-column grid of square photos, captions from the alt text. Plain photos open full screen; linked ones open their page. Use square URLs (`/400/400/…`).

### Text that looks like a block

Colons in normal text (`10:30`, `ex:ample`) are left alone.

## Automatic parts

You don't write these; every page gets them:

- the meta line (path, kind, date) and the close button `×` when there's more than one page open
- "↑ veio de" and "↓ segue pra" links to the neighbours on the trail
- "linkado por" (backlinks)
- the breadcrumb trail in the footer and the active section in the header
