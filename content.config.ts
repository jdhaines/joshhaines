import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // Static pages (home, about, etc.) living at the content root.
    content: defineCollection({
      type: 'page',
      source: '*.md',
    }),
    // Long-form articles, talks, and podcast write-ups.
    writing: defineCollection({
      type: 'page',
      source: 'writing/**',
      schema: z.object({
        description: z.string(),
        publishedAt: z.date(),
        updatedAt: z.date().optional(),
        image: z.string().optional(),
        imageAlt: z.string().optional(),
        topics: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
        canonicalUrl: z.string().optional(),
      }),
    }),
  },
})
