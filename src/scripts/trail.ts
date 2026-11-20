// Strings the static pages along a diagonal trail. Internal links open beside the
// current page and the URL keeps the trail: /blog/site-novo/?w=index,blog.

const track = document.getElementById('track') as HTMLElement;
const firstLeaf = track.querySelector<HTMLElement>('.leaf[data-slug]');
if (firstLeaf) trail(firstLeaf);

function trail(firstLeaf: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const crumbs = document.querySelector('.crumbs') as HTMLElement;
  const toTop = document.querySelector('[data-top]') as HTMLElement;

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const slugOf = (path: string) => path.replace(/^\/+|\/+$/g, '') || 'index';
  const pathOf = (slug: string) => (slug === 'index' ? '/' : `/${slug}/`);
  const titleOf = (el?: HTMLElement) => el?.dataset.title || el?.dataset.slug || '';

  let stack = [slugOf(location.pathname)];
  let leaves = [firstLeaf];
  let focus = -1;
  let busy = false;

  // --- address

  function readUrl() {
    const w = new URLSearchParams(location.search).get('w');
    return [...(w ? w.split(',').filter(Boolean) : []), slugOf(location.pathname)];
  }

  function writeUrl() {
    const before = stack.slice(0, -1);
    const url = pathOf(stack.at(-1)!) + (before.length ? `?w=${before.join(',')}` : '');
    if (location.pathname + location.search !== url) history.pushState(null, '', url);
  }

  // --- pages

  const cache = new Map<string, Promise<HTMLElement>>();
  cache.set(firstLeaf.dataset.slug!, Promise.resolve(firstLeaf.cloneNode(true) as HTMLElement));

  const absent = new Set(
    [...document.querySelectorAll<HTMLElement>('a.is-missing[data-slug]')].map((a) => a.dataset.slug!),
  );

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

  function prefetch(slug: string) {
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

  const leafFor = async (slug: string) => document.importNode(await prefetch(slug), true);

  async function build(next: string[]) {
    const pool = [...leaves];
    const els = await Promise.all(
      next.map((slug) => {
        const k = pool.findIndex((el) => el.dataset.slug === slug);
        return k >= 0 ? pool.splice(k, 1)[0] : leafFor(slug);
      }),
    );
    leaves.filter((el) => !els.includes(el)).forEach((el) => el.remove());
    els.forEach((el) => track.appendChild(el));
    stack = next;
    leaves = els;
    els.forEach((el) =>
      el.querySelectorAll<HTMLElement>('a.is-missing[data-slug]').forEach((a) => absent.add(a.dataset.slug!)),
    );
    decorate();
  }

  function decorate() {
    leaves.forEach((el, i) => {
      el.dataset.i = String(i);
      el.style.setProperty('--i', String(i));
      el.querySelector<HTMLElement>('.leaf-close')!.hidden = stack.length === 1;
      el.querySelectorAll<HTMLElement>('a[data-slug]').forEach((a) => {
        const inBacklinks = !!a.closest('.backlinks');
        a.classList.toggle('is-open', !inBacklinks && a.dataset.slug === stack[i + 1]);
        a.classList.toggle('is-from', inBacklinks && a.dataset.slug === stack[i - 1]);
      });
      const navs = [
        ['prev', i - 1, '↑ veio de'],
        ['next', i + 1, '↓ segue pra'],
      ] as const;
      for (const [cls, j, label] of navs) {
        const nav = el.querySelector<HTMLElement>(`.trail-nav.${cls}`)!;
        nav.hidden = !leaves[j];
        nav.dataset.goto = String(j);
        if (leaves[j]) nav.innerHTML = `${label}<b>${esc(titleOf(leaves[j]))}</b>`;
      }
      el.querySelectorAll<HTMLImageElement>('img.photo-img').forEach(pixelate);
    });
    focus = -1;
    measure();
  }

  // --- photos
  // gatinho URLs are /<w>/<h>[/<id>] and serve any size.

  function resized(src: string, size: (w: number, h: number) => [number, number] | null) {
    const match = src.match(/^(https?:\/\/[^/]+)\/(\d+)\/(\d+)(\/\d+)?$/);
    const to = match && size(+match[2], +match[3]);
    return to ? `${match[1]}/${to[0]}/${to[1]}${match[4] ?? ''}` : null;
  }

  // Shows a tiny copy as a mosaic, then sharpens it once the real image arrives.
  const MOSAIC = 12;

  function pixelate(img: HTMLImageElement) {
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

  // --- margin lanes
  // Side items sit at the height they appear in the text, or at the top or bottom when
  // pinned, 16px apart, kept inside the page: pushed down past the item above, then
  // pulled back up from the end.

  const LANES = ['.trail-nav.prev:not([hidden]), .side.left, .trail-nav.next:not([hidden])', '.side.right'];
  const GAP = 16;

  function settleLanes(leaf: HTMLElement) {
    const height = leaf.offsetHeight;
    for (const selector of LANES) {
      const items = [...leaf.querySelectorAll<HTMLElement>(selector)]
        .filter((el) => {
          if (getComputedStyle(el).position === 'absolute') return true;
          el.style.translate = '';
          return false;
        })
        .map((el) => {
          const pin = el.classList.contains('prev') ? 'top' : el.classList.contains('next') ? 'bottom' : el.dataset.pin;
          const top = el.offsetTop;
          const h = el.offsetHeight;
          return { el, top, h, y: 0, pin, want: pin === 'top' ? 0 : pin === 'bottom' ? height - h : top };
        })
        .sort((a, b) => a.want - b.want);

      let floor = 0;
      for (const it of items) {
        it.y = Math.max(it.want, floor);
        floor = it.y + it.h + GAP;
      }
      const pushed = items.map((it) => it.y);

      let limit = height;
      for (let k = items.length - 1; k >= 0 && items[k].pin !== 'top'; k--) {
        items[k].y = Math.min(items[k].y, limit - items[k].h);
        limit = items[k].y - GAP;
      }

      const fits = items.every((it, k) => it.y >= 0 && (k === 0 || it.y >= items[k - 1].y + items[k - 1].h + GAP));
      items.forEach((it, k) => {
        const dy = (fits ? it.y : pushed[k]) - it.top;
        it.el.style.translate = dy ? `0 ${dy}px` : '';
      });
    }
  }

  // --- motion
  // f is the position along the trail: whole while reading a page, fractional while
  // crossing to the next. Where supported, the slide and crossfade run as
  // scroll-driven animations on the compositor; otherwise they're painted on scroll.

  const CROSS = 0.6; // share of the viewport the crossing takes
  const EDGE = 188; // minimum space above a resting page and after the last one
  const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
  const EASE_IN_OUT = 'cubic-bezier(0.37, 0, 0.63, 1)';

  const ScrollTimelineCtor = (window as any).ScrollTimeline;
  const timeline = ScrollTimelineCtor && new ScrollTimelineCtor({ source: document.scrollingElement });

  let marks: { anchor: number; start: number; x: number }[] = [];
  let anims: Animation[] = [];
  const shown: string[] = [];

  function measure() {
    const vh = innerHeight;
    const rest = (el: HTMLElement) => Math.max(EDGE, (vh - el.offsetHeight) / 2);
    leaves.forEach(settleLanes);

    // pages rest centered, or EDGE from the top when they don't fit; the document starts
    // at the first page's rest and ends at the last one's, at least EDGE past its text
    const last = leaves.at(-1)!;
    track.style.paddingTop = `${rest(leaves[0])}px`;
    const anchors = leaves.map((el) => el.offsetTop - rest(el));
    const bottom = last.offsetTop + last.offsetHeight;
    const end = Math.max(anchors.at(-1)! + vh, bottom + EDGE);
    track.style.paddingBottom = `${Math.ceil(end - bottom)}px`;

    marks = leaves.map((el, i) => ({
      anchor: anchors[i],
      start: i ? Math.max(anchors[i - 1], anchors[i] - vh * CROSS) : anchors[i],
      x: el.offsetLeft,
    }));

    bind();
    kick();
  }
  new ResizeObserver(measure).observe(track);

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
    leaves.forEach((el, j) => {
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
  function kick() {
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
      leaves.forEach((el, j) => {
        const opacity = (0.2 + 0.8 * Math.max(0, 1 - Math.abs(f - j))).toFixed(2);
        if (shown[j] !== opacity) el.style.opacity = shown[j] = opacity;
      });
    }

    const active = Math.round(f);
    if (active !== focus) {
      focus = active;
      leaves.forEach((el, j) => el.classList.toggle('is-active', j === active));
      paintBars();
    }
  }

  function paintBars() {
    crumbs.innerHTML = leaves
      .map((el, i) => {
        const arrow = i ? '<span>→</span>' : '';
        return `${arrow}<button data-crumb="${i}" class="${i === focus ? 'is-active' : ''}">${esc(titleOf(el))}</button>`;
      })
      .join('');
    document
      .querySelectorAll<HTMLElement>('[data-go]')
      .forEach((a) => a.classList.toggle('is-active', stack[focus] === a.dataset.go));
    toTop.hidden = focus <= 0;
    const title = titleOf(leaves[focus]);
    document.title = stack[focus] === 'index' || !title ? 'guiksr' : `${title} · guiksr`;
  }

  function scrollToLeaf(i: number, instant = false) {
    if (!leaves[i]) return;
    if (!marks[i]) measure();
    scrollTo({ top: marks[i].anchor, behavior: instant || reduced.matches ? 'auto' : 'smooth' });
  }

  function enter(el: HTMLElement) {
    if (reduced.matches) return;
    [...el.children].forEach((child, k) => (child as HTMLElement).style.setProperty('--k', String(k)));
    el.classList.add('is-entering');
    setTimeout(() => el.classList.remove('is-entering'), 1800);
  }

  function leave(from: number) {
    const going = leaves.slice(from);
    if (!going.length || reduced.matches) return Promise.resolve();
    going.forEach((el) => el.classList.add('is-leaving'));
    return new Promise((resolve) => setTimeout(resolve, 320));
  }

  // --- opening and closing

  async function open(i: number, slug: string) {
    if (busy) return;
    if (stack[i - 1] === slug) return scrollToLeaf(i - 1);
    if (stack[i + 1] === slug) return scrollToLeaf(i + 1);
    busy = true;
    prefetch(slug);
    await leave(i + 1);
    await build([...stack.slice(0, i + 1), slug]);
    writeUrl();
    enter(leaves.at(-1)!);
    scrollToLeaf(leaves.length - 1);
    busy = false;
  }

  async function close(i: number) {
    if (busy) return;
    busy = true;
    const keep = Math.max(1, i);
    await leave(keep);
    await build(stack.slice(0, keep));
    writeUrl();
    scrollToLeaf(leaves.length - 1);
    busy = false;
  }

  // --- lightbox

  const lightbox = document.querySelector('.lightbox') as HTMLElement;
  const lbImg = lightbox.querySelector('img') as HTMLImageElement;
  const lbCaption = lightbox.querySelector('p') as HTMLElement;
  const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
  let lbFrom: HTMLImageElement | null = null;

  const sharper = (src: string, width: number) =>
    resized(src, (w, h) => {
      const k = Math.min(2000 / Math.max(w, h), (width * devicePixelRatio) / w);
      return k > 1 ? [Math.round(w * k), Math.round(h * k)] : null;
    }) ?? src;

  function flight(from: DOMRect, to: DOMRect) {
    return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`;
  }

  function openImage(img: HTMLImageElement) {
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

  function closeImage(fly = true) {
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

  // --- events

  const plainClick = (e: MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0);

  track.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const leaf = target.closest<HTMLElement>('.leaf');
    if (!leaf) return;
    const i = +leaf.dataset.i!;

    const photo = target.closest<HTMLImageElement>('figure.photo img');
    if (photo) return openImage(photo);
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
      const i = stack.indexOf(go.dataset.go!);
      return i >= 0 ? scrollToLeaf(i) : open(Math.max(0, focus), go.dataset.go!);
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
    if (!lightbox.hidden) return closeImage();
    if (stack.length > 1) close(stack.length - 1);
  });

  addEventListener('popstate', async () => {
    await build(readUrl());
    scrollToLeaf(leaves.length - 1, true);
  });

  // --- start
  // The loader holds for at least 650ms so a fast load reads as a beat, not a flash.

  history.scrollRestoration = 'manual';
  const pause = new Promise((resolve) => setTimeout(resolve, reduced.matches ? 0 : 650));
  Promise.all([build(readUrl()), document.fonts.ready, pause]).then(() => {
    measure();
    scrollToLeaf(leaves.length - 1, true);
    document.querySelector('.loader')?.classList.add('is-done');
    enter(leaves.at(-1)!);
  });
}
