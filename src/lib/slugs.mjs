import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CONTENT = fileURLToPath(new URL('../content/', import.meta.url));

// blog/gatinho.md -> "blog/gatinho"
export const listSlugs = () =>
  new Set(
    readdirSync(CONTENT, { recursive: true })
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replaceAll('\\', '/').replace(/\.md$/, '')),
  );

// "/blog/gatinho/" or "/blog/gatinho" -> "blog/gatinho"; "/" -> "index"
export const slugOf = (href) => href.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '') || 'index';

// "blog/gatinho" -> "/blog/gatinho/"; "index" -> "/"
export const pathOf = (slug) => (slug === 'index' ? '/' : `/${slug}/`);
