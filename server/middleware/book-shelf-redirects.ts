// Legacy book review URLs (`/blog/book-shelf/:slug`) now live under
// `/content/:slug`, same as every other post type. The bare `/blog/book-shelf`
// index redirects to the new Book Shelf page at `/books`.
export default defineEventHandler((event) => {
  if (event.path === '/blog/book-shelf' || event.path === '/blog/book-shelf/') {
    return sendRedirect(event, '/books', 301)
  }

  const match = event.path.match(/^\/blog\/book-shelf\/([^/]+)\/?$/)

  if (match) {
    return sendRedirect(event, `/content/${match[1]}`, 301)
  }
})
