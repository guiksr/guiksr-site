// :foto and :revela buttons show or hide their block in the margin; the lanes make room for it.

import { measure } from './motion';
import { EASE, reduced } from './state';

export function reveal(leaf: HTMLElement, button: HTMLElement) {
  const note = leaf.querySelector<HTMLElement>(`[data-note="${button.dataset.reveal}"]`);
  if (!note) return;
  const shown = note.classList.toggle('is-shown');
  button.classList.toggle('is-open', shown);
  button.setAttribute('aria-expanded', String(shown));
  measure();
  if (shown && !reduced.matches)
    note.animate([{ opacity: 0, transform: 'translateY(8px)' }, {}], { duration: 420, easing: EASE });
}
