// Legacy article URLs (`/blog/:slug`) now live under `/content/:slug`.
// Nitro's routeRules redirect only substitutes wildcard (`/**`) patterns, not
// named params, so a single-segment redirect is implemented here instead.
// Book review URLs (`/blog/book-shelf/:slug`) are two segments and are
// handled separately in `book-shelf-redirects.ts`.
export default defineEventHandler((event) => {
  const match = event.path.match(/^\/blog\/([^/]+)\/?$/)

  // `/blog/book-shelf` (no further segment) is the old Book Shelf index page
  // itself, not a single post -- handled by `book-shelf-redirects.ts`.
  if (match && match[1] !== "book-shelf") {
    return sendRedirect(event, `/content/${match[1]}`, 301)
  }
})
