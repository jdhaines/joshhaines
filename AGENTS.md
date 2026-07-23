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

## Commands

Use commands defined by `package.json`.

Typical commands:

```sh
bun install
bun run dev
bun run lint
bun run typecheck
bun run test
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

## Completion

A change is complete only after applicable lint, typecheck, test, and build
commands have been run—or after clearly reporting why one could not be run.

Summarize:

- what changed
- important design decisions
- validation performed
- unresolved issues or migration risks

