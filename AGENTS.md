# Agent guide

Read `.github/copilot-instructions.md` before making changes.

## Project

JoshHaines.com is being rebuilt as a Nuxt 4, Nuxt Content, Nuxt Studio, Nuxt UI,
Tailwind CSS 4, and Bun application.

The site is an editorial publication and personal content library. Optimize for
excellent reading, content discovery, durable URLs, accessibility, and simple
maintenance.

## Start here

Before editing:

1. Read `package.json`.
2. Read `nuxt.config.ts`.
3. Read `content.config.ts` if it exists.
4. Inspect `app/app.config.ts` and the main CSS entry.
5. Inspect existing content schemas and representative Markdown files.
6. Check current scripts before choosing validation commands.
7. Read `DEVELOPER.md` for the content-type/frontmatter/homepage-section
   reference before touching `content.config.ts`, `content/**`, or any
   `app/components/Home*.vue` homepage section component.

## Keeping `DEVELOPER.md` current

`DEVELOPER.md` is the frontmatter and homepage-section reference for this
repo. Update it in the same change whenever you:

- add, remove, or change a field in any collection schema in
  `content.config.ts`
- add a new `contentType` value or change its badge color/label
- add, remove, or change a homepage section component
  (`app/components/Home*.vue`) or its selection query in `app/pages/index.vue`

## Commands

Use commands defined by `package.json`.

Typical commands:

```sh
bun install
bun run dev
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

Use Bun. Do not create another package-manager lockfile.

## Architecture rules

- Use Nuxt 4 and Vue 3 conventions.
- Use TypeScript and `<script setup lang="ts">`.
- Prefer Nuxt UI components.
- Keep branding in shared theme configuration and tokens.
- Keep content in typed Nuxt Content collections.
- Preserve public URLs, canonical metadata, and social-sharing behavior.
- Support SSR, light mode, dark mode, and accessible keyboard interaction.
- Do not add React or Next.js code.

## Playwright smoke tests (`e2e/`)

This is a smoke suite, not full e2e coverage -- keep additions lightweight:
one check per key page, a couple of spot checks on known articles, and a
brief check that a major feature's happy path works (renders, doesn't 404,
doesn't silently break). Don't chase exhaustive coverage of every state,
edge case, or interaction.

Add or extend a smoke test in the same change whenever you:

- add a new top-level page/route
- ship a new major feature (search, migrations, book-shelf views, etc.) or
  materially change how an existing one behaves
- fix a bug that could plausibly regress silently (e.g. broken images on
  static hosting, a canonical/OG URL pointing at the wrong host) -- add a
  guard test alongside the fix, the same way the existing `_ipx` and
  `localhost` canonical-URL checks in `e2e/smoke.spec.ts` do

Run `bun run test:e2e` locally before considering such a change complete
(it builds the static site via `nuxt generate` and runs Playwright against
that real output, matching what actually gets deployed).

## Completion

A change is complete only after applicable lint, typecheck, test, e2e, and
build commands have been run—or after clearly reporting why one could not
be run.

Summarize:

- what changed
- important design decisions
- validation performed
- unresolved issues or migration risks

