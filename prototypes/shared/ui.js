// Shared bits for the window prototypes: a tiny markdown renderer, backlinks,
// window markup, URL-as-state helpers and the top bar.
(function () {
  const P = window.PAGES;
  const BAR = 32;
  const PROTOS = [
    ['01-escada.html', '1 escada'],
    ['02-arvore.html', '2 árvore'],
    ['03-cascata.html', '3 cascata'],
    ['04-fluxo.html', '4 fluxo'],
  ];

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const slugOf = (href) => href.replace(/^\/+|\/+$/g, '') || 'index';
  const pathOf = (slug) => (slug === 'index' ? '' : slug);
  // ![legenda](src /optional-link) — src is an image URL or a #hex placeholder color
  const FOTO = /^!\[(.*?)\]\((#[0-9a-fA-F]{3,8}|https?:\/\/\S+?)(?: (\/\S*))?\)$/;

  // --- markdown (just enough for the fake content) ---------------------------

  function ilink(slug, label) {
    const missing = P[slug] ? '' : ' is-missing" title="ainda não existe';
    return `<a class="ilink${missing}" href="#${slug}" data-slug="${slug}">${label}</a>`;
  }

  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, h) =>
        h.startsWith('/') ? ilink(slugOf(h), t) : `<a class="xlink" href="${h}" target="_blank" rel="noopener">${t}</a>`);
  }

  // gatinho-style URLs end in /<w>/<h>[/<id>]: use them to reserve the image's space
  function sizeAttrs(src) {
    const m = src.match(/\/(\d+)\/(\d+)(?:\/\d+)?$/);
    return m ? ` width="${m[1]}" height="${m[2]}"` : '';
  }

  function foto(line) {
    const m = line.match(FOTO);
    if (!m) return '';
    const [, alt, src, href] = m;
    const pic = src.startsWith('#')
      ? `<span class="foto-img" style="--c:${src}" role="img" aria-label="${esc(alt)}"></span>`
      : `<img class="foto-img" src="${esc(src)}" alt="${esc(alt)}" loading="lazy"${sizeAttrs(src)}>`;
    const img = `${pic}${alt ? `<span class="foto-cap">${esc(alt)}</span>` : ''}`;
    if (!href) return `<figure class="foto">${img}</figure>`;
    const slug = slugOf(href);
    return `<a class="foto" href="#${slug}" data-slug="${slug}">${img}</a>`;
  }

  function md(src) {
    let html = '', para = [], list = null, fotos = null;
    const flushP = () => { if (para.length) { html += `<p>${inline(para.join(' '))}</p>`; para = []; } };
    const flushL = () => { if (list) { html += `<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`; list = null; } };
    const flush = () => { flushP(); flushL(); };

    for (const raw of src.trim().split('\n')) {
      const line = raw.trim();
      let m;
      if (fotos) {
        if (line === '::') { html += `<div class="fotos">${fotos.join('')}</div>`; fotos = null; }
        else if (line) fotos.push(foto(line));
        continue;
      }
      if (!line) { flush(); continue; }
      if (line.startsWith('::fotos')) { flush(); fotos = []; continue; }
      if ((m = line.match(/^(#{2,3}) (.*)/))) { flush(); html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; continue; }
      if ((m = line.match(/^> (.*)/))) { flush(); html += `<blockquote>${inline(m[1])}</blockquote>`; continue; }
      if (FOTO.test(line)) { flush(); html += foto(line); continue; }
      if ((m = line.match(/^- (.*)/))) { flushP(); (list ||= []).push(m[1]); continue; }
      flushL(); para.push(line);
    }
    flush();
    return html;
  }

  // --- backlinks: built once from every page body ------------------------------

  const backlinks = {};
  for (const [slug, page] of Object.entries(P)) {
    const seen = new Set();
    for (const m of page.body.matchAll(/[( ](\/[\w\-\/]*)\)/g)) {
      const target = slugOf(m[1]);
      if (target === slug || seen.has(target)) continue;
      seen.add(target);
      (backlinks[target] ||= []).push(slug);
    }
  }

  // --- window markup ---------------------------------------------------------

  function windowEl(slug) {
    const page = P[slug] || {
      title: 'ainda não existe',
      kind: 'vazio',
      body: 'a página `/' + slug + '` ainda não foi escrita.\n\nno site de verdade, seria um arquivo `content/' + slug + '.md` esperando pra nascer.',
    };
    const bl = backlinks[slug] || [];
    const el = document.createElement('article');
    el.className = 'win';
    el.dataset.slug = slug;
    el.dataset.kind = page.kind;
    el.innerHTML = `
      <header class="win-bar">
        <span class="win-path"><span class="host">guiksr.com/</span>${esc(pathOf(slug))}</span>
        <span class="win-kind">${page.kind}</span>
        <button class="win-close" aria-label="fechar janela">×</button>
      </header>
      <div class="win-body" tabindex="-1">
        ${page.date ? `<div class="win-meta">${page.date}</div>` : ''}
        <h1>${esc(page.title)}</h1>
        ${md(page.body)}
        ${bl.length ? `<footer class="backlinks"><h2>linkado por</h2><ul>${bl.map((s) =>
          `<li>${ilink(s, esc(P[s].title))} <span class="bl-path">/${pathOf(s)}</span></li>`).join('')}</ul></footer>` : ''}
      </div>`;
    return el;
  }

  function fadeIn(el) {
    el.classList.add('is-new');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('is-new')));
  }

  // Orthogonal wire from the link inside `from` that points at `slug` to the title bar of `to`.
  // Coordinates are canvas-space (offsetLeft/Top), so it works under any camera transform.
  function wire(from, to, slug, on) {
    const fr = from.getBoundingClientRect();
    const scale = fr.height / from.offsetHeight || 1;
    const a = [...from.querySelectorAll('.win-body a[data-slug]')].find((a) => a.dataset.slug === slug);
    let ay = BAR / 2;
    if (a) { const r = a.getBoundingClientRect(); ay = (r.top + r.height / 2 - fr.top) / scale; }
    ay = Math.max(BAR / 2, Math.min(from.offsetHeight - 10, ay));
    const x1 = from.offsetLeft + from.offsetWidth, y1 = Math.round(from.offsetTop + ay);
    const x2 = to.offsetLeft, y2 = to.offsetTop + BAR / 2;
    const mx = Math.round(x1 + (x2 - x1) / 2);
    const cls = on ? ' class="on"' : '';
    return `<path${cls} d="M${x1} ${y1}H${mx}V${y2}H${x2}"/><rect${cls} x="${x1 - 3}" y="${y1 - 3}" width="6" height="6"/>`;
  }

  // --- URL as state ------------------------------------------------------------

  const readHash = () => decodeURIComponent(location.hash.slice(1)).split(',').filter(Boolean);

  function writeHash(parts, replace) {
    const h = '#' + parts.join(',');
    if (location.hash !== h) history[replace ? 'replaceState' : 'pushState'](null, '', h);
    syncUrl();
  }

  function syncUrl() {
    const u = document.querySelector('.topbar .url');
    if (u) u.textContent = 'guiksr.com/#' + decodeURIComponent(location.hash.slice(1));
  }

  function mountBar(current, extra = '') {
    const bar = document.createElement('nav');
    bar.className = 'topbar';
    bar.innerHTML = `
      <a class="brand" href="index.html" title="voltar pros protótipos">guiksr</a>
      <code class="url" title="o link guarda todas as janelas abertas"></code>
      <button class="btn" data-copy>copiar link</button>
      ${extra}

      <span class="spacer"></span>
      ${PROTOS.map(([f, n]) => `<a class="btn${f === current ? ' is-on' : ''}" href="${f}">${n}</a>`).join('')}`;
    document.body.appendChild(bar);
    const copy = bar.querySelector('[data-copy]');
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); copy.textContent = 'copiado!'; }
      catch { prompt('copia esse link:', location.href); }
      setTimeout(() => (copy.textContent = 'copiar link'), 1200);
    });
    syncUrl();
    return bar;
  }

  // Scroll on the desk steps between windows. One gesture = one step: after a step
  // the wheel is ignored until it goes quiet, or a fresh push arrives (trackpad
  // inertia only ever decays). Calls onStep('up' | 'down' | 'left' | 'right').
  function wheelStepper(onStep) {
    const w = { x: 0, y: 0, locked: false, last: 0, at: 0, idle: 0 };
    return (e) => {
      const mag = Math.max(Math.abs(e.deltaX), Math.abs(e.deltaY));
      const now = performance.now();
      clearTimeout(w.idle);
      w.idle = setTimeout(() => Object.assign(w, { x: 0, y: 0, locked: false }), 160);
      if (w.locked && now - w.at > 350 && mag > w.last * 1.6 && mag > 8) w.locked = false;
      w.last = mag;
      if (w.locked) return;
      w.x += e.deltaX; w.y += e.deltaY;
      const ax = Math.abs(w.x), ay = Math.abs(w.y);
      if (Math.max(ax, ay) < 40) return;
      Object.assign(w, { x: 0, y: 0, locked: true, at: now });
      onStep(ax > ay ? (e.deltaX > 0 ? 'right' : 'left') : (e.deltaY > 0 ? 'down' : 'up'));
    };
  }

  const isModified = (e) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

  window.GK = {
    P, BAR, md, esc, pathOf, backlinks, windowEl, fadeIn, wire, readHash, writeHash, mountBar, wheelStepper, isModified,
    reduced: matchMedia('(prefers-reduced-motion: reduce)'),
  };
})();
