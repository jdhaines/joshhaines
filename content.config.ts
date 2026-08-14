import { defineContentConfig, defineCollection, z } from "@nuxt/content"

export default defineContentConfig({
  collections: {
    // Static pages (home, about, etc.) living at the content root.
    content: defineCollection({
      type: "page",
      source: "*.md",
    }),
    // Long-form articles, talks, and podcast write-ups. All entries share a
    // single flat `/content/<slug>` URL namespace regardless of `contentType`
    // (article/talk/podcast/future types), so recategorizing a post is just
    // an edit to its frontmatter and never breaks its permalink. "Writing",
    // "Talks", and "Podcasts" are purely presentational: filtered listing
    // pages over this one collection, not separate URL trees.
    posts: defineCollection({
      type: "page",
      source: "content/**",
      schema: z.object({
        description: z.string(),
        // Stored as a plain `YYYY-MM-DD` string, not `z.date()`. Nuxt
        // Content's SQLite storage layer re-serializes `z.date()` fields
        // using local-timezone `Date` getters (getFullYear/getMonth/getDate),
        // which silently rolls a date-only value back a day whenever the
        // build/dev machine's local time is behind UTC (e.g. "2026-08-07"
        // becomes "2026-08-06" in storage). Keeping it a string sidesteps
        // that round-trip entirely -- the app already parses/formats these
        // values with `new Date(...)` (in UTC) wherever it needs a Date, and
        // ISO-format strings sort chronologically as plain text, so
        // `.order("publishedAt", ...)` is unaffected.
        publishedAt: z.string(),
        updatedAt: z.string().optional(),
        // The primary on-page display image -- the book cover for
        // `bookReview`s, or a featured/thumbnail image for everything else.
        // Shown in listing cards, the homepage sections, and the article
        // header/sidebar.
        coverImage: z.string().optional(),
        coverImageAlt: z.string().optional(),
        // Overrides the Open Graph / social-share preview image when it
        // should differ from the on-page `coverImage` -- e.g. book reviews
        // show the real book cover as `coverImage`, but keep a purpose-made
        // 1200x630-ish social card (`socialImage`) for link previews on
        // LinkedIn, X, etc. Falls back to `coverImage` when not set.
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
        contentType: z
          .enum(["article", "talk", "podcast", "bookReview"])
          .default("article"),
        // Author(s) of the book being reviewed (only meaningful when
        // contentType is `bookReview`; distinct from the `author` field
        // below, which is the reviewer/site author). Use an array for
        // co-authored books (e.g. `['Jim Collins', 'William Lazier']`) so
        // each author is unambiguous and individually searchable/linkable --
        // a single string is still fine for single-author books. See
        // `app/utils/book-author.ts` for the shared normalize/format/search
        // helpers that read this field.
        bookAuthor: z.union([z.string(), z.array(z.string())]).optional(),
        // Slug of an entry in the `authors` collection.
        author: z.string().default("josh"),
        // Manual override for the "X min read"/"X min listen" badge.
        // Required in practice for podcasts (no body text to estimate from);
        // optional elsewhere to override the auto-calculated reading time.
        runtime: z.string().optional(),
        // Up to 3 curated slugs (e.g. "pgp-gpg-yubikeys-oh-my") for the
        // "You Might Also Like" sidebar, independent of the automatic
        // tag-based "On This Topic" list.
        relatedWriting: z.array(z.string()).max(3).default([]),
        // Slug of an entry in the `tools` collection -- shows a "how
        // this was drafted" sidebar block when set. Deliberately optional
        // with no default: this is a fully opt-in feature (added May 2024
        // when Josh started drafting in Essay), not a retroactive claim
        // about how older posts were actually written.
        draftTool: z.string().optional(),
        // Photos of the hand-typed rough-draft pages (only populated for
        // typewriter-drafted posts). Plain remote URLs (img.joshhaines.com),
        // rendered as a simple prev/next carousel below the draftTool block.
        typedPageImages: z.array(z.string()).default([]),
      }),
    }),
    // The Book Shelf's ranked order ("most useful" -> "least useful") and its
    // separate, unranked "honorable mentions" list. Deliberately just an
    // ordered array of `posts` slugs -- reordering the shelf is a one-line
    // move in this single file, never a renumbering pass across every book
    // review's frontmatter. See app/utils/book-shelf.ts for how this gets
    // combined with the actual `bookReview` posts at render time.
    bookShelf: defineCollection({
      type: "data",
      source: "book-shelf.yml",
      schema: z.object({
        order: z.array(z.string()),
        honorableMentions: z.array(z.string()).default([]),
      }),
    }),
    // Author profiles referenced by `writing` posts' `author` field.
    authors: defineCollection({
      type: "page",
      source: "authors/**",
      schema: z.object({
        name: z.string(),
        avatar: z.string(),
        occupation: z.string().optional(),
        company: z.string().optional(),
        email: z.string().optional(),
        linkedin: z.string().optional(),
        github: z.string().optional(),
        discord: z.string().optional(),
      }),
    }),
    // Profiles for whatever Josh actually drafted a post on -- the default
    // "Essay" writing app, or a specific typewriter once he started typing
    // rough drafts by hand -- plus any other tool worth a profile page (a
    // favorite pen, etc.). Referenced by `posts.draftTool`. Each entry gets
    // its own page (like `authors`), plus a compact "how this was drafted"
    // widget in the article sidebar when it's a draftTool.
    tools: defineCollection({
      type: "page",
      source: "tools/**",
      schema: z.object({
        name: z.string(),
        kind: z.enum(["app", "typewriter"]),
        // Typewriters only (e.g. "Green") -- not meaningful for apps.
        color: z.string().optional(),
        // App homepage, or a reference/manual link for a typewriter model.
        link: z.string().optional(),
        // Primary photo -- used as the small thumbnail in the sidebar
        // widget and as the profile page's default social/OG image.
        image: z.string().optional(),
        imageAlt: z.string().optional(),
        // Overrides the Open Graph / social-share preview image, and is
        // preferred over `image` for the /tools index listing card (which
        // renders a wide 16:9 crop, same convention as `posts.socialImage`).
        // Falls back to `image` when not set.
        socialImage: z.string().optional(),
        // Additional high-res photos (e.g. multiple angles of a
        // typewriter) rendered as a carousel on the dedicated
        // /tools/<slug> profile page. Not shown in the compact sidebar
        // widget -- that only ever uses `image`.
        images: z.array(z.string()).default([]),
        // Short one-liner shown in the compact sidebar widget and the
        // /tools index listing card. The full markdown body (below the
        // frontmatter) is reserved for the dedicated /tools/<slug> profile
        // page.
        tagline: z.string().optional(),
      }),
    }),
  },
})
