import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  schema: z.object({
    title: z.string().min(1).max(120),
    excerpt: z.string().max(200).optional().default(''),
    cover: z.string().optional(),
    category: z.string().min(1),
    tags: z.array(z.string()).max(8).default([]),
    status: z.enum(['draft', 'published']).default('draft'),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().max(160).optional(),
    canonical: z.string().url().optional(),
  }),
});

export const collections = {
  posts,
};
