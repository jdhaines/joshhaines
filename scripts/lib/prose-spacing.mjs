/**
 * Core, side-effect-free logic for collapsing runs of 2+ literal spaces in
 * Markdown/MDX prose down to a single space. See
 * `scripts/normalize-prose-spacing.mjs` for the CLI wrapper (file
 * reading/writing, --check mode) and the full rationale for the
 * AST-driven, surgical-byte-range approach used here.
 */
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import { visit } from "unist-util-visit"

export const SPACE_RUN = / {2,}/g
export const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n/

const processor = unified().use(remarkParse).use(remarkGfm)

/** Splits a leading YAML frontmatter block (if any) off from the rest of the file. */
export function splitFrontmatter(source) {
  const match = source.match(FRONTMATTER_RE)
  if (!match) return { frontmatter: "", body: source }
  return { frontmatter: match[0], body: source.slice(match[0].length) }
}

/** 1-based `{ line, column }` for a character offset into `text`. */
export function lineColAt(text, offset) {
  let line = 1
  let lastNewline = -1
  for (let i = 0; i < offset; i += 1) {
    if (text[i] === "\n") {
      line += 1
      lastNewline = i
    }
  }
  return { line, column: offset - lastNewline }
}

/**
 * Finds every double-(or-more)-space run inside actual prose `text` mdast
 * nodes in `body` (a Markdown/MDX string with frontmatter already
 * stripped), returning `{ start, end }` byte offsets (relative to `body`)
 * to collapse to a single space each.
 *
 * Only `text` nodes are visited -- `code`, `inlineCode`, and raw `html`
 * nodes are separate mdast node types and are never touched, so fenced
 * code blocks, inline code spans, and embedded HTML are left exactly as
 * written. A Markdown hard line break (2+ trailing spaces before a
 * newline) is parsed by remark as its own `break` node that consumes those
 * trailing spaces -- they never end up inside a neighboring `text` node's
 * value/offsets, so hard breaks are naturally preserved without any
 * special-casing here. Because `text` nodes recurse into headings, list
 * items, table cells, and link/emphasis/strong labels, prose inside all of
 * those is covered too, while a link's URL (stored on the node, not as a
 * text child) is never visited.
 */
export function findSpacingFixes(body) {
  const tree = processor.parse(body)
  const fixes = []

  visit(tree, "text", (node) => {
    if (!node.position) return

    const start = node.position.start.offset
    const end = node.position.end.offset
    const raw = body.slice(start, end)

    for (const match of raw.matchAll(SPACE_RUN)) {
      const absoluteStart = start + match.index
      const absoluteEnd = absoluteStart + match[0].length

      // A `text` node's raw source slice can still include list/blockquote
      // continuation indentation that remark strips from `node.value`
      // itself (e.g. a numbered list item's wrapped second line, indented
      // to align under its marker) -- that indentation is structural, not
      // inter-word prose spacing, and must be left alone. Any space run
      // immediately preceded by a newline (or at the very start of the
      // file) is line-leading whitespace, never mid-sentence spacing, so
      // skip it.
      const precedingChar = absoluteStart === 0 ? undefined : body[absoluteStart - 1]
      if (precedingChar === undefined || precedingChar === "\n") continue

      fixes.push({ start: absoluteStart, end: absoluteEnd })
    }
  })

  return fixes
}

/** Applies `{ start, end }` fixes (as returned by `findSpacingFixes`) to `body`. */
export function applyFixes(body, fixes) {
  let result = body
  for (const fix of [...fixes].sort((a, b) => b.start - a.start)) {
    result = result.slice(0, fix.start) + " " + result.slice(fix.end)
  }
  return result
}

/** Full fix pass over a whole file's source (frontmatter + body), returning the new source. */
export function normalizeProseSpacing(source) {
  const { frontmatter, body } = splitFrontmatter(source)
  const fixes = findSpacingFixes(body)
  return {
    frontmatter,
    body: applyFixes(body, fixes),
    fixes,
    source: frontmatter + applyFixes(body, fixes),
  }
}
