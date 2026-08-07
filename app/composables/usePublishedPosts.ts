import type { PostsCollectionItem } from "@nuxt/content"

export type PublishedPostSummary = Pick<
  PostsCollectionItem,
  | "path"
  | "title"
  | "description"
  | "publishedAt"
  | "contentType"
  | "bookAuthor"
  | "tags"
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
        "bookAuthor",
        "tags"
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
 * Case/whitespace/accent-insensitive check for whether any of a book
 * review's `bookAuthor` name(s) matches every word of `query` -- surfaces a
 * book even when its review body doesn't happen to repeat the author's full
 * name verbatim (full-text search alone can miss that). Matches against
 * each co-author individually when `bookAuthor` is an array, so searching
 * one name of a multi-author book (e.g. "Lazier") still finds it.
 */
export function matchesBookAuthor(
  post: Pick<PublishedPostSummary, "contentType" | "bookAuthor">,
  query: string
) {
  if (post.contentType !== "bookReview") return false
  const authors = getBookAuthors(post.bookAuthor).map((author) =>
    foldAccents(author.toLowerCase())
  )
  if (!authors.length) return false
  const terms = foldAccents(query.trim().toLowerCase()).split(/\s+/).filter(Boolean)
  if (!terms.length) return false
  return authors.some((author) => terms.every((term) => author.includes(term)))
}

/**
 * Case/whitespace/accent-insensitive check for whether any of a post's
 * `tags` matches every word of `query` -- tags aren't part of a page's
 * body/description, so Nuxt Content's full-text search index (which only
 * covers title/description/body) never sees them on its own. Removing a
 * tag's word from the article body (but leaving the tag itself in
 * frontmatter) would otherwise silently drop it from search results.
 */
export function matchesTag(post: Pick<PublishedPostSummary, "tags">, query: string) {
  const terms = foldAccents(query.trim().toLowerCase()).split(/\s+/).filter(Boolean)
  if (!terms.length) return false
  return (post.tags ?? []).some((tag) => {
    const normalized = foldAccents(tag.toLowerCase())
    return terms.every((term) => normalized.includes(term))
  })
}
