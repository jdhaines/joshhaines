/**
 * Absolute origin used to build canonical URLs, Open Graph URLs, and
 * social-image URLs (e.g. `https://www.norahaines.com`).
 *
 * Deliberately backed by `runtimeConfig.public.siteUrl` instead of
 * `useRequestURL()`. This site is statically generated (`nuxt generate`),
 * so any value derived from the request host is captured once at build
 * time and baked into every prerendered page -- using `useRequestURL()`
 * bakes in the build machine's `http://localhost` instead of the real
 * deployed origin. Set `NUXT_PUBLIC_SITE_URL` at build time to override
 * the default (e.g. when cutting over from the norahaines.com staging
 * domain to the production joshhaines.com domain).
 */
export function useSiteUrl(): string {
  return useRuntimeConfig().public.siteUrl
}
