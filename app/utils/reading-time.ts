// Import the core implementation directly instead of the package root:
// `reading-time`'s root `index.js` eagerly `require`s `./lib/stream`, which
// depends on Node's `stream`/`util` built-ins (for `util.inherits`). That's
// harmless server-side, but breaks the client bundle ("util.inherits is not
// a function") since Vite's browser polyfill for `util` doesn't implement
// `inherits`. `lib/reading-time` only contains the plain word-count
// estimator we actually use, with no such built-in dependency.
import readingTime from "reading-time/lib/reading-time"
import { textContent, type MinimarkTree } from "minimark"

/**
 * Computes a human-readable "X min read" (or listen) label for a `writing`
 * page.
 *
 * If the post supplies a manual `runtime` override (mandatory in practice for
 * podcasts, since there's no body text to estimate from) that value is used
 * verbatim. Otherwise the reading time is estimated from the parsed markdown
 * body using the `reading-time` package.
 */
export function getRuntimeLabel(page: {
  runtime?: string
  contentType?: string
  body?: unknown
}): string {
  if (page.runtime) {
    return page.runtime
  }

  const body = page.body as MinimarkTree | undefined
  const text = body?.value?.map((node) => textContent(node)).join(" ") ?? ""
  const { minutes } = readingTime(text)
  const roundedMinutes = Math.max(1, Math.round(minutes))
  const unit = page.contentType === "podcast" ? "listen" : "read"

  return `${roundedMinutes} min ${unit}`
}
