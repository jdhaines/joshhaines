# JoshHaines.com (Nuxt rebuild)

A rebuild of [JoshHaines.com](https://joshhaines.com) - an editorial
publication and personal content library - on Nuxt 4, Nuxt Content, Nuxt UI,
Tailwind CSS 4, and Bun.

See `AGENTS.md` and `.github/copilot-instructions.md` for project
conventions and working guidelines before making changes.

## Setup

```sh
bun install
```

## Development

```sh
bun run dev
```

Starts the dev server at `http://localhost:3000`.

## Validation

```sh
bun run lint
bun run typecheck
bun run test
bun run build
```

## Production

```sh
bun run build
bun run preview
```

Check the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
