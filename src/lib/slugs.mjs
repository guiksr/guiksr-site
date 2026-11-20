import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CONTENT = fileURLToPath(new URL('../content/', import.meta.url));

// blog/site-novo.md -> "blog/site-novo"
export const listSlugs = () =>
  new Set(
    readdirSync(CONTENT, { recursive: true })
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replaceAll('\\', '/').replace(/\.md$/, '')),
  );

// "/blog/site-novo/" or "/blog/site-novo" -> "blog/site-novo"; "/" -> "index"
export const slugOf = (href) => href.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '') || 'index';

// "blog/site-novo" -> "/blog/site-novo/"; "index" -> "/"
export const pathOf = (slug) => (slug === 'index' ? '/' : `/${slug}/`);
