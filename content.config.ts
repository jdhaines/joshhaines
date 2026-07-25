import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // Static pages (home, about, etc.) living at the content root.
    content: defineCollection({
      type: 'page',
      source: '*.md',
    }),
    // Long-form articles, talks, and podcast write-ups. All entries share a
    // single flat `/content/<slug>` URL namespace regardless of `contentType`
    // (article/talk/podcast/future types), so recategorizing a post is just
    // an edit to its frontmatter and never breaks its permalink. "Writing",
    // "Talks", and "Podcasts" are purely presentational: filtered listing
    // pages over this one collection, not separate URL trees.
    posts: defineCollection({
      type: 'page',
      source: 'content/**',
      schema: z.object({
        description: z.string(),
        publishedAt: z.date(),
        updatedAt: z.date().optional(),
        image: z.string().optional(),
        imageAlt: z.string().optional(),
        // Overrides the Open Graph / social-share preview image when it
        // should differ from the on-page hero `image` -- e.g. book reviews
        // show the real book cover as `image`, but keep a purpose-made
        // 1200x630-ish social card (`socialImage`) for link previews on
        // LinkedIn, X, etc. Falls back to `image` when not set.
        socialImage: z.string().optional(),
        topics: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
        // Curates the homepage "Start Here" section -- a small, editorially
        // chosen set of foundational entry points, independent of recency.
        startHere: z.boolean().default(false),
        draft: z.boolean().default(false),
        canonicalUrl: z.string().optional(),
        // Drives category badges/colors and which filtered listing page
        // (/writing, /talks, /podcasts, /books) an entry shows up on. Add
        // new values here as new content types are introduced.
        contentType: z.enum(['article', 'talk', 'podcast', 'bookReview']).default('article'),
        // Author of the book being reviewed (only meaningful when
        // contentType is `bookReview`; distinct from the `author` field
        // below, which is the reviewer/site author).
        bookAuthor: z.string().optional(),
        // Slug of an entry in the `authors` collection.
        author: z.string().default('josh'),
        // Manual override for the "X min read"/"X min listen" badge.
        // Required in practice for podcasts (no body text to estimate from);
        // optional elsewhere to override the auto-calculated reading time.
        runtime: z.string().optional(),
        // Up to 3 curated slugs (e.g. "pgp-gpg-yubikeys-oh-my") for the
        // "You Might Also Like" sidebar, independent of the automatic
        // tag-based "On This Topic" list.
        relatedWriting: z.array(z.string()).max(3).default([]),
      }),
    }),
    // Author profiles referenced by `writing` posts' `author` field.
    authors: defineCollection({
      type: 'page',
      source: 'authors/**',
      schema: z.object({
        name: z.string(),
        avatar: z.string(),
        occupation: z.string().optional(),
        company: z.string().optional(),
        email: z.string().optional(),
        x: z.string().optional(),
        linkedin: z.string().optional(),
        github: z.string().optional(),
        discord: z.string().optional(),
      }),
    }),
  },
})

