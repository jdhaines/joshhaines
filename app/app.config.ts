export default defineAppConfig({
  ui: {
    colors: {
      // Brand mapping derived from the legacy tailwind.config.js at
      // github.com/jdhaines/joshhaines: jblue is the primary digital accent,
      // jred (orange/red) is the secondary accent. See --color-jblue-* and
      // --color-jred-* in app/assets/css/main.css for the full scales.
      primary: 'jblue',
      secondary: 'jred',
      // Used for the "Talk" content-type badge (see app/utils/content-type.ts).
      // Kept as Nuxt UI's default yellow (not amber) so it stays visually
      // distinct from the red "Book Review" badge; the actual shade is
      // darkened further in light mode via --ui-warning in
      // app/assets/css/main.css for contrast against the cream background.
      warning: 'yellow',
      neutral: 'slate',
    },
    prose: {
      // Nuxt UI's default file-icon map (see @nuxt/ui theme) doesn't cover
      // every Shiki language alias we use in code fences -- `sh` and `txt`
      // fall back to non-existent `vscode-icons` names otherwise. See
      // https://ui.nuxt.com/docs/typography/code.
      codeIcon: {
        sh: 'i-vscode-icons-file-type-shell',
        bash: 'i-vscode-icons-file-type-shell',
        txt: 'i-vscode-icons-file-type-text',
      },
      // Slightly tighter than Nuxt UI's default `my-5` -- articles here are
      // all `h2`-sectioned prose (no `h1`), so paragraphs are the dominant
      // rhythm on the page; the default felt a touch airy between them.
      p: {
        base: 'my-4',
      },
      // Articles only use `h2` (section headings) and `h3` (subsections
      // within a section) -- never `h1`. Nuxt UI's default styles both as
      // the same near-white/black `text-highlighted`, differing only in
      // size, which reads as too similar at a glance. `text-toned` is one
      // step greyer (a themed token, not a hardcoded color, so it still
      // adapts correctly in both light and dark mode) to make the h3/h2
      // hierarchy clearer without losing legibility.
      h3: {
        slots: {
          base: 'text-toned',
        },
      },
    },
  },
})
