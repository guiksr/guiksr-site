// Photos sharpen in from a mosaic. gatinho URLs are /<w>/<h>[/<id>] and serve any size.

import { reduced } from './state';

export function resized(src: string, size: (w: number, h: number) => [number, number] | null) {
  const match = src.match(/^(https?:\/\/[^/]+)\/(\d+)\/(\d+)(\/\d+)?$/);
  const to = match && size(+match[2], +match[3]);
  return to ? `${match[1]}/${to[0]}/${to[1]}${match[4] ?? ''}` : null;
}

// Shows a tiny copy as a mosaic, then sharpens it once the real image arrives.
const MOSAIC = 12;

export function pixelate(img: HTMLImageElement) {
  if (img.dataset.px) return;
  img.dataset.px = '1';
  const show = () => img.classList.add('is-loaded');

  if (img.complete || reduced.matches) {
    if (img.complete) return show();
    img.addEventListener('load', show, { once: true });
    img.addEventListener('error', show, { once: true });
    return;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  img.after(canvas);

  const draw = (src: HTMLImageElement, cols: number) => {
    const w = img.clientWidth || 1;
    const h = img.clientHeight || 1;
    const sw = src.naturalWidth;
    const sh = src.naturalHeight;
    const k = Math.max(w / sw, h / sh);
    canvas.width = cols;
    canvas.height = Math.max(1, Math.round((cols * h) / w));
    ctx.drawImage(src, (sw - w / k) / 2, (sh - h / k) / 2, w / k, h / k, 0, 0, canvas.width, canvas.height);
  };

  let sharpening = false;
  const tiny = resized(img.src, (w, h) => [MOSAIC, Math.max(1, Math.round((MOSAIC * h) / w))]);
  if (tiny) {
    const small = new Image();
    small.onload = () => {
      if (!sharpening) draw(small, MOSAIC);
    };
    small.src = tiny;
  }

  const finish = () => {
    canvas.remove();
    show();
  };
  const sharpen = (cols: number) => {
    if (cols >= img.clientWidth / 2) return finish();
    draw(img, cols);
    setTimeout(() => sharpen(cols * 2), 90);
  };
  img.addEventListener(
    'load',
    () => {
      sharpening = true;
      sharpen(MOSAIC);
    },
    { once: true },
  );
  img.addEventListener('error', finish, { once: true });
}
