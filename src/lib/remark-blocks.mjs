import { visit } from 'unist-util-visit';

// :::left, :::right, :::facts and :::photos become elements; rehype-site.mjs finishes them.
// Side blocks take {top} or {bottom} to pin them to that end of the page; :::photos{stack}
// stacks full-width photos instead of a grid.
const BLOCKS = {
  left: { tag: 'aside', className: ['side', 'left'] },
  right: { tag: 'aside', className: ['side', 'right'] },
  facts: { tag: 'aside', className: ['side', 'right', 'facts'] },
  photos: { tag: 'div', className: ['photos'] },
};

// Hidden side blocks, revealed from the text:
// - :foto[label]{src=… cap=… left} hides that photo in the margin beside its paragraph;
// - :revela[label]{#id} reveals a side block written as :::right{#id} (or left, facts).
const isPhotoBlock = (block) =>
  block.children.every((c) => c.type === 'paragraph' && c.children.length === 1 && c.children[0].type === 'image');

const button = (node, id, kind) => {
  node.data = {
    hName: 'button',
    hProperties: { type: 'button', className: ['reveal-link', `is-${kind}`], dataReveal: id, ariaExpanded: 'false' },
  };
};

function reveals(tree) {
  const hidden = new Map();
  visit(tree, 'containerDirective', (node) => {
    const id = node.attributes?.id;
    if (id && BLOCKS[node.name]?.className.includes('side')) hidden.set(id, isPhotoBlock(node) ? 'photo' : 'note');
  });

  let n = 0;
  tree.children = tree.children.flatMap((block) => {
    const notes = [];
    visit(block, 'textDirective', (node) => {
      const { src, cap = '', id, ...rest } = node.attributes || {};
      if (node.name === 'revela' && hidden.has(id)) return button(node, id, hidden.get(id));
      if (node.name !== 'foto' || !src) return;
      const note = `foto-${++n}`;
      notes.push({
        type: 'reveal',
        data: {
          hName: 'aside',
          hProperties: { className: ['side', 'left' in rest ? 'left' : 'right', 'reveal'], dataNote: note },
        },
        children: [{ type: 'paragraph', children: [{ type: 'image', url: src, alt: cap }] }],
      });
      button(node, note, 'photo');
    });
    return [...notes, block];
  });
}

export default function remarkBlocks() {
  return (tree) => {
    reveals(tree);
    visit(tree, (node, index, parent) => {
      if (node.data?.hName) return;
      if (node.type === 'containerDirective' && BLOCKS[node.name]) {
        const { tag, className } = BLOCKS[node.name];
        const attrs = node.attributes || {};
        const side = className.includes('side');
        const pin = side && ['top', 'bottom'].find((k) => k in attrs);
        const note = side && attrs.id;
        node.data = {
          hName: tag,
          hProperties: {
            className: [...className, ...(note ? ['reveal'] : []), ...('stack' in attrs ? ['stack'] : [])],
            ...(pin && { dataPin: pin }),
            ...(note && { dataNote: note }),
          },
        };
        return;
      }
      // other directives were plain text, like "10:30"; a reveal with nothing to show keeps its label
      if (['textDirective', 'leafDirective', 'containerDirective'].includes(node.type) && parent) {
        const marker = node.type === 'textDirective' ? ':' : node.type === 'leafDirective' ? '::' : ':::';
        const label = node.type === 'textDirective' && ['foto', 'revela'].includes(node.name);
        const text = label ? [] : [{ type: 'text', value: marker + node.name }];
        parent.children.splice(index, 1, ...text, ...(node.children || []));
        return index;
      }
    });
  };
}
