import { defineCollection, z } from 'astro:content';
import { parse as parseCsv } from "csv-parse/sync";
import { glob, file } from 'astro/loaders';

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

const projects = defineCollection({
    loader: file("./src/data/projects/projects.csv", { parser: (text) => parseCsv(text, { columns: true, skipEmptyLines: true })}),
    schema: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        image: z.string().optional(),
        link: z.string().optional(),
        tags: z.string().transform((val) => val ? val.split(';').map(tag => tag.trim()) : []),
        langs: z.string().transform((val) => val ? val.split(';').map(lang => lang.trim()) : []),
      }),
});

export const collections = { blog, projects };
