import { visit } from 'unist-util-visit';

// :::left, :::right, :::facts and :::photos become elements; rehype-site.mjs finishes them.
const BLOCKS = {
  left: { tag: 'aside', className: ['side', 'left'] },
  right: { tag: 'aside', className: ['side', 'right'] },
  facts: { tag: 'aside', className: ['side', 'right', 'facts'] },
  photos: { tag: 'div', className: ['photos'] },
};

export default function remarkBlocks() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (node.type === 'containerDirective' && BLOCKS[node.name]) {
        const { tag, className } = BLOCKS[node.name];
        node.data = { hName: tag, hProperties: { className } };
        return;
      }
      // other directives were plain text, like "10:30"
      if (['textDirective', 'leafDirective', 'containerDirective'].includes(node.type) && parent) {
        const marker = node.type === 'textDirective' ? ':' : node.type === 'leafDirective' ? '::' : ':::';
        parent.children.splice(index, 1, { type: 'text', value: marker + node.name }, ...(node.children || []));
        return index;
      }
    });
  };
}
