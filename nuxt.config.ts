// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const remarkGithubAlertPath = fileURLToPath(new URL('./mdc-remark-github-alert.ts', import.meta.url))

// The site is currently deployed to the norahaines.com staging domain ahead
// of cutting over to joshhaines.com. Override at build time with
// `NUXT_PUBLIC_SITE_URL` (e.g. in the Amplify build environment) once the
// production domain is ready -- this value is baked into the static build,
// so it must be set at `nuxt generate` time, not just at runtime.
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://www.norahaines.com'

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      siteUrl,
    },
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/google-fonts',
    '@nuxt/eslint',
  ],
  image: {
    // This site is deployed as a static export (`nuxt generate`) with no
    // Nitro server at runtime, so the default IPX provider's `/_ipx/*`
    // proxy route only serves the exact size variants Nitro happened to
    // prerender. Real devices request other viewport/DPR combinations
    // (e.g. `/_ipx/s_480x720/...`) that were never generated, which 404s
    // on static hosting. `none` renders plain `<img>` tags pointing
    // directly at the original file in `public/`, which always resolves.
    provider: 'none',
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            // Catppuccin themes for Shiki-highlighted code blocks -- Frappé
            // (warmer, lower-contrast) for light mode, Macchiato for dark
            // mode. `light` (not just `default`) must be set because Nuxt
            // UI's own @nuxtjs/mdc defaults inject a `light` key that takes
            // over once the page hydrates and `<html>` gets the `light`
            // color-mode class -- `default` alone is only the pre-hydration/
            // SSR fallback. See https://content.nuxt.com/docs/getting-started/configuration#highlight.
            default: 'one-light',
            light: 'one-light',
            dark: 'catppuccin-macchiato',
          },
        },
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
        { property: 'og:site_name', content: 'Josh Haines' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:logo', content: `${siteUrl}/favicons/android-chrome-512x512.png` },
        { property: 'og:image', content: `${siteUrl}/static/images/josh-haines-social.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '600' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:creator', content: '@joshhaines' },
        { name: 'twitter:image', content: `${siteUrl}/static/images/josh-haines-social.png` },
      ],
    },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  nitro: {
    prerender: {
      // A few migrated posts link to legacy `/blog/book-shelf/*` reviews
      // that haven't been brought over yet. Don't fail the whole static
      // build over known-future content links.
      failOnError: false,
    },
  },
})
