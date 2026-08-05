import type { PostsCollectionItem } from "@nuxt/content"

export type PublishedPostSummary = Pick<
  PostsCollectionItem,
  "path" | "title" | "description" | "publishedAt" | "contentType" | "bookAuthor"
>

/**
 * Loads every published (non-draft) post's summary fields once and shares
 * the result (via `useAsyncData`'s built-in caching) across every consumer
 * that needs to search or filter across all content types -- currently the
 * command-palette search (SiteSearch.vue) and the `/search` results page.
 * Both need the same "book author mentioned" boost on top of full-text
 * search (see `matchesBookAuthor` below), and both need to exclude draft/
 * ghost posts that the FTS index doesn't know to skip on its own.
 */
export function usePublishedPosts() {
  return useAsyncData("published-posts-summary", () => {
    return queryCollection("posts")
      .where("draft", "=", false)
      .select(
        "path",
        "title",
        "description",
        "publishedAt",
        "contentType",
        "bookAuthor"
      )
      .all()
  })
}

/**
 * Strips diacritics (e.g. "é" -> "e") so accented and unaccented spellings
 * of the same name match each other -- e.g. searching "Brene Brown" should
 * still find a book with `bookAuthor: "Brené Brown"`.
 */
function foldAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

/**
 * Case/whitespace/accent-insensitive check for whether a book review's
 * `bookAuthor` field matches every word of `query` -- surfaces a book even
 * when its review body doesn't happen to repeat the author's full name
 * verbatim (full-text search alone can miss that).
 */
export function matchesBookAuthor(
  post: Pick<PublishedPostSummary, "contentType" | "bookAuthor">,
  query: string
) {
  const author = post.bookAuthor
    ? foldAccents(post.bookAuthor.toLowerCase())
    : undefined
  if (post.contentType !== "bookReview" || !author) return false
  const terms = foldAccents(query.trim().toLowerCase()).split(/\s+/).filter(Boolean)
  return terms.length > 0 && terms.every((term) => author.includes(term))
}
