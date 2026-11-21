// Strings the static pages along a diagonal trail. Internal links open beside the
// current page and the URL keeps the trail: /blog/gatinho/?w=index,blog.

import { readUrl, slugOf, writeUrl } from './address';
import { closeImage, lightboxOpen, openImage } from './lightbox';
import { enter, kick, leave, measure, scrollToLeaf, startMotion } from './motion';
import { leafFor, noteMissing, prefetch, seed } from './pages';
import { pixelate } from './photos';
import { reveal } from './reveal';
import { esc, reduced, state, titleOf, track } from './state';

const first = track?.querySelector<HTMLElement>('.leaf[data-slug]');
if (first) start(first);

// --- the trail

async function build(next: string[]) {
  const pool = [...state.leaves];
  const els = await Promise.all(
    next.map((slug) => {
      const k = pool.findIndex((el) => el.dataset.slug === slug);
      return k >= 0 ? pool.splice(k, 1)[0] : leafFor(slug);
    }),
  );
  state.leaves.filter((el) => !els.includes(el)).forEach((el) => el.remove());
  els.forEach((el) => track.appendChild(el));
  state.stack = next;
  state.leaves = els;
  els.forEach(noteMissing);
  decorate();
}

function decorate() {
  state.leaves.forEach((el, i) => {
    el.dataset.i = String(i);
    el.style.setProperty('--i', String(i));
    el.querySelector<HTMLElement>('.leaf-close')!.hidden = state.stack.length === 1;
    el.querySelectorAll<HTMLElement>('a[data-slug]').forEach((a) => {
      const inBacklinks = !!a.closest('.backlinks');
      a.classList.toggle('is-open', !inBacklinks && a.dataset.slug === state.stack[i + 1]);
      a.classList.toggle('is-from', inBacklinks && a.dataset.slug === state.stack[i - 1]);
    });
    const navs = [
      ['prev', i - 1, '↑ veio de'],
      ['next', i + 1, '↓ segue pra'],
    ] as const;
    for (const [cls, j, label] of navs) {
      const nav = el.querySelector<HTMLElement>(`.trail-nav.${cls}`)!;
      nav.hidden = !state.leaves[j];
      nav.dataset.goto = String(j);
      if (state.leaves[j]) nav.innerHTML = `${label}<b>${esc(titleOf(state.leaves[j]))}</b>`;
    }
    el.querySelectorAll<HTMLImageElement>('img.photo-img').forEach(pixelate);
  });
  state.focus = -1;
  measure();
}

async function open(i: number, slug: string) {
  if (state.busy) return;
  if (state.stack[i - 1] === slug) return scrollToLeaf(i - 1);
  if (state.stack[i + 1] === slug) return scrollToLeaf(i + 1);
  state.busy = true;
  prefetch(slug);
  await leave(i + 1);
  await build([...state.stack.slice(0, i + 1), slug]);
  writeUrl(state.stack);
  enter(state.leaves.at(-1)!);
  scrollToLeaf(state.leaves.length - 1);
  state.busy = false;
}

async function close(i: number) {
  if (state.busy) return;
  state.busy = true;
  const keep = Math.max(1, i);
  await leave(keep);
  await build(state.stack.slice(0, keep));
  writeUrl(state.stack);
  scrollToLeaf(state.leaves.length - 1);
  state.busy = false;
}

function start(first: HTMLElement) {
  state.stack = [slugOf(location.pathname)];
  state.leaves = [first];
  seed(first);
  startMotion();

  // --- events

  const plainClick = (e: MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0);

  track.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const leaf = target.closest<HTMLElement>('.leaf');
    if (!leaf) return;
    const i = +leaf.dataset.i!;

    const photo = target.closest<HTMLImageElement>('figure.photo img');
    if (photo) return openImage(photo);
    const button = target.closest<HTMLElement>('[data-reveal]');
    if (button) return reveal(leaf, button);
    const nav = target.closest<HTMLElement>('.trail-nav');
    if (nav) return scrollToLeaf(+nav.dataset.goto!);
    if (target.closest('.leaf-close')) return close(i);

    const a = target.closest<HTMLAnchorElement>('a[data-slug]');
    if (a) {
      if (plainClick(e)) {
        e.preventDefault();
        open(i, a.dataset.slug!);
      }
      return;
    }
    if (!leaf.classList.contains('is-active') && !getSelection()?.toString()) scrollToLeaf(i);
  });

  // header sections focus the page if it's on the trail, otherwise open it next
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.track')) return;

    const go = target.closest<HTMLAnchorElement>('[data-go]');
    if (go && plainClick(e)) {
      e.preventDefault();
      const i = state.stack.indexOf(go.dataset.go!);
      return i >= 0 ? scrollToLeaf(i) : open(Math.max(0, state.focus), go.dataset.go!);
    }
    const crumb = target.closest<HTMLElement>('[data-crumb]');
    if (crumb) return scrollToLeaf(+crumb.dataset.crumb!);
    if (target.closest('[data-top]')) return scrollToLeaf(0);
  });

  document.addEventListener('pointerover', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('a[data-slug], a[data-go]');
    if (a) prefetch(a.dataset.slug || a.dataset.go!);
  });

  addEventListener(
    'scroll',
    () => {
      kick();
      closeImage(false);
    },
    { passive: true },
  );
  addEventListener('resize', measure);

  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (lightboxOpen()) return closeImage();
    if (state.stack.length > 1) close(state.stack.length - 1);
  });

  addEventListener('popstate', async () => {
    await build(readUrl());
    scrollToLeaf(state.leaves.length - 1, true);
  });

  // --- start
  // The loader holds for at least 650ms so a fast load reads as a beat, not a flash.

  history.scrollRestoration = 'manual';
  const pause = new Promise((resolve) => setTimeout(resolve, reduced.matches ? 0 : 650));
  Promise.all([build(readUrl()), document.fonts.ready, pause]).then(() => {
    measure();
    scrollToLeaf(state.leaves.length - 1, true);
    document.querySelector('.loader')?.classList.add('is-done');
    enter(state.leaves.at(-1)!);
  });
}
