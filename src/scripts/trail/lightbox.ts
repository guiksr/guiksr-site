// Photos in the text open full screen, flying from where they sit and back.

import { resized } from './photos';
import { EASE, reduced } from './state';

const lightbox = document.querySelector('.lightbox') as HTMLElement;
const lbImg = lightbox.querySelector('img') as HTMLImageElement;
const lbCaption = lightbox.querySelector('p') as HTMLElement;
let lbFrom: HTMLImageElement | null = null;

const sharper = (src: string, width: number) =>
  resized(src, (w, h) => {
    const k = Math.min(2000 / Math.max(w, h), (width * devicePixelRatio) / w);
    return k > 1 ? [Math.round(w * k), Math.round(h * k)] : null;
  }) ?? src;

function flight(from: DOMRect, to: DOMRect) {
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`;
}

export function openImage(img: HTMLImageElement) {
  const nw = img.naturalWidth || img.width;
  const nh = img.naturalHeight || img.height;
  const scale = Math.min((innerWidth * 0.9) / nw, (innerHeight * 0.82) / nh);
  const w = Math.round(nw * scale);
  const h = Math.round(nh * scale);

  lbFrom = img;
  lbImg.src = img.currentSrc || img.src;
  Object.assign(lbImg.style, { width: `${w}px`, height: `${h}px` });
  lbCaption.textContent = img.alt;
  lightbox.hidden = false;

  const big = new Image();
  big.onload = () => {
    if (lbFrom === img) lbImg.src = big.src;
  };
  big.src = sharper(img.src, w);

  if (reduced.matches) return;
  const from = flight(img.getBoundingClientRect(), lbImg.getBoundingClientRect());
  lbImg.animate([{ transform: from }, { transform: 'none' }], { duration: 420, easing: EASE });
  lightbox.animate([{ backgroundColor: 'transparent' }, {}], { duration: 420, easing: EASE });
  lbCaption.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 200, fill: 'backwards' });
}

export function closeImage(fly = true) {
  if (lightbox.hidden || !lbFrom) return;
  const img = lbFrom;
  lbFrom = null;
  const done = () => {
    lightbox.hidden = true;
    lbImg.removeAttribute('src');
  };
  if (reduced.matches) return done();

  const from = img.getBoundingClientRect();
  const onScreen = fly && from.bottom > 0 && from.top < innerHeight;
  const out = { duration: 300, easing: EASE, fill: 'forwards' } as const;

  const fade = lightbox.animate([{}, { backgroundColor: 'transparent' }], out);
  fade.onfinish = () => {
    done();
    fade.cancel();
  };
  const caption = lbCaption.animate([{}, { opacity: 0 }], { duration: 150, fill: 'forwards' });
  caption.onfinish = () => caption.cancel();
  const back = lbImg.animate(
    [{}, onScreen ? { transform: flight(from, lbImg.getBoundingClientRect()) } : { opacity: 0 }],
    out,
  );
  back.onfinish = () => back.cancel();
}

lightbox.addEventListener('click', () => closeImage());

export const lightboxOpen = () => !lightbox.hidden;
