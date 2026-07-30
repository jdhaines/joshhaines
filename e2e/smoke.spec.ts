import { expect, test } from '@playwright/test'

/**
 * Smoke tests for the statically-generated site. These intentionally stay
 * shallow -- the goal is to catch "the build is broken" / "a whole page is
 * blank or 404s" / "images don't load on static hosting" classes of
 * regressions, not to exhaustively cover every page's content or behavior.
 */

const NAV_PAGES = [
  { path: '/', label: 'Home' },
  { path: '/books', label: 'Books' },
  { path: '/podcasts', label: 'Podcasts' },
  { path: '/talks', label: 'Talks' },
  { path: '/writing', label: 'Writing' },
  { path: '/about', label: 'About' },
]

test.describe('key pages load', () => {
  for (const { path, label } of NAV_PAGES) {
    test(`${label} (${path}) returns 200 and renders`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)

      // Every page should render a non-empty document title and at least
      // one heading -- a blank/broken page typically fails one of these.
      await expect(page).toHaveTitle(/.+/)
      await expect(page.locator('h1, h2').first()).toBeVisible()
    })
  }
})

test.describe('navigation', () => {
  test('header nav links to every key page', async ({ page }) => {
    await page.goto('/')

    const nav = page.getByRole('navigation').first()
    for (const { path, label } of NAV_PAGES) {
      if (label === 'Home') continue
      await expect(nav.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', path)
    }
  })

  test('unknown routes render the 404 page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist')
    expect(response?.status()).toBe(404)
  })
})

test.describe('SEO metadata', () => {
  test('homepage has a real canonical/OG URL, not a build-time localhost artifact', async ({ page }) => {
    await page.goto('/')

    // Regression guard: canonical/og:url must reflect the deployed site
    // origin. This previously leaked the build machine's `localhost`
    // because it was derived from useRequestURL() during static
    // prerendering instead of a fixed runtime-config site URL.
    const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonicalHref).not.toContain('localhost')
    expect(canonicalHref).toMatch(/^https:\/\//)

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content')
    expect(ogUrl).not.toContain('localhost')

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(ogImage).toMatch(/^https:\/\/.+\.png$/)
  })

  test('a book review\'s declared og:image dimensions match its actual image, and it has an author', async ({ page }) => {
    // Regression guard: og:image:width/height previously always inherited
    // the site-wide default banner's dimensions (1200x600) even when a
    // page overrode og:image with its own (differently-sized) socialImage.
    // Crawlers like LinkedIn's Post Inspector distrust a declared image
    // whose dimensions don't match the fetched file and silently fall
    // back to something else -- so these must stay in sync per-page.
    // Also guards that an author is always present, since LinkedIn
    // flagged "No author found" when neither `author` nor `article:author`
    // was emitted at all.
    await page.goto('/content/high-growth-handbook')

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(ogImage).toContain('highGrowth.jpg')

    const declaredWidth = await page.locator('meta[property="og:image:width"]').getAttribute('content')
    const declaredHeight = await page.locator('meta[property="og:image:height"]').getAttribute('content')
    expect(declaredWidth).toBe('600')
    expect(declaredHeight).toBe('314')

    const author = await page.locator('meta[name="author"]').getAttribute('content')
    expect(author).toBeTruthy()

    const articleAuthor = await page.locator('meta[property="article:author"]').getAttribute('content')
    expect(articleAuthor).toMatch(/^https:\/\//)
  })
})

test.describe('book shelf', () => {
  test('grid view cover images actually load (not proxied through /_ipx/*)', async ({ page }) => {
    await page.goto('/books')

    // Switch to grid/matrix view if the list view is the default.
    const gridToggle = page.getByRole('button', { name: /grid/i }).first()
    if (await gridToggle.isVisible().catch(() => false)) {
      await gridToggle.click()
    }

    const covers = page.locator('img[src*="-cover"]')
    await expect(covers.first()).toBeVisible()

    const count = await covers.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const img = covers.nth(i)
      const src = await img.getAttribute('src')
      // Regression guard: images must be served directly, never proxied
      // through the IPX route, which 404s on static hosting for any size
      // variant that wasn't part of the prerender crawl.
      expect(src).not.toContain('/_ipx/')

      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    }
  })
})

test.describe('content article', () => {
  test('a book review article renders with title and body', async ({ page }) => {
    const response = await page.goto('/content/accelerate')
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator('h1').first()).toBeVisible()
  })
})

test.describe('color mode', () => {
  test('site defaults to dark mode', async ({ page }) => {
    await page.goto('/')
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDark).toBe(true)
  })
})
