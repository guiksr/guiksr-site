import { visit, SKIP } from 'unist-util-visit';
import { h } from 'hastscript';
import { slugOf } from './slugs.mjs';

const cls = (node) => [].concat(node.properties?.className || []);
const textOf = (node) => (node.type === 'text' ? node.value : (node.children || []).map(textOf).join(''));

// gatinho URLs end in /<w>/<h>[/<id>] and local files in -<w>x<h>.<ext>, which reserves the image's space
function sized(img) {
  const src = String(img.properties.src);
  const m = src.match(/\/(\d+)\/(\d+)(?:\/\d+)?$/) || src.match(/-(\d+)x(\d+)\.\w+$/);
  img.properties = {
    ...img.properties,
    className: ['photo-img'],
    loading: 'lazy',
    decoding: 'async',
    ...(m && { width: m[1], height: m[2] }),
  };
  return img;
}

// internal links get a slug and trailing slash (missing pages are marked); external ones open in a new tab
function link(node, slugs, extra = ['ilink']) {
  const href = String(node.properties.href || '');
  if (href.startsWith('/')) {
    const slug = slugOf(href);
    const missing = !slugs.has(slug);
    node.properties.href = slug === 'index' ? '/' : `/${slug}/`;
    node.properties.dataSlug = slug;
    node.properties.className = [...cls(node), ...extra, ...(missing ? ['is-missing'] : [])];
    if (missing) node.properties.title = 'ainda não existe';
  } else if (/^https?:/.test(href)) {
    node.properties.className = [...cls(node), 'xlink'];
    node.properties.target = '_blank';
    node.properties.rel = 'noopener';
  }
  return node;
}

// <figure class="photo"> for a plain image, <a class="photo"> for a linked one
function photo(node, slugs) {
  const img = node.tagName === 'img' ? node : node.children.find((c) => c.tagName === 'img');
  const alt = img.properties.alt;
  const kids = [h('span.photo-frame', [sized(img)]), ...(alt ? [h('span.photo-cap', alt)] : [])];
  if (node.tagName !== 'a') return h('figure.photo', kids);
  const a = link(node, slugs, []);
  a.properties.className = ['photo', ...cls(a).filter((c) => c !== 'xlink')];
  a.children = kids;
  return a;
}

const isPhoto = (n) => n.tagName === 'img' || (n.tagName === 'a' && n.children.some((c) => c.tagName === 'img'));
const meaningful = (n) => !(n.type === 'text' && !n.value.trim());

export default function rehypeSite({ slugs }) {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // :::photos: each image becomes a grid cell
      if (cls(node).includes('photos')) {
        const found = [];
        visit(node, 'element', (n) => {
          if (isPhoto(n)) {
            found.push(photo(n, slugs));
            return SKIP;
          }
        });
        node.children = found;
        return SKIP;
      }

      // :::facts: "key: value" items become a definition list
      if (cls(node).includes('facts')) {
        const rows = [];
        visit(node, 'element', (n) => {
          if (n.tagName !== 'li') return;
          const [k, ...v] = textOf(n).split(':');
          rows.push(h('dt', k.trim()), h('dd', v.join(':').trim()));
          return SKIP;
        });
        node.children = [h('dl', rows)];
        return SKIP;
      }

      // a paragraph holding just an image is a figure
      if (node.tagName === 'p' && parent) {
        const kids = node.children.filter(meaningful);
        if (kids.length === 1 && isPhoto(kids[0])) {
          parent.children[index] = photo(kids[0], slugs);
          return SKIP;
        }
      }

      if (node.tagName === 'a') link(node, slugs);
    });
  };
}
