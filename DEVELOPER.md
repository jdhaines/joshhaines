# Developer Reference

Quick reference for content types, frontmatter fields, and the homepage's
editorial sections. This file assumes you already know how to run/build the
app -- see `package.json` for scripts. This is a cheat sheet for the parts
that are easy to forget: what frontmatter fields exist, what they do, and how
new content shows up (or doesn't) in the various homepage sections.

Whenever the content schema (`content.config.ts`) or a homepage section
component changes, update this file in the same change.

## Content model

All long-form content (articles, talks, podcasts, book reviews) lives in a
single flat Nuxt Content collection (`posts`, sourced from `content/**`)
under one URL namespace: every entry is served at `/content/<slug>`
regardless of its `contentType`. "Writing", "Talks", "Podcasts", and "Books"
are just filtered listing pages over this one collection -- recategorizing a
post is a one-line frontmatter edit, and it never changes the post's URL.

Static pages (home, about, etc.) live in a separate `content` collection at
the content root (`content/*.md`) and author profiles live in a separate
`authors` collection (`content/authors/**`).

All pages without a specific social image use the branded
`/static/images/josh-haines-social.png` card. This covers home, listing,
static, author, and image-less post pages automatically; do not add a
`socialImage` solely to reproduce that default.

## `posts` frontmatter reference

Applies to every file in `content/content/*.md`.

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `title` | string | Yes | -- | Comes from Nuxt Content's built-in `page` schema, not listed in `content.config.ts`. |
| `description` | string | **Yes** | -- | Used for card excerpts, `<meta description>`, and OG description. |
| `publishedAt` | date (`YYYY-MM-DD`) | **Yes** | -- | Drives all "latest"/ordering queries and the byline date. |
| `updatedAt` | date | No | -- | Shown as "Updated \<date\>" in the article header when present. |
| `image` | string (path) | No | -- | Hero/thumbnail image, e.g. `/static/images/foo.jpg`. Used for homepage card art and as the social image only when `socialImage` is absent. Omit for text-only posts (e.g. the PGP article). |
| `imageAlt` | string | No | -- | Alt text for `image`. Provide this whenever `image` is set. |
| `socialImage` | string (path) | No | -- | Overrides the social-sharing preview image for LinkedIn, X, etc. Use this for the existing 600×314 AI-generated cards when the on-page `image` is a book cover. If omitted, falls back to `image`, then the site-wide Josh Haines card. |
| `topics` | string[] | No | `[]` | Reserved for future topic taxonomy. Not currently populated or rendered anywhere -- prefer `tags` today. |
| `tags` | string[] | No | `[]` | Rendered as badges on the article page and drives the tag-overlap "On This Topic" related list. |
| `featured` | boolean | No | `false` | Marks the single post shown in the homepage **Featured** section. See [Homepage sections](#homepage-sections--how-content-is-selected) below -- only set this on **one** post at a time. |
| `startHere` | boolean | No | `false` | Curates the homepage **Start Here** section (up to 3 posts). Independent of recency/featured status. |
| `draft` | boolean | No | `false` | Draft posts are excluded from every listing/query across the site (they still build, but aren't linked or queryable). |
| `canonicalUrl` | string (URL) | No | current page URL | Overrides the canonical `<link>` tag -- set this when migrating a post that had a different URL on the legacy site. |
| `contentType` | enum | No | `'article'` | One of `article`, `talk`, `podcast`, `bookReview`. Drives the badge label/color and which listing page (`/writing`, `/talks`, `/podcasts`, `/books`) the post appears on. |
| `bookAuthor` | string | Only for `bookReview` | -- | The book's author (distinct from `author`, the reviewer). Rendered under the title on book review pages and under the cover in the Bookshelf shelf. |
| `author` | string (slug) | No | `'josh'` | Must match a slug in `content/authors/**` (e.g. `josh` for `content/authors/josh.md`). |
| `runtime` | string | Effectively required for `podcast` | -- | Manual override for the "X min read"/"X min listen" badge, e.g. `'45 min listen'`. Podcasts have no body to estimate from, so always set this for podcasts. Optional elsewhere -- omit to auto-calculate reading time from the body. |
| `relatedWriting` | string[] (max 3) | No | `[]` | Curated slugs (not full paths -- e.g. `'techpoint'`, not `/content/techpoint`) for the "You Might Also Like" sidebar. Independent of the automatic tag-based "On This Topic" list. |

### `contentType` values and badge colors

| `contentType` | Label | Badge color | Listing page |
| --- | --- | --- | --- |
| `article` | Article | `primary` (blue) | `/writing` |
| `talk` | Talk | `warning` (orange) | `/talks` |
| `podcast` | Podcast | `success` (green) | `/podcasts` |
| `bookReview` | Book | `secondary` (red/orange) | `/books` |

Colors are defined in `app/utils/content-type.ts` (`getContentTypeBadge`).
Add new content types there and to the `contentType` enum in
`content.config.ts` together -- both need updating.

## `authors` frontmatter reference

Applies to files in `content/authors/*.md`, referenced by a post's `author`
field (matched by filename slug, e.g. `content/authors/josh.md` → `josh`).

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | **Yes** | Full display name. |
| `avatar` | string (path) | **Yes** | Avatar image path. |
| `occupation` | string | No | Shown next to name on the article header/author block. |
| `company` | string | No | Shown as ", \<company\>" after occupation. |
| `email` | string | No | Not currently rendered in a template; kept for reference/future use. |
| `x` | string (URL) | No | Renders an X/Twitter icon link in the author block/footer-style social lists. |
| `linkedin` | string (URL) | No | Renders a LinkedIn icon link. |
| `github` | string (URL) | No | Renders a GitHub icon link. |
| `discord` | string (URL) | No | Renders a Discord icon link. |

## Static `content` pages

Files directly under `content/*.md` (e.g. `content/about.md`). No custom
schema -- only Nuxt Content's built-in `page` type fields (`title`,
`description`). Body content renders through the page's own template (see
`app/pages/[...slug].vue` or the specific static page component if one
exists) rather than the article layout.

## Body content features

Available inside any post's markdown body:

- **GitHub-style alerts**: standard `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`,
  `> [!WARNING]`, `> [!CAUTION]` blockquotes render with GitHub's colors via
  `remark-github-blockquote-alert` (wired up in `mdc-remark-github-alert.ts`
  and `nuxt.config.ts`). Just write them like normal GitHub markdown.
- **Figma embed**: `<FigmaEmbed />` (a Vue/MDC component, usable directly in
  markdown body content) embeds a Figma slides deck and follows the site's
  light/dark color mode. Currently hardcoded to the TechPoint keynote's Figma
  file in `app/components/content/FigmaEmbed.vue` -- update the `src` there
  (or extend it with a prop) before reusing for a different talk's deck.

## Homepage sections & how content is selected

`app/pages/index.vue` queries the `posts` collection and passes the results
into small, purpose-built components (`app/components/Home*.vue`). Each
section is independent -- there's one component per editorial purpose, not
one per `contentType`. To change what shows up on the homepage, edit
frontmatter (`featured`, `startHere`, `contentType`, `publishedAt`) rather
than the page/components themselves.

| Section (component) | Query | How to control it |
| --- | --- | --- |
| **Explore** (`HomeExplore.vue`) | None -- static nav strip | Hardcoded list of the 4 content categories (Writing/Talks/Podcasts/Books). Edit the component directly to add/remove/reorder categories. |
| **Featured** (`HomeFeatured.vue`) | `featured = true`, newest first, limit 1 | Set `featured: true` on **exactly one** post to feature it prominently. If multiple posts have `featured: true`, only the newest (by `publishedAt`) is shown. |
| **Latest** (`HomeLatest.vue`) | All non-draft posts, newest first, limit 6, then the Featured post is filtered out and the list is capped to 4 | Automatic -- just publish posts with `draft: false`. The newest becomes the large left-hand item; the rest are compact rows. No frontmatter flag needed. |
| **Start Here** (`HomeStartHere.vue`) | `startHere = true`, limit 3 | Set `startHere: true` on up to 3 posts you consider the best entry points to your work. Order is oldest-first (`publishedAt ASC`) so you can control ordering by adjusting dates if needed, or just pick 3 -- order matters less than the curated set itself. |
| **From the Bookshelf** (`HomeBookshelf.vue`) | `contentType = 'bookReview'`, newest first, limit 6 | Automatic once you publish book reviews (`contentType: bookReview`). Displays cover art (`image`) + `bookAuthor`. No manual curation flag. |
| **Listen / Speaking** (`HomeMediaFeature.vue`) | `contentType IN ('talk', 'podcast')`, newest first, limit 4, Featured post excluded, prefers a `podcast` if one is available else falls back to the newest `talk` | Automatic. If you want a specific talk/podcast to show here instead of the newest, that generally means marking a *different* post as `featured` so this section's "newest excluding Featured" pick shifts, or adjusting `publishedAt`. There's currently no dedicated override flag for this section. |
| **Why I write about this** (`HomeClosingCta.vue`) | Queries the `josh` author profile only | Static content in the component + the `authors/josh.md` file (avatar, bio blurb). Not post-driven. |

### Quick recipes

- **"I published a new post and want it to be the big homepage feature"**:
  set `featured: true` on the new post, and remove/leave `featured: false` on
  the previous featured post (only one should be `true` at a time -- if more
  than one is `true`, ties are broken by newest `publishedAt`).
- **"I want 3 specific posts in Start Here, not just my newest 3"**: set
  `startHere: true` on exactly those 3 posts. It's independent of `featured`
  and of recency.
- **"My new podcast episode should show up in the Listen module"**: just
  publish it (`contentType: podcast`, `draft: false`) -- podcasts are
  preferred automatically over talks in that section as long as it isn't
  also the current `featured` post.
- **"A post shouldn't show up anywhere yet"**: set `draft: true`. It's
  excluded from every homepage section and listing page, but still builds at
  its URL (so you can preview it directly if needed -- consider also removing
  it from `relatedWriting` elsewhere until it's ready).

## Comments (Cloudflare Worker + D1 + Turnstile)

Every content page (`app/pages/content/[slug].vue`) renders a
`CommentsSection.vue` component that talks to a small same-origin API at
`/api/comments`, implemented in `workers/comments-api.ts` and deployed
alongside the static site via `wrangler.jsonc`'s `main` + `assets.
run_worker_first: ["/api/*"]`. Every other route is still served directly
from the static asset bundle -- the Worker script only ever runs for
`/api/*` requests.

This was chosen over a hosted comment SaaS (e.g. Hyvor Talk) or a
GitHub-account-based system (e.g. giscus) specifically to avoid requiring
commenters to have any account, to keep the data self-hosted, and because
the site already deploys to Cloudflare via Wrangler -- Turnstile (CAPTCHA)
and D1 (database) are free, first-party Cloudflare products that slot in
with no extra hosting.

Comments are **not free-form public** by default: every submission starts
as `pending` and only becomes visible once manually approved (see
"Moderating comments" below). Abuse prevention is intentionally simple
("rudimentary" per the brief, not a full spam-detection system) — honeypot
field, a Turnstile CAPTCHA token, basic length/keyword/link-count checks,
and a per-IP-hash rate limit. See `workers/comments-api.ts` for the exact
rules.

### One-time setup

1. **Create the D1 database** (requires `wrangler login` first) — **done**;
   `joshhaines-comments` already exists and `wrangler.jsonc`'s
   `d1_databases[0].database_id` is set. Only needed again if the database
   is ever recreated:
   ```sh
   npx wrangler login
   npx wrangler d1 create joshhaines-comments
   ```

2. **Apply the schema** — **done** (applied with `--remote` against the
   live database). Re-run this any time `workers/schema.sql` changes:
   ```sh
   npx wrangler d1 execute joshhaines-comments --remote --file=workers/schema.sql
   ```
   (Drop `--remote` to also/instead apply it to the local dev database used
   by `wrangler dev`.) Note: `workers/schema.sql` uses `CREATE TABLE IF NOT
   EXISTS`, so it's safe to re-run on an existing database, but it won't
   retroactively add columns to an already-created table -- D1's SQLite
   version doesn't support `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, so
   any future column additions need a one-off `ALTER TABLE comments ADD
   COLUMN ...` run by hand against the live database (the `author_url`
   column was added this way).

3. **Turnstile widget** — **done**; the site key is already the default in
   `nuxt.config.ts`'s `runtimeConfig.public.turnstileSiteKey`
   (`0x4AAAAAAEB96elhI9z99BdG`), so no build-time env var is required
   unless the widget is ever recreated (in which case override with
   `NUXT_PUBLIC_TURNSTILE_SITE_KEY`).

4. **Set the Worker secrets** (never committed, never in `wrangler.jsonc`)
   — **still needed**:
   ```sh
   npx wrangler secret put TURNSTILE_SECRET
   npx wrangler secret put COMMENTS_ADMIN_TOKEN   # any long random string you generate yourself
   ```

5. **Deploy**: `bun run cf:deploy` (runs `nuxt generate` then
   `wrangler deploy`, which uploads both the static assets and the Worker
   script in one step).

### Moderating comments

**Easiest: the Cloudflare dashboard.** Workers & Pages → D1 →
`joshhaines-comments` → **Tables** tab to browse/edit rows directly, or
the **Console** tab to run raw SQL, e.g.:

```sql
UPDATE comments SET status = 'approved' WHERE id = 1;
```

**Alternative: scriptable via `curl`**, using the `COMMENTS_ADMIN_TOKEN`
secret from step 6 above:

```sh
# List everything awaiting review
curl -s https://<your-domain>/api/comments/pending \
  -H "Authorization: Bearer <COMMENTS_ADMIN_TOKEN>" | jq

# Approve (or reject) one by id
curl -s https://<your-domain>/api/comments/moderate \
  -H "Authorization: Bearer <COMMENTS_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "action": "approve"}'
```

### Local development

`nuxt dev` alone can't serve `/api/comments` (it has no Worker/D1 runtime).
To test the full flow locally, run the site against the built output with
`wrangler dev` instead: `bun run cf:dev` (runs `nuxt generate` then
`wrangler dev`, which serves the static assets and the Worker together,
using D1's local SQLite-backed dev database unless you pass `--remote`).
