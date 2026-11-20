import type { CollectionEntry } from 'astro:content';
import { slugOf } from './slugs.mjs';

export type Backlink = { slug: string; title: string };

// Who links to whom, read from the markdown of every page: any [text](/path).
export function backlinksFor(entries: CollectionEntry<'pages'>[]) {
  const map = new Map<string, Backlink[]>();
  for (const entry of entries) {
    const seen = new Set<string>();
    for (const [, href] of (entry.body || '').matchAll(/\]\((\/[^)\s]*)\)/g)) {
      const target = slugOf(href);
      if (target === entry.id || seen.has(target)) continue;
      seen.add(target);
      if (!map.has(target)) map.set(target, []);
      map.get(target)!.push({ slug: entry.id, title: entry.data.title });
    }
  }
  return map;
}
