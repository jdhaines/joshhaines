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
        txt: 'i-vscode-icons-file-type-text',
      },
    },
  },
})
