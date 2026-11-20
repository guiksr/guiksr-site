import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import remarkBlocks from './src/lib/remark-blocks.mjs';
import rehypeSite from './src/lib/rehype-site.mjs';
import { listSlugs } from './src/lib/slugs.mjs';

export default defineConfig({
  site: 'https://guiksr.com',
  build: { format: 'directory' },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkDirective, remarkBlocks],
      rehypePlugins: [[rehypeSite, { slugs: listSlugs() }]],
    }),
  },
});
