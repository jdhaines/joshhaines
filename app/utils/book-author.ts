/**
 * Shared helpers for the `bookAuthor` frontmatter field, which can be a
 * single string (most books) or an array of strings (co-authored books,
 * e.g. `['Jim Collins', 'William Lazier']`) -- storing co-authors as an
 * array rather than one comma-delimited string keeps each name unambiguous
 * and lets every author be individually searched and linked.
 */
export type BookAuthorField = string | string[] | undefined

/** Normalizes `bookAuthor` to a plain array, regardless of the source shape. */
export function getBookAuthors(bookAuthor: BookAuthorField): string[] {
  if (!bookAuthor) return []
  return Array.isArray(bookAuthor) ? bookAuthor : [bookAuthor]
}

/** "Jim Collins, William Lazier" style plain-text display for one or more authors. */
export function formatBookAuthors(bookAuthor: BookAuthorField): string | undefined {
  const authors = getBookAuthors(bookAuthor)
  return authors.length ? authors.join(", ") : undefined
}
