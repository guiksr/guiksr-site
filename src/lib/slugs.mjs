import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CONTENT = fileURLToPath(new URL('../content/', import.meta.url));

// every page's slug, from the files in src/content: blog/janelas.md -> "blog/janelas"
export const listSlugs = () =>
  new Set(
    readdirSync(CONTENT, { recursive: true })
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replaceAll('\\', '/').replace(/\.md$/, '')),
  );

// "/blog/janelas/" or "/blog/janelas" -> "blog/janelas"; "/" -> "index"
export const slugOf = (href) => href.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '') || 'index';

// "blog/janelas" -> "/blog/janelas/"; "index" -> "/"
export const pathOf = (slug) => (slug === 'index' ? '/' : `/${slug}/`);
