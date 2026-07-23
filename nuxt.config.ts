// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
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
  googleFonts: {
    families: {
      'IBM Plex Sans': [400, 500, 600, 700],
      'IBM Plex Serif': [400, 600, 700],
      'IBM Plex Mono': [400, 500],
    },
    display: 'swap',
    download: true,
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
})
