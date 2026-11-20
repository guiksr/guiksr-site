# guiksr.com

Personal site. Built with [Astro](https://astro.build) as plain static pages; one script (`src/scripts/trail.ts`) turns navigation into a trail of pages along a diagonal.

Needs Node 22.23.4 or newer (`.nvmrc` pins it; run `nvm use`).

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/
npm run check     # types
npm run format    # prettier
```

## Writing

Every page is a markdown file in `src/content/`; its path is its address (`src/content/blog/gatinho.md` → `/blog/gatinho/`). Frontmatter, links, photos and blocks (`:::right`, `:::left`, `:::facts`, `:::photos`) are documented in [docs/writing.md](docs/writing.md).

## How it fits together

- `src/content.config.ts`: the `pages` collection and its frontmatter schema.
- `src/pages/[...slug].astro`: one static page per markdown file; `404.astro`.
- `src/components/Leaf.astro`: one page of the trail (meta, title, content, backlinks).
- `src/lib/remark-blocks.mjs`, `rehype-site.mjs`: the blocks above, links and photos.
- `src/scripts/trail.ts`: the trail, motion, margin lanes and lightbox. Without it, every page still works on its own.
- Design notes: `PRODUCT.md`, `DESIGN.md`.
