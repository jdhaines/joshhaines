# JoshHaines.com repository instructions

## Project purpose

This repository contains a rebuild for the existing JoshHaines.com, a personal publishing and professional website focused on:

- leadership
- software engineering and platform engineering
- innovation and organizational systems
- book reviews and reading lists
- speaking and presentations
- podcasts, projects, and career material

The existing site is located at github.com/jdhaines/joshhaines and also locally at
`~/git/joshhaines`.  The site should feel like an editorial publication and personal knowledge
library, not a SaaS dashboard or corporate application.

## Current rebuild direction

The target architecture is:

- Nuxt 4
- Vue 3
- TypeScript
- Nuxt Content
- Nuxt Studio
- Nuxt UI
- Tailwind CSS 4
- Bun as the package manager
- Markdown-first, Git-owned content
- light and dark color modes

Do not introduce React, Next.js, MDX, or React-specific packages into the new
architecture unless explicitly requested.

## Package management

Use Bun for project dependency and script commands.

Preferred commands:

```sh
bun install
bun add <package>
bun add --dev <package>
bun remove <package>
bun run dev
bun run build
bun run lint
bun run typecheck
bun run test
```

Do not generate npm, pnpm, or Yarn lockfiles.

Before adding a dependency:

- Check whether Nuxt, Nuxt UI, Nuxt Content, VueUse, or an existing dependency
  already provides the capability.
- Prefer official Nuxt modules and actively maintained Vue packages.
- Explain why a new runtime dependency is needed.
- Do not add a package merely to avoid writing a small amount of ordinary code.

## Nuxt conventions

- Use Nuxt 4 conventions and the app/ directory structure.
- Prefer auto-imported Nuxt and Vue APIs where that is idiomatic.
- Use `<script setup lang="ts">` for Vue components.
- Prefer server-rendered components and pages.
- Add client-only behavior only where it is genuinely required.
- Use composables for reusable behavior.
- Keep page components focused on page composition.
- Keep reusable presentation components in app/components.
- Use Nuxt runtime configuration for environment-dependent settings.
- Never expose secrets through runtimeConfig.public.
- Prefer Nuxt modules over custom framework integrations where appropriate.
- Preserve SSR and static-generation compatibility.

## Nuxt UI and styling

- Use Nuxt UI components before creating equivalent low-level components.
- Do not make every section a card.
- Avoid an application-dashboard aesthetic.
- Favor clear editorial hierarchy, generous space, readable prose, and restrained
  interface chrome.
- Centralize brand decisions in Nuxt UI configuration, CSS variables, and theme
  tokens.
- Do not scatter raw color values throughout components.
- Support both light and dark modes.
- Maintain accessible contrast, visible focus states, keyboard navigation, and
  reduced-motion preferences.
- Avoid excessive animation, gradients, glass effects, or ornamental shadows.

## Brand direction

The existing JoshHaines.com blue and orange should initially remain the primary
brand colors while the broader identity is evaluated.

## Typography direction

- IBM Plex Sans for interface text and most body copy
- IBM Plex Serif for selected editorial headings, quotations, or features
- IBM Plex Mono for code and technical labels

The visual identity may include:

- blue as the primary digital accent
- orange as a selective secondary accent
- warm off-white light surfaces
- deep blue-black dark surfaces
- mountain or shield imagery
- technical, chalkboard, or hand-drawn illustrations

Do not replace the brand palette or typography without an explicit request.

## Content architecture

Treat content as structured collections rather than one generic blog.

Expected collections include:

- writing
- books
- talks
- podcast
- projects
- pages

Use Nuxt Content collection schemas to validate frontmatter.

Shared editorial metadata will likely include:

- title
- description
- published date
- updated date
- image
- alt text
- topics
- tags
- featured status
- draft status
- canonical URL
- SEO title or description where needed

Do not invent required metadata fields without checking existing content and
migration requirements.

## Editorial content

- Preserve Josh's conversational, direct writing voice.
- Do not rewrite prose merely to make it sound generic or corporate.
- Make grammatical corrections without flattening personality.
- Preserve Markdown readability.
- Prefer ordinary Markdown over embedded components unless a component creates
  meaningful value.
- Do not silently alter quotations, references, ratings, publication dates, or
  substantive claims.
- Use descriptive image alt text.
- Keep headings hierarchical and avoid skipping heading levels.

## URLs and migration safety

The current site already has public content and inbound links.

When migrating:

- preserve existing paths whenever practical
- never casually rename a published route
- add permanent redirects for changed URLs
- preserve canonical URLs
- preserve or improve Open Graph metadata
- preserve social-sharing images
- preserve RSS and sitemap behavior
- verify internal links after changes
- avoid duplicate public URLs for the same content

Any change that may break an existing public URL must be called out explicitly.

## SEO and metadata

Each public page should have appropriate:

- page title
- meta description
- canonical URL
- Open Graph metadata
- social image
- structured data where meaningful

Avoid keyword stuffing and generated SEO filler.

Do not make unsupported claims about search rankings.

## Images

- Use Nuxt Image where appropriate.
- Keep source images at sensible quality.
- Avoid unnecessary copies of the same asset.
- Record meaningful alt text in content metadata or component props.
- Prevent layout shift by supplying dimensions or aspect ratios.
- Social images should remain readable when rendered at small sizes.

## TypeScript and code quality

- Use strict, understandable TypeScript.
- Avoid any unless there is a documented reason.
- Do not create abstractions before repeated use justifies them.
- Prefer descriptive names over comments that restate the code.
- Remove unused code and imports.
- Keep functions and components reasonably focused.
- Handle expected failure states.
- Do not swallow errors silently.

## Validation

Before describing a task as complete, run the applicable commands available in
package.json, normally in this order:

```sh
bun run lint
bun run typecheck
bun run test
bun run build
```

If a command does not exist, say so rather than inventing it.

If a command fails:

- Report the relevant failure.
- Determine whether it was caused by the change.
- Fix failures caused by the change.
- Do not hide failures by weakening checks or deleting tests.

## Working style

Before making broad changes:

- Inspect the relevant files.
- State the intended approach briefly.
- Identify migration, compatibility, or URL risks.
- Make the smallest coherent change.
- Validate the result.

For large features, first provide a short implementation plan and identify the
files likely to change.

Do not:

- rewrite unrelated code
- change formatting across the whole repository without permission
- add a second implementation beside an existing one
- leave temporary files or commented-out experiments
- commit secrets or credentials
- claim a command passed unless it was actually run

When instructions conflict, prioritize:

- the user's current request
- the nearest AGENTS.md
- these repository instructions
- existing repository conventions
- general framework conventions

GitHub automatically makes `.github/copilot-instructions.md` available to supported Copilot interactions in the repository. It also supports path-specific instructions and `AGENTS.md` files; when an agent is operating within a directory tree, the nearest applicable `AGENTS.md` takes precedence.

