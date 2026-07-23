// Post detail pages used to live at `/writing/:slug` before all content
// types (articles, talks, podcasts) were unified under a single `/content/`
// permalink namespace. `/writing` itself is still a real page (the "Writing"
// category listing), so only single-segment paths under it redirect.
export default defineEventHandler((event) => {
  const match = event.path.match(/^\/writing\/([^/]+)\/?$/)

  if (match) {
    return sendRedirect(event, `/content/${match[1]}`, 301)
  }
})
