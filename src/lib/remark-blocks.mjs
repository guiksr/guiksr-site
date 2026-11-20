import { visit } from 'unist-util-visit';

// Block components, written as container directives in the markdown:
//
//   :::left / :::right   anything that lives beside the text, in a margin lane
//   :::facts             a "key: value" list shown as a fact sheet, right margin
//   :::photos            a grid of images (linked images open that page)
//
// They become plain elements here; rehype-site.mjs finishes the markup.
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
      // anything else that looks like a directive was just text ("10:30", "ex:ample")
      if (['textDirective', 'leafDirective', 'containerDirective'].includes(node.type) && parent) {
        const marker = node.type === 'textDirective' ? ':' : node.type === 'leafDirective' ? '::' : ':::';
        parent.children.splice(index, 1, { type: 'text', value: marker + node.name }, ...(node.children || []));
        return index;
      }
    });
  };
}
