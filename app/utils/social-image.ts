/**
 * Reads the real pixel dimensions of a locally-hosted image from `public/`
 * so `og:image:width`/`og:image:height` always match the image actually
 * referenced by `og:image`/`twitter:image` on a given page.
 *
 * Crawlers (LinkedIn's Post Inspector in particular) validate the declared
 * `og:image` dimensions against the fetched file -- a mismatch causes them
 * to distrust the declared image and silently fall back to something else
 * (e.g. the sharer's own profile photo). The book-review social images are
 * a different size than the site-wide default banner, so a single
 * hardcoded width/height (set globally in `nuxt.config.ts`) is wrong for
 * every page that overrides `og:image` with its own `socialImage`.
 *
 * Server-only: relies on Node's `fs` and only needs to run once per page
 * during SSR/prerendering, not in the client bundle.
 */
export async function getImageDimensions(publicPath: string) {
  if (!import.meta.server) return undefined

  try {
    const { readFile } = await import('node:fs/promises')
    const { resolve } = await import('node:path')
    const { imageSize } = await import('image-size')

    const filePath = resolve(process.cwd(), 'public', publicPath.replace(/^\/+/, ''))
    const buffer = await readFile(filePath)
    const { width, height } = imageSize(buffer)

    return { width, height }
  }
  catch {
    // If the file can't be read/decoded, omit width/height rather than
    // emitting a wrong-but-present value -- crawlers treat a missing
    // dimension as "detect from the fetched image" rather than a mismatch.
    return undefined
  }
}
