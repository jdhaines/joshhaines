export default defineAppConfig({
  ui: {
    colors: {
      // Brand mapping derived from the legacy tailwind.config.js at
      // github.com/jdhaines/joshhaines: jblue is the primary digital accent,
      // jred (orange/red) is the secondary accent. See --color-jblue-* and
      // --color-jred-* in app/assets/css/main.css for the full scales.
      primary: 'jblue',
      secondary: 'jred',
      neutral: 'slate',
    },
  },
})
