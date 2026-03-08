import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdoc}',
    base: './src/content/posts',
  }),
  schema: z.object({
    title: z.union([
      z.string().min(1).max(120),
      z.object({
        name: z.string().min(1).max(120),
        slug: z.string().min(1),
      }),
    ]),
    advanced: z
      .object({
        discriminant: z.boolean(),
        value: z
          .object({
            excerpt: z.string().max(200).optional(),
            cover: z.string().optional(),
            category: z.string().optional(),
            tags: z.array(z.string()).max(8).optional(),
            status: z.enum(['draft', 'published']).optional(),
            seoTitle: z.string().optional(),
            seoDescription: z.string().max(160).optional(),
            canonical: z.string().url().optional(),
          })
          .optional(),
      })
      .optional(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  }),
});

export const collections = {
  posts,
};
