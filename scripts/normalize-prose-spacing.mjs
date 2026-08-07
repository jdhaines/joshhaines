#!/usr/bin/env node
/**
 * CLI wrapper around `scripts/lib/prose-spacing.mjs` -- collapses runs of
 * 2+ literal spaces between prose tokens down to a single space (Josh's
 * writing habit is occasionally double-spacing after sentence
 * punctuation), without touching code, frontmatter, URLs, or Markdown
 * syntax. See that file for the full AST-driven approach and rationale.
 *
 * Usage:
 *   node scripts/normalize-prose-spacing.mjs [--check] [files...]
 *
 *   --check   Report violations and exit non-zero without writing files
 *             (used by `bun run lint`/CI). Without this flag, offending
 *             files are rewritten in place (used by `bun run lint:fix` and
 *             the pre-commit hook via lint-staged).
 *
 *   files...  Explicit file list (lint-staged passes just the staged
 *             files). Defaults to every `content/**\/*.md` and `**\/*.mdx`
 *             file in the repo when no files are given.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { relative } from "node:path"
import { fileURLToPath } from "node:url"
import fastGlob from "fast-glob"
import {
  applyFixes,
  findSpacingFixes,
  lineColAt,
  splitFrontmatter,
} from "./lib/prose-spacing.mjs"

const repoRoot = fileURLToPath(new URL("..", import.meta.url))

async function resolveFiles(args) {
  if (args.length > 0) return args
  return fastGlob(["content/**/*.md", "content/**/*.mdx", "**/*.mdx"], {
    cwd: repoRoot,
    absolute: true,
    ignore: ["**/node_modules/**", "**/.nuxt/**", "**/.output/**"],
  })
}

async function main() {
  const argv = process.argv.slice(2)
  const checkOnly = argv.includes("--check")
  const files = (await resolveFiles(argv.filter((arg) => arg !== "--check"))).filter(
    (file) => /\.mdx?$/.test(file)
  )

  let violationCount = 0
  let changedCount = 0

  for (const file of files) {
    const source = readFileSync(file, "utf8")
    const { frontmatter, body } = splitFrontmatter(source)
    const fixes = findSpacingFixes(body)

    if (fixes.length === 0) continue

    const displayPath = relative(repoRoot, file)

    if (checkOnly) {
      // +N so reported line numbers match the real file, not just the
      // post-frontmatter body.
      const frontmatterLines = frontmatter ? frontmatter.split("\n").length - 1 : 0
      for (const fix of fixes) {
        const { line, column } = lineColAt(body, fix.start)
        console.error(
          `${displayPath}:${line + frontmatterLines}:${column} double-space in prose ("  " -> " ")`
        )
      }
      violationCount += fixes.length
      continue
    }

    writeFileSync(file, frontmatter + applyFixes(body, fixes))
    console.log(
      `fixed ${displayPath} (${fixes.length} spacing fix${fixes.length === 1 ? "" : "es"})`
    )
    changedCount += 1
  }

  if (checkOnly && violationCount > 0) {
    console.error(
      `\n${violationCount} prose double-space issue${violationCount === 1 ? "" : "s"} found. Run \`bun run lint:fix\` to fix.`
    )
    process.exit(1)
  }

  if (!checkOnly && changedCount === 0) {
    console.log("No prose spacing issues found.")
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
