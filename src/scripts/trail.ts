// The trail. Every page is a real static page; this script strings them along a
// diagonal. An internal link opens its page beside the one you're reading instead of
// navigating away, and the address keeps the whole trail:
//
//   /blog/janelas/?w=index,blog   →   index → blog → janelas infinitas
//
// Native scroll drives all the motion. Without this script the site is just pages.

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

  let stack: string[] = [slugOf(location.pathname)];
  let leaves: HTMLElement[] = [firstLeaf];
  let focus = -1;

  // --- the address -------------------------------------------------------------

  function readUrl() {
    const w = new URLSearchParams(location.search).get('w');
    return [...(w ? w.split(',').filter(Boolean) : []), slugOf(location.pathname)];
  }

  function writeUrl() {
    const before = stack.slice(0, -1);
    const url = pathOf(stack[stack.length - 1]) + (before.length ? `?w=${before.join(',')}` : '');
    if (location.pathname + location.search !== url) history.pushState(null, '', url);
  }

  // --- pages ---------------------------------------------------------------------
  // Pages are fetched as HTML and their <article class="leaf"> lifted out. Fetches are
  // cached and start on hover, so most pages are already here by the time you click.

  const cache = new Map<string, Promise<HTMLElement>>();
  cache.set(firstLeaf.dataset.slug!, Promise.resolve(firstLeaf.cloneNode(true) as HTMLElement));

  function missing(slug: string) {
    const el = document.createElement('article');
    el.className = 'leaf';
    el.dataset.slug = slug;
    el.dataset.title = 'ainda não existe';
    el.innerHTML = `
      <div class="leaf-meta"><span class="path">/${esc(slug)}</span><span>vazio</span>
        <button class="leaf-close" aria-label="fechar daqui pra frente" hidden>×</button></div>
      <button class="trail-nav prev" hidden></button>
      <h1>ainda não existe</h1>
      <p>a página <code>/${esc(slug)}</code> ainda não foi escrita.</p>
      <button class="trail-nav next" hidden></button>`;
    return el;
  }

  // pages known not to exist yet (their links are marked at build time) aren't fetched
  const absent = new Set([...document.querySelectorAll<HTMLElement>('a.is-missing[data-slug]')].map((a) => a.dataset.slug!));

  function prefetch(slug: string) {
    if (absent.has(slug) && !cache.has(slug)) cache.set(slug, Promise.resolve(missing(slug)));
    if (!cache.has(slug)) {
      cache.set(slug, fetch(pathOf(slug))
        .then((r) => (r.ok ? r.text() : Promise.reject()))
        .then((html) => new DOMParser().parseFromString(html, 'text/html').querySelector<HTMLElement>('.leaf[data-slug]') || Promise.reject())
        .catch(() => missing(slug)));
    }
    return cache.get(slug)!;
  }

  const leafFor = async (slug: string) => document.importNode(await prefetch(slug), true) as HTMLElement;

  // Make the DOM match a new trail, reusing pages that are already on it.
  async function build(next: string[]) {
    const pool = [...leaves];
    const els = await Promise.all(next.map((slug) => {
      const k = pool.findIndex((el) => el.dataset.slug === slug);
      return k >= 0 ? pool.splice(k, 1)[0] : leafFor(slug);
    }));
    leaves.forEach((el) => { if (!els.includes(el)) el.remove(); });
    els.forEach((el) => track.appendChild(el));
    stack = next;
    leaves = els;
    els.forEach((el) => el.querySelectorAll<HTMLElement>('a.is-missing[data-slug]').forEach((a) => absent.add(a.dataset.slug!)));
    decorate();
  }

  // Per-trail state on each page: position, close button, which links are open,
  // and the names of its neighbours.
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
      for (const [cls, j, label] of [['prev', i - 1, '↑ veio de'], ['next', i + 1, '↓ segue pra']] as const) {
        const b = el.querySelector<HTMLElement>(`.trail-nav.${cls}`)!;
        b.hidden = !leaves[j];
        b.dataset.goto = String(j);
        if (leaves[j]) b.innerHTML = `${label}<b>${esc(titleOf(leaves[j]))}</b>`;
      }
      el.querySelectorAll('img').forEach((img) => {
        const done = () => img.classList.add('is-loaded');
        if (img.complete) done();
        else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
      });
    });
    focus = -1; // repaint the bars
    shown.length = 0;
    measure();
  }

  // --- margin lanes ---------------------------------------------------------------
  // Three columns: the main column sets the page's height; the side lanes live inside
  // it. Each side item wants to sit at the height where it appears in the text.
  // veio de is pinned to the top, segue pra to the end of the main content. Items never
  // overlap (16px apart) and never run past the end: going down the lane they're pushed
  // below the one above, then going up from the end they're pulled back inside. Only a
  // lane that can't fit at all overflows downward. On narrow screens lanes sit in the
  // text and nothing moves.

  const LANES = ['.trail-nav.prev:not([hidden]), .side.left, .trail-nav.next:not([hidden])', '.side.right'];
  const GAP = 16;

  function settleLanes(leaf: HTMLElement) {
    const H = leaf.offsetHeight;
    for (const sel of LANES) {
      const items = [...leaf.querySelectorAll<HTMLElement>(sel)]
        .filter((el) => {
          if (getComputedStyle(el).position === 'absolute') return true;
          el.style.translate = '';
          return false;
        })
        .map((el) => ({
          el, top: el.offsetTop, h: el.offsetHeight, y: 0,
          pin: el.classList.contains('prev') ? 'top' : el.classList.contains('next') ? 'end' : null,
        }));
      let floor = 0;
      for (const it of items) {
        it.y = Math.max(it.pin === 'end' ? H - it.h : it.top, floor);
        floor = it.y + it.h + GAP;
      }
      const pushed = items.map((it) => it.y);
      let limit = H;
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

  // --- motion -------------------------------------------------------------------
  // f is your position along the trail: a whole number while you read a page,
  // fractional while you cross the gap to the next one. The track slides and the pages
  // crossfade from f, so scrolling through a gap is the diagonal move. Layout is
  // measured once (and on resize), never during scroll.

  const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const CROSS = 0.34; // the crossing takes the last 34vh of scroll before a page's rest point

  let m: { anchor: number; x: number }[] = [];
  function measure() {
    const vh = innerHeight;
    leaves.forEach(settleLanes);
    m = leaves.map((el) => ({
      anchor: el.offsetTop - Math.max(80, Math.min((vh - el.offsetHeight) / 2, vh * 0.38)),
      x: el.offsetLeft,
    }));
    // end the document exactly where the last page rests: no empty scroll after it
    const pad = parseFloat(track.style.paddingBottom) || 0;
    const content = track.offsetHeight - pad;
    track.style.paddingBottom = `${Math.max(24, Math.ceil(m[m.length - 1].anchor + vh - content))}px`;
    kick();
  }
  new ResizeObserver(measure).observe(track);

  function trailPos() {
    const y = scrollY;
    let i = 0;
    while (m[i + 1] && y >= m[i + 1].anchor) i++;
    if (!m[i + 1]) return i;
    const next = m[i + 1].anchor, start = next - innerHeight * CROSS;
    return y <= start ? i : i + easeInOut((y - start) / (next - start));
  }

  let raf = 0;
  const kick = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (m.length) paint(trailPos()); }); };

  const shown: string[] = [];
  function paint(f: number) {
    const i = Math.min(Math.floor(f), m.length - 1), t = f - i;
    const x = m[i].x + ((m[i + 1] ? m[i + 1].x : m[i].x) - m[i].x) * t;
    track.style.transform = `translate3d(${(m[0].x - x).toFixed(1)}px, 0, 0)`;
    leaves.forEach((el, j) => {
      const o = (0.2 + 0.8 * Math.max(0, 1 - Math.abs(f - j))).toFixed(2);
      if (shown[j] !== o) { el.style.opacity = o; shown[j] = o; }
    });
    const active = Math.round(f);
    if (active !== focus) {
      focus = active;
      leaves.forEach((el, j) => el.classList.toggle('is-active', j === active));
      paintBars();
    }
  }

  function paintBars() {
    crumbs.innerHTML = leaves.map((el, i) =>
      `${i ? '<span>→</span>' : ''}<button data-crumb="${i}" class="${i === focus ? 'is-active' : ''}">${esc(titleOf(el))}</button>`).join('');
    document.querySelectorAll<HTMLElement>('[data-go]').forEach((a) => a.classList.toggle('is-active', stack[focus] === a.dataset.go));
    toTop.hidden = focus <= 0;
    const title = titleOf(leaves[focus]);
    document.title = stack[focus] === 'index' || !title ? 'guiksr' : `${title} · guiksr`;
  }

  // clicks use the browser's own smooth scroll
  function scrollToLeaf(i: number, instant = false) {
    if (!leaves[i]) return;
    if (!m[i]) measure();
    scrollTo({ top: m[i].anchor, behavior: instant || reduced.matches ? 'auto' : 'smooth' });
  }

  function enter(el: HTMLElement) {
    if (reduced.matches) return;
    [...el.children].forEach((c, k) => (c as HTMLElement).style.setProperty('--k', String(k)));
    el.classList.add('is-entering');
    setTimeout(() => el.classList.remove('is-entering'), 1800);
  }

  // pages being cut from the trail dissolve before they go
  function leave(from: number) {
    const going = leaves.slice(from);
    if (!going.length || reduced.matches) return Promise.resolve();
    going.forEach((el) => el.classList.add('is-leaving'));
    return new Promise((r) => setTimeout(r, 320));
  }

  // --- opening and closing ---------------------------------------------------------

  let busy = false;
  async function open(i: number, slug: string) {
    if (busy) return;
    if (stack[i - 1] === slug) return scrollToLeaf(i - 1);
    if (stack[i + 1] === slug) return scrollToLeaf(i + 1);
    busy = true;
    prefetch(slug);
    await leave(i + 1);
    await build(stack.slice(0, i + 1).concat(slug));
    writeUrl();
    enter(leaves[leaves.length - 1]);
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

  // --- lightbox ------------------------------------------------------------------
  // The photo grows out of its spot in the text, then swaps to a sharper copy sized
  // for the screen. Click, Esc or scrolling closes it.

  const lb = document.querySelector('.lightbox') as HTMLElement;
  const lbImg = lb.querySelector('img') as HTMLImageElement;
  const lbCap = lb.querySelector('p') as HTMLElement;
  const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
  let lbFrom: HTMLImageElement | null = null;

  // gatinho URLs are /<w>/<h>[/<id>]: ask for the size we'll actually show
  function sharper(src: string, w: number) {
    const mm = src.match(/^(https?:\/\/[^/]+)\/(\d+)\/(\d+)(\/\d+)?$/);
    if (!mm) return src;
    const k = Math.min(2400 / Math.max(+mm[2], +mm[3]), (w * devicePixelRatio) / +mm[2]);
    return k > 1 ? `${mm[1]}/${Math.round(+mm[2] * k)}/${Math.round(+mm[3] * k)}${mm[4] || ''}` : src;
  }

  function openImage(img: HTMLImageElement) {
    const nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height;
    const s = Math.min((innerWidth * 0.9) / nw, (innerHeight * 0.82) / nh);
    const w = Math.round(nw * s), h = Math.round(nh * s);
    lbFrom = img;
    lbImg.src = img.currentSrc || img.src;
    Object.assign(lbImg.style, { width: `${w}px`, height: `${h}px` });
    lbCap.textContent = img.alt;
    lb.hidden = false;
    const big = new Image();
    big.onload = () => { if (lbFrom === img) lbImg.src = big.src; };
    big.src = sharper(img.src, w);
    if (reduced.matches) return;
    const from = img.getBoundingClientRect(), to = lbImg.getBoundingClientRect();
    lbImg.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})` }, { transform: 'none' }],
      { duration: 420, easing: EASE });
    lb.animate([{ backgroundColor: 'transparent' }, {}], { duration: 420, easing: EASE });
    lbCap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 200, fill: 'backwards' });
  }

  function closeImage(fly = true) {
    if (lb.hidden || !lbFrom) return;
    const img = lbFrom;
    lbFrom = null;
    const done = () => { lb.hidden = true; lbImg.removeAttribute('src'); };
    if (reduced.matches) return done();
    const from = img.getBoundingClientRect(), to = lbImg.getBoundingClientRect();
    const onScreen = fly && from.bottom > 0 && from.top < innerHeight;
    const fade = lb.animate([{}, { backgroundColor: 'transparent' }], { duration: 300, easing: EASE, fill: 'forwards' });
    fade.onfinish = () => { done(); fade.cancel(); };
    const cap = lbCap.animate([{}, { opacity: 0 }], { duration: 150, fill: 'forwards' });
    cap.onfinish = () => cap.cancel();
    const fly2 = lbImg.animate(onScreen
      ? [{}, { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})` }]
      : [{}, { opacity: 0 }], { duration: 300, easing: EASE, fill: 'forwards' });
    fly2.onfinish = () => fly2.cancel();
  }

  lb.addEventListener('click', () => closeImage());

  // --- events -------------------------------------------------------------------

  const plainClick = (e: MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0);

  track.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const leaf = target.closest<HTMLElement>('.leaf');
    if (!leaf) return;
    const i = +leaf.dataset.i!;
    const pic = target.closest<HTMLImageElement>('figure.photo img');
    if (pic) return openImage(pic);
    const nav = target.closest<HTMLElement>('.trail-nav');
    if (nav) return scrollToLeaf(+nav.dataset.goto!);
    if (target.closest('.leaf-close')) return close(i);
    const a = target.closest<HTMLAnchorElement>('a[data-slug]');
    if (a) {
      if (plainClick(e)) { e.preventDefault(); open(i, a.dataset.slug!); }
      return;
    }
    if (!leaf.classList.contains('is-active') && !getSelection()?.toString()) scrollToLeaf(i);
  });

  // header and footer: a section already on the trail gets focused; otherwise it
  // opens after the page you're reading, same as clicking a link in it
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

  // start fetching a page as soon as a link to it is hovered
  document.addEventListener('pointerover', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('a[data-slug], a[data-go]');
    if (a) prefetch(a.dataset.slug || a.dataset.go!);
  });

  addEventListener('scroll', () => { kick(); closeImage(false); }, { passive: true });
  addEventListener('resize', measure);

  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!lb.hidden) return closeImage();
    if (stack.length > 1) close(stack.length - 1);
  });

  addEventListener('popstate', async () => {
    await build(readUrl());
    scrollToLeaf(leaves.length - 1, true);
  });

  // --- start ------------------------------------------------------------------------

  history.scrollRestoration = 'manual';
  build(readUrl()).then(() => scrollToLeaf(leaves.length - 1, true));
  document.fonts.ready.then(() => { measure(); scrollToLeaf(leaves.length - 1, true); });
}
