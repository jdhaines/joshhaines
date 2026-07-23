---
applyTo: "app/**/*.vue"
---

# Vue component instructions

- Use Vue 3 Composition API with `<script setup lang="ts">`.
- Prefer Nuxt and Vue auto-imports.
- Prefer Nuxt UI primitives and components before building replacements.
- Keep pages focused on composition and move reusable UI into components.
- Keep component props typed.
- Declare emitted events when a component emits.
- Preserve server rendering; avoid browser globals during setup.
- Use `ClientOnly` only when server rendering genuinely cannot work.
- Use semantic HTML before adding ARIA.
- Ensure interactive elements are keyboard accessible.
- Use shared theme tokens instead of hard-coded brand colors.
- Avoid unnecessary watchers and client-side state.
