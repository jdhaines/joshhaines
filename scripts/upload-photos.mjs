#!/usr/bin/env node
/**
 * Resizes/compresses a folder of photos and uploads them to the
 * `img-joshhaines` R2 bucket (served publicly at https://img.joshhaines.com),
 * then prints ready-to-paste URLs and a matching markdown image-grid
 * snippet (see DEVELOPER.md's "Image grid rows" section).
 *
 * Usage:
 *   bun run photos:upload <local-folder> <article-slug>
 *
 * Example:
 *   bun run photos:upload ~/Pictures/lake-trip lake-trip
 *   -> uploads to img.joshhaines.com/lake-trip/<filename>.webp
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, extname, join } from 'node:path'
import sharp from 'sharp'

const BUCKET = 'img-joshhaines'
const PUBLIC_HOST = 'https://img.joshhaines.com'
const MAX_WIDTH = 2400
const WEBP_QUALITY = 82
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif'])

const [, , inputDir, slug] = process.argv

if (!inputDir || !slug) {
  console.error('Usage: bun run photos:upload <local-folder> <article-slug>')
  process.exit(1)
}

const files = readdirSync(inputDir)
  .filter((name) => SUPPORTED_EXTENSIONS.has(extname(name).toLowerCase()))
  .sort()

if (files.length === 0) {
  console.error(`No supported image files found in ${inputDir}`)
  process.exit(1)
}

const workDir = mkdtempSync(join(tmpdir(), 'photo-upload-'))
const urls = []

try {
  for (const file of files) {
    const inputPath = join(inputDir, file)
    const key = `${slug}/${basename(file, extname(file))}.webp`
    const outputPath = join(workDir, basename(key))

    console.log(`Processing ${file} -> ${key}`)
    await sharp(inputPath)
      .rotate() // apply EXIF orientation before stripping metadata
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath)

    execFileSync('npx', [
      'wrangler', 'r2', 'object', 'put', `${BUCKET}/${key}`,
      '--file', outputPath,
      '--content-type', 'image/webp',
      '--remote',
    ], { stdio: 'inherit' })

    urls.push(`${PUBLIC_HOST}/${key}`)
  }
} finally {
  rmSync(workDir, { recursive: true, force: true })
}

console.log('\nUploaded URLs:')
for (const url of urls) console.log(url)

console.log('\nMarkdown grid snippet (edit alt text before pasting):\n')
console.log(buildGridMarkdown(urls))

/**
 * Chunks the uploaded URLs into 4/3/2-wide rows (biggest rows first) and
 * emits the matching grid markup from DEVELOPER.md's "Image grid rows".
 */
function buildGridMarkdown(imageUrls) {
  const rows = []
  let remaining = [...imageUrls]
  while (remaining.length > 0) {
    const width = remaining.length >= 4 ? 4 : remaining.length
    rows.push(remaining.slice(0, width))
    remaining = remaining.slice(width)
  }

  return rows.map((row) => renderRow(row)).join('\n\n')
}

function renderRow(row) {
  const colsClass = row.length === 4
    ? 'grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4'
    : `grid-cols-${row.length} gap-3 sm:gap-4`
  const imgs = row
    .map((url) => `  <img src="${url}" alt="Describe this photo" class="aspect-square w-full rounded-lg bg-elevated object-cover shadow-md" />`)
    .join('\n')
  return `<div class="my-8 grid ${colsClass}">\n${imgs}\n</div>`
}
