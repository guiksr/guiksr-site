// f is the position along the trail: whole while reading a page, fractional while
// crossing to the next. Where supported, the slide and crossfade run as
// scroll-driven animations on the compositor; otherwise they're painted on scroll.

import { settleLanes } from './lanes';
import { esc, reduced, state, titleOf, track } from './state';

const crumbs = document.querySelector('.crumbs') as HTMLElement;
const toTop = document.querySelector('[data-top]') as HTMLElement;

const CROSS = 0.6; // share of the viewport the crossing takes
const EDGE = 188; // minimum space above a resting page and after the last one
const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
const EASE_IN_OUT = 'cubic-bezier(0.37, 0, 0.63, 1)';

const ScrollTimelineCtor = (window as any).ScrollTimeline;
const timeline = ScrollTimelineCtor && new ScrollTimelineCtor({ source: document.scrollingElement });

let marks: { anchor: number; start: number; x: number }[] = [];
let anims: Animation[] = [];
const shown: string[] = [];

export function measure() {
  const vh = innerHeight;
  const rest = (el: HTMLElement) => Math.max(EDGE, (vh - el.offsetHeight) / 2);
  state.leaves.forEach(settleLanes);

  // pages rest centered, or EDGE from the top when they don't fit; the document starts
  // at the first page's rest and ends at the last one's, at least EDGE past its text
  const last = state.leaves.at(-1)!;
  track.style.paddingTop = `${rest(state.leaves[0])}px`;
  const anchors = state.leaves.map((el) => el.offsetTop - rest(el));
  const bottom = last.offsetTop + last.offsetHeight;
  const end = Math.max(anchors.at(-1)! + vh, bottom + EDGE);
  track.style.paddingBottom = `${Math.ceil(end - bottom)}px`;

  marks = state.leaves.map((el, i) => ({
    anchor: anchors[i],
    start: i ? Math.max(anchors[i - 1], anchors[i] - vh * CROSS) : anchors[i],
    x: el.offsetLeft,
  }));

  bind();
  kick();
}

function bind() {
  anims.forEach((a) => a.cancel());
  anims = [];
  shown.length = 0;
  const max = document.documentElement.scrollHeight - innerHeight;
  if (!timeline || max <= 0) return;

  const at = (y: number) => Math.min(1, Math.max(0, y / max));
  const stops = [{ offset: 0, k: 0, easing: 'linear' }];
  marks.forEach((mark, k) => {
    if (!k) return;
    stops.push({ offset: at(mark.start), k: k - 1, easing: EASE_IN_OUT });
    stops.push({ offset: at(mark.anchor), k, easing: 'linear' });
  });
  stops.push({ offset: 1, k: marks.length - 1, easing: 'linear' });
  for (let i = 1; i < stops.length; i++) stops[i].offset = Math.max(stops[i].offset, stops[i - 1].offset);

  const options = { timeline, fill: 'both' } as KeyframeAnimationOptions;
  track.style.transform = '';
  anims.push(
    track.animate(
      stops.map(({ offset, k, easing }) => ({
        offset,
        easing,
        transform: `translate3d(${marks[0].x - marks[k].x}px, 0, 0)`,
      })),
      options,
    ),
  );
  state.leaves.forEach((el, j) => {
    el.style.opacity = '';
    anims.push(
      el.animate(
        stops.map(({ offset, k, easing }) => ({ offset, easing, opacity: k === j ? 1 : 0.2 })),
        options,
      ),
    );
  });
}

function trailPos() {
  let i = 0;
  while (marks[i + 1] && scrollY >= marks[i + 1].anchor) i++;
  if (!marks[i + 1]) return i;
  const { start, anchor } = marks[i + 1];
  return scrollY <= start ? i : i + easeInOut((scrollY - start) / (anchor - start));
}

let raf = 0;
export function kick() {
  raf ||= requestAnimationFrame(() => {
    raf = 0;
    if (marks.length) paint(trailPos());
  });
}

function paint(f: number) {
  if (!anims.length) {
    const i = Math.min(Math.floor(f), marks.length - 1);
    const next = marks[i + 1] ?? marks[i];
    const x = marks[i].x + (next.x - marks[i].x) * (f - i);
    track.style.transform = `translate3d(${(marks[0].x - x).toFixed(1)}px, 0, 0)`;
    state.leaves.forEach((el, j) => {
      const opacity = (0.2 + 0.8 * Math.max(0, 1 - Math.abs(f - j))).toFixed(2);
      if (shown[j] !== opacity) el.style.opacity = shown[j] = opacity;
    });
  }

  const active = Math.round(f);
  if (active !== state.focus) {
    state.focus = active;
    state.leaves.forEach((el, j) => el.classList.toggle('is-active', j === active));
    paintBars();
  }
}

function paintBars() {
  crumbs.innerHTML = state.leaves
    .map((el, i) => {
      const arrow = i ? '<span>→</span>' : '';
      return `${arrow}<button data-crumb="${i}" class="${i === state.focus ? 'is-active' : ''}">${esc(titleOf(el))}</button>`;
    })
    .join('');
  document
    .querySelectorAll<HTMLElement>('[data-go]')
    .forEach((a) => a.classList.toggle('is-active', state.stack[state.focus] === a.dataset.go));
  toTop.hidden = state.focus <= 0;
  const title = titleOf(state.leaves[state.focus]);
  document.title = state.stack[state.focus] === 'index' || !title ? 'guiksr' : `${title} · guiksr`;
}

export function scrollToLeaf(i: number, instant = false) {
  if (!state.leaves[i]) return;
  if (!marks[i]) measure();
  scrollTo({ top: marks[i].anchor, behavior: instant || reduced.matches ? 'auto' : 'smooth' });
}

export function enter(el: HTMLElement) {
  if (reduced.matches) return;
  [...el.children].forEach((child, k) => (child as HTMLElement).style.setProperty('--k', String(k)));
  el.classList.add('is-entering');
  setTimeout(() => el.classList.remove('is-entering'), 1800);
}

export function leave(from: number) {
  const going = state.leaves.slice(from);
  if (!going.length || reduced.matches) return Promise.resolve();
  going.forEach((el) => el.classList.add('is-leaving'));
  return new Promise((resolve) => setTimeout(resolve, 320));
}

export function startMotion() {
  new ResizeObserver(measure).observe(track);
}
