// Plain data only (no `defineEventHandler`/Nitro APIs) so this module can be
// safely imported both from `server/middleware/legacy-redirects.ts` (at
// request time) and from `nuxt.config.ts` (at build/dev config-load time,
// outside the Nitro runtime where Nitro's auto-imports aren't available).
//
// One-off literal redirects that don't fit a general pattern (see the other
// `*-redirects.ts` middleware files for the pattern-based `/blog/*` and
// `/writing/*` legacy URL schemes). Add an entry here any time an old short
// link, a renamed post's old slug, or any other single fixed path needs to
// keep working -- just `'<old path>': '<new path>'`, no regex or param
// matching needed. `nuxt.config.ts` automatically adds every key here to
// `nitro.prerender.routes`, so a new entry is enough on its own: no other
// file needs to change. That step matters because Nitro's static-site
// crawler only generates a page for routes it discovers by following links
// in already-generated HTML -- since nothing on the site links to these old
// paths anymore, they'd otherwise silently produce no redirect page in the
// static build even though they work fine in dev.
export const legacyRedirects: Record<string, string> = {
  "/subs": "/content/submarines-keynote",
  "/techpoint": "/content/chemistry-of-innovation",
}
