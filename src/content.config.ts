// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';

// 3. Define your collection(s)
const blog = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publication_date: z.coerce.date(),
        last_updated: z.coerce.date().optional(),
        draft: z.boolean().optional(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
        slug: z.string().optional(),
      }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { blog };