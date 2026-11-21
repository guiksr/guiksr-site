// Pages are fetched once, kept in memory and copied onto the trail. Missing pages get a
// stand-in instead of a request.

import { pathOf } from './address';
import { esc } from './state';

const cache = new Map<string, Promise<HTMLElement>>();
const absent = new Set<string>();

export function seed(first: HTMLElement) {
  cache.set(first.dataset.slug!, Promise.resolve(first.cloneNode(true) as HTMLElement));
  noteMissing(document);
}

// links to missing pages are marked in the HTML, so they're known before anyone clicks
export function noteMissing(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('a.is-missing[data-slug]').forEach((a) => absent.add(a.dataset.slug!));
}

function missing(slug: string) {
  const el = document.createElement('article');
  el.className = 'leaf';
  el.dataset.slug = slug;
  el.dataset.title = 'ainda não existe';
  el.innerHTML = `
    <div class="leaf-meta">
      <span class="path">/${esc(slug)}</span><span>vazio</span>
      <button class="leaf-close" aria-label="fechar daqui pra frente" hidden>×</button>
    </div>
    <button class="trail-nav prev" hidden></button>
    <h1>ainda não existe</h1>
    <p>a página <code>/${esc(slug)}</code> ainda não foi escrita.</p>
    <button class="trail-nav next" hidden></button>`;
  return el;
}

export function prefetch(slug: string) {
  if (!cache.has(slug)) {
    cache.set(
      slug,
      absent.has(slug)
        ? Promise.resolve(missing(slug))
        : fetch(pathOf(slug))
            .then((r) => (r.ok ? r.text() : Promise.reject()))
            .then((html) => {
              const doc = new DOMParser().parseFromString(html, 'text/html');
              return doc.querySelector<HTMLElement>('.leaf[data-slug]') ?? Promise.reject();
            })
            .catch(() => missing(slug)),
    );
  }
  return cache.get(slug)!;
}

export const leafFor = async (slug: string) => document.importNode(await prefetch(slug), true);
