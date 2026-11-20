# Contributing

Short rules for working in this repo (written mainly for coding agents).

## Branches

There are only two:

- **`dev`**: where all work happens. Commit here.
- **`main`**: production. Only receives merges from `dev`, never direct commits.

Don't create other branches unless asked. Don't push, merge into `main` or force-push without being asked.

## Before committing

```sh
nvm use          # Node version from .nvmrc
npm run format   # prettier
npm run check    # types
npm run build    # must pass
```

For anything visual, also run `npm run dev` and look at the page in a browser.

## Commits

- One line, [Conventional Commits](https://www.conventionalcommits.org): `feat(blog): add gatinho post`, `fix: cap lightbox size`, `chore: update astro`.
- No trailers, session links or "generated with" footers.

## Where things are

- Content: `src/content/*.md`. How to write it: [docs/writing.md](docs/writing.md).
- Code overview: [README.md](README.md).
- Product and design decisions: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md). Update DESIGN.md when behaviour changes.

## Gotchas

- After editing `src/lib/remark-blocks.mjs` or `rehype-site.mjs`, Astro serves cached pages. Stop the dev server, delete `.astro/data-store.json` and `node_modules/.astro/data-store.json`, and start it again.
- Photos are served by [gatinho](https://github.com/guiksr/gatinho) (`/<w>/<h>/<id>`, max 2000px per side), not stored in this repo.
- `dist/`, `.astro/` and `.playwright-mcp/` are build and tool output; never commit them.
