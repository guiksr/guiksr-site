// What the trail modules share: the slugs on the trail, their pages and the one in focus.

export const track = document.getElementById('track') as HTMLElement;
export const reduced = matchMedia('(prefers-reduced-motion: reduce)');

export const state = {
  stack: [] as string[],
  leaves: [] as HTMLElement[],
  focus: -1,
  busy: false,
};

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const titleOf = (el?: HTMLElement) => el?.dataset.title || el?.dataset.slug || '';
export const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
