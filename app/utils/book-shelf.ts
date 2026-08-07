import type { BookShelfCollectionItem, PostsCollectionItem } from "@nuxt/content"

/** A book review enriched with its position in Josh's ranked order. */
export interface RankedBook {
  post: PostsCollectionItem
  /** 1-based rank in `book-shelf.yml`'s `order` list, or `undefined` for honorable mentions. */
  rank?: number
}

export type BookShelfSort = "rank" | "title" | "author" | "date"
export type BookShelfSortDirection = "asc" | "desc"

export const BOOK_SHELF_SORT_OPTIONS: { label: string; value: BookShelfSort }[] = [
  { label: "Josh's Order", value: "rank" },
  { label: "Title", value: "title" },
  { label: "Author", value: "author" },
  { label: "Review Date", value: "date" },
]

export type BookShelfView = "list" | "grid"

/**
 * Combines the ranked order + honorable mentions from `book-shelf.yml` with
 * the actual `bookReview` posts, producing two ranked lists. Slugs in
 * `book-shelf.yml` with no matching post are silently skipped -- expected
 * while the 80+ historical reviews are still being migrated one at a time.
 * Published reviews missing from `order` are still logged as a dev-time
 * warning, since forgetting to add a newly migrated review to the shelf
 * would otherwise fail silently.
 */
export function buildBookShelf(
  shelf: BookShelfCollectionItem | null | undefined,
  posts: PostsCollectionItem[]
) {
  const bookReviews = posts.filter((post) => post.contentType === "bookReview")
  const postBySlug = new Map(
    bookReviews.map((post) => [post.path.split("/").pop(), post])
  )

  const order = shelf?.order ?? []
  const honorableMentions = shelf?.honorableMentions ?? []

  const ranked: RankedBook[] = []
  const seenSlugs = new Set<string>()

  order.forEach((slug, index) => {
    const post = postBySlug.get(slug)
    if (!post) return
    seenSlugs.add(slug)
    ranked.push({ post, rank: index + 1 })
  })

  const mentions: RankedBook[] = honorableMentions.flatMap((slug) => {
    const post = postBySlug.get(slug)
    if (!post) return []
    seenSlugs.add(slug)
    return [{ post }]
  })

  if (import.meta.dev) {
    for (const post of bookReviews) {
      const slug = post.path.split("/").pop()
      if (slug && !seenSlugs.has(slug)) {
        console.warn(
          `[book-shelf] Published bookReview "${slug}" is missing from book-shelf.yml.`
        )
      }
    }
  }

  return { ranked, mentions }
}

/** Returns a new, sorted copy of `books`. Rank order requires every entry to have a `rank`. */
export function sortBooks(
  books: RankedBook[],
  sort: BookShelfSort,
  direction: BookShelfSortDirection = "asc"
): RankedBook[] {
  const sorted = [...books]

  switch (sort) {
    case "title":
      sorted.sort((a, b) => a.post.title.localeCompare(b.post.title))
      break
    case "author":
      sorted.sort((a, b) =>
        (formatBookAuthors(a.post.bookAuthor) ?? "").localeCompare(
          formatBookAuthors(b.post.bookAuthor) ?? ""
        )
      )
      break
    case "date":
      sorted.sort(
        (a, b) =>
          new Date(a.post.publishedAt).getTime() -
          new Date(b.post.publishedAt).getTime()
      )
      break
    case "rank":
    default:
      sorted.sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
      break
  }

  return direction === "desc" ? sorted.reverse() : sorted
}

/** "Oct 2022" style formatting used both for display and for making dates searchable. */
export function formatBookDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  })
}

/** Basic case-insensitive substring match across title, book author(s), tags, description, and review date. */
export function searchBooks(books: RankedBook[], query: string): RankedBook[] {
  const q = query.trim().toLowerCase()
  if (!q) return books

  return books.filter(({ post }) => {
    return (
      post.title.toLowerCase().includes(q) ||
      getBookAuthors(post.bookAuthor).some((author) =>
        author.toLowerCase().includes(q)
      ) ||
      (post.tags ?? []).some((tag) => tag.toLowerCase().includes(q)) ||
      post.description?.toLowerCase().includes(q) ||
      formatBookDate(post.publishedAt).toLowerCase().includes(q)
    )
  })
}
