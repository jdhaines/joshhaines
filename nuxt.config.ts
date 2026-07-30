// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { readdirSync, readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import { legacyRedirects } from './server/utils/legacy-redirects'

const remarkGithubAlertPath = fileURLToPath(new URL('./mdc-remark-github-alert.mjs', import.meta.url))

// The site is currently deployed to the norahaines.com staging domain ahead
// of cutting over to joshhaines.com. Override at build time with
// `NUXT_PUBLIC_SITE_URL` (e.g. in the Cloudflare build environment) once the
// production domain is ready -- this value is baked into the static build,
// so it must be set at `nuxt generate` time, not just at runtime.
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://www.norahaines.com'

// Nitro's static-site crawler only prerenders a page if it discovers a link
// to it somewhere in the already-generated HTML. The legacy `/blog/*`,
// `/blog/book-shelf/*`, and `/writing/*` redirect pages (see
// `server/middleware/*-redirects.ts`) are never linked from anywhere in the
// new site, so most of them were silently never generated -- only the
// handful that happened to be cross-referenced from another migrated post's
// body text got a redirect page at all. Explicitly listing every legacy URL
// here forces Nitro to visit (and thus generate a real redirect page for)
// every one, regardless of internal linking. Both `/blog/<slug>` and
// `/writing/<slug>` are generated for non-book-review posts since the
// legacy site used both schemes at different points and it's cheap/harmless
// to redirect from both.
function legacyContentRoutes() {
  const contentDir = fileURLToPath(new URL('./content/content', import.meta.url))
  const routes: string[] = []

  for (const file of readdirSync(contentDir)) {
    if (!file.endsWith('.md')) continue
    const slug = file.slice(0, -'.md'.length)
    const isBookReview = /contentType:\s*bookReview/.test(readFileSync(`${contentDir}/${file}`, 'utf-8'))

    if (isBookReview) {
      routes.push(`/blog/book-shelf/${slug}`)
    }
    else {
      routes.push(`/blog/${slug}`, `/writing/${slug}`)
    }
  }

  return routes
}

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      siteUrl,
      // Cloudflare Turnstile site key -- public by design (it's meant to be
      // embedded in the page); the matching secret lives only in the
      // Worker, via `wrangler secret put TURNSTILE_SECRET`. Override with
      // `NUXT_PUBLIC_TURNSTILE_SITE_KEY` at build time if the widget is
      // ever recreated. See DEVELOPER.md's "Comments" section for the
      // full setup.
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY ?? '0x4AAAAAAEB-DwiZPqoOmPiE',
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
    // Pin the Nitro preset explicitly. Without this, Nitro auto-detects the
    // `cloudflare_module` preset from the `WORKERS_CI` env var that
    // Cloudflare's build environment sets automatically -- even though we
    // run `nuxt generate` for a plain static export. That auto-detected
    // preset makes @nuxt/content think it should switch to a Cloudflare D1
    // database mid-build, which breaks content parsing entirely (every
    // markdown file gets "ignored" with an "Unknown file extension .ts"
    // error) since no D1 binding exists during the static build. Forcing
    // `static` keeps content on its normal bundled-SQLite-dump storage
    // (see https://content.nuxt.com/docs/advanced/database) regardless of
    // which CI/hosting environment the build happens to run in.
    preset: 'static',
    prerender: {
      // A few migrated posts link to legacy `/blog/book-shelf/*` reviews
      // that haven't been brought over yet. Don't fail the whole static
      // build over known-future content links.
      failOnError: false,
      routes: [...legacyContentRoutes(), ...Object.keys(legacyRedirects)],
    },
  },
})
