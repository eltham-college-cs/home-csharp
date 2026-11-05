import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const videoSlot = z
  .object({
    file: z.string().optional(),
    captions: z.string().optional(),
    poster: z.string().optional(),
    youtube: z.string().optional(),
  })
  .nullable()
  .optional();

const lessons = defineCollection({
  loader: glob({
    pattern: '**/index.mdx',
    base: './src/content/lessons',
    generateId: ({ entry }) => entry.replace(/\/index\.mdx$/, ''),
  }),
  schema: z.object({
    year: z.number().int().min(7).max(9),
    unit: z.string(),
    unitSlug: z.string(),
    lesson: z.number().int().positive(),
    title: z.string(),
    summary: z.string(),
    minutes: z.number().int().positive().default(15),
    keywords: z.array(z.string()).default([]),
    deck: z.string().url().optional(),
    codebashTopic: z.string().optional(),
    /** Names of the matching CodeBash tasks in this year's "C# at Home" topic. */
    codebashTasks: z.array(z.string()).default([]),
    /** What Yoka says in the Year 7 header. */
    yokaSays: z.string().optional(),
    videos: z.record(videoSlot).default({}),
    draft: z.boolean().default(false),
  }),
});

const years = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/years' }),
  schema: z.object({
    year: z.number().int().min(7).max(9),
    title: z.string(),
    tagline: z.string(),
    units: z.array(z.object({ slug: z.string(), title: z.string(), summary: z.string() })),
    /** Lesson ids (folder paths) to feature under "This week" on the home page. */
    thisWeek: z.array(z.string()).default([]),
  }),
});

export const collections = { lessons, years };
