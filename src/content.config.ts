import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// src/content/blog/gatinho.md -> /blog/gatinho/
const pages = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['home', 'índice', 'post', 'foto', 'filme', 'página', 'viagem']),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { pages };
