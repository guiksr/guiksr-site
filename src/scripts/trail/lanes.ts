// Side items sit at the height they appear in the text, or at the top or bottom when
// pinned, 16px apart, kept inside the page: pushed down past the item above, then
// pulled back up from the end.

const LANES = ['.trail-nav.prev:not([hidden]), .side.left, .trail-nav.next:not([hidden])', '.side.right'];
const GAP = 16;

export function settleLanes(leaf: HTMLElement) {
  const height = leaf.offsetHeight;
  for (const selector of LANES) {
    const items = [...leaf.querySelectorAll<HTMLElement>(selector)]
      .filter((el) => {
        if (!el.offsetParent) return false; // a photo not revealed yet
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
