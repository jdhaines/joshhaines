// Legacy article URLs (`/blog/:slug`) now live under `/writing/:slug`.
// Nitro's routeRules redirect only substitutes wildcard (`/**`) patterns, not
// named params, so a single-segment redirect is implemented here instead.
// Book review URLs (`/blog/book-shelf/:slug`) are two segments and are
// intentionally left untouched until that collection is migrated.
export default defineEventHandler((event) => {
  const match = event.path.match(/^\/blog\/([^/]+)\/?$/)

  if (match) {
    return sendRedirect(event, `/writing/${match[1]}`, 301)
  }
})
