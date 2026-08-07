/**
 * Formats a date for display, always in UTC.
 *
 * Frontmatter dates like `publishedAt: 2026-08-07` are date-only strings, so
 * `new Date(...)` parses them as UTC midnight. Formatting that value with
 * `toLocaleDateString` in the server's or reader's *local* timezone can then
 * shift the displayed calendar date backward (or forward) a day depending on
 * their UTC offset -- e.g. a UTC-4 reader would see "August 6" for a post
 * authored as `2026-08-07`. Explicitly formatting in UTC keeps the displayed
 * date matching exactly what was authored, everywhere it's rendered.
 */
export function formatDate(
  date?: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
) {
  if (!date) return undefined
  return new Date(date).toLocaleDateString("en-US", { ...options, timeZone: "UTC" })
}
