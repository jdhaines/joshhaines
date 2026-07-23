// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const remarkGithubAlertPath = fileURLToPath(new URL('./mdc-remark-github-alert.ts', import.meta.url))

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/google-fonts',
    '@nuxt/eslint',
  ],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  content: {
    build: {
      markdown: {
        // Renders GitHub-style `> [!NOTE]` blockquote alerts, matching the
        // legacy site's authoring style. Colors come from
        // app/assets/css/main.css (.markdown-alert rules). Keyed by the
        // wrapper's path (not the package name) because Nuxt's codegen does
        // a default import from the key, and this package only has a named
        // export — see mdc-remark-github-alert.ts.
        remarkPlugins: {
          [remarkGithubAlertPath]: {},
        },
      },
    },
  },
  googleFonts: {
    families: {
      'IBM Plex Sans': [400, 500, 600, 700],
      'IBM Plex Serif': [400, 600, 700],
      'IBM Plex Mono': [400, 500],
    },
    display: 'swap',
    download: true,
  },
  app: {
    head: {
      link: [
        { rel: 'apple-touch-icon', sizes: '76x76', href: '/favicons/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicons/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicons/favicon-16x16.png' },
        { rel: 'icon', href: '/favicons/favicon.ico' },
        { rel: 'manifest', href: '/favicons/site.webmanifest' },
        { rel: 'mask-icon', href: '/favicons/safari-pinned-tab.svg', color: '#25b3e9' },
      ],
      meta: [
        { name: 'msapplication-TileColor', content: '#ffffff' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#faf7f2' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#060b14' },
      ],
    },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
})
