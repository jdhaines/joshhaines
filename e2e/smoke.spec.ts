import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { expect, test } from "@playwright/test"

/**
 * Smoke tests for the statically-generated site. These intentionally stay
 * shallow -- the goal is to catch "the build is broken" / "a whole page is
 * blank or 404s" / "images don't load on static hosting" classes of
 * regressions, not to exhaustively cover every page's content or behavior.
 */

const NAV_PAGES = [
  { path: "/", label: "Home" },
  { path: "/books", label: "Books" },
  { path: "/podcasts", label: "Podcasts" },
  { path: "/talks", label: "Talks" },
  { path: "/writing", label: "Writing" },
  { path: "/tools", label: "Tools" },
  { path: "/about", label: "About" },
]

test.describe("key pages load", () => {
  for (const { path, label } of NAV_PAGES) {
    test(`${label} (${path}) returns 200 and renders`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)

      // Every page should render a non-empty document title and at least
      // one heading -- a blank/broken page typically fails one of these.
      await expect(page).toHaveTitle(/.+/)
      await expect(page.locator("h1, h2").first()).toBeVisible()
    })
  }
})

test.describe("navigation", () => {
  test("header nav links to every key page", async ({ page }) => {
    await page.goto("/")

    const nav = page.getByRole("navigation").first()
    for (const { path, label } of NAV_PAGES) {
      if (label === "Home") continue
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute(
        "href",
        path
      )
    }
  })

  test("unknown routes render the custom 404 page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist")
    expect(response?.status()).toBe(404)

    // Guard against silently falling back to Nuxt's generic default error
    // page instead of our custom-styled one (app/error.vue).
    await expect(
      page.getByRole("heading", { name: "This page wandered off." })
    ).toBeVisible()
  })

  test("legacy one-off redirects (server/utils/legacy-redirects.ts) still resolve", async ({
    page,
  }) => {
    // Guard against a renamed/removed old short link silently 404ing --
    // see server/utils/legacy-redirects.ts for how to add new entries.
    // These are static-generated meta-refresh redirect pages (not a real
    // HTTP 301 once served as static files), so wait for the follow-up
    // navigation rather than asserting on the first response's URL.
    await page.goto("/subs")
    await page.waitForURL("**/content/submarines-keynote")
    expect(new URL(page.url()).pathname).toBe("/content/submarines-keynote")

    await page.goto("/techpoint")
    await page.waitForURL("**/content/chemistry-of-innovation")
    expect(new URL(page.url()).pathname).toBe("/content/chemistry-of-innovation")
  })
})

test.describe("site search", () => {
  test("pressing Enter without arrow-navigating submits the typed query to the full search page", async ({
    page,
  }) => {
    // The command palette auto-highlights the top result as you type, which
    // used to mean a bare Enter silently opened whatever was highlighted.
    // Guard the fix: with no arrow-key navigation, Enter should submit the
    // query to /search instead.
    await page.goto("/")
    await page.locator('button[aria-label^="Search"]').first().click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    const input = dialog.locator("input").first()
    await input.fill("Brene Brown")
    await expect(dialog.getByText("Dare to Lead").first()).toBeVisible()

    await page.keyboard.press("Enter")
    await page.waitForURL("**/search?q=**")
    expect(new URL(page.url()).pathname).toBe("/search")
  })

  test("arrow-navigating to a result before pressing Enter still opens that result", async ({
    page,
  }) => {
    await page.goto("/")
    await page.locator('button[aria-label^="Search"]').first().click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    const input = dialog.locator("input").first()
    await input.fill("Brene Brown")
    await expect(dialog.getByText("Dare to Lead").first()).toBeVisible()

    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await page.waitForURL("**/content/**")
    expect(new URL(page.url()).pathname).not.toBe("/search")
  })

  test("the /search results page renders cards matching the /writing index page's card style", async ({
    page,
  }) => {
    // The search results page used to render a plain UBlogPost with no
    // image, so its cards looked different from every other listing page.
    await page.goto("/search?q=Brene%20Brown")
    await expect(page.getByText("Dare to Lead")).toBeVisible()

    const searchCard = page
      .locator("article")
      .filter({ has: page.getByRole("link", { name: /Dare to Lead/ }) })
      .first()
    await expect(searchCard.locator("img").first()).toBeVisible()
  })
})

test.describe("SEO metadata", () => {
  test("homepage has a real canonical/OG URL, not a build-time localhost or stale-domain artifact", async ({
    page,
  }) => {
    await page.goto("/")

    // Regression guard: canonical/og:url must reflect the deployed site
    // origin. This previously leaked the build machine's `localhost`
    // because it was derived from useRequestURL() during static
    // prerendering instead of a fixed runtime-config site URL. It also
    // previously leaked the old `norahaines.com` staging domain (which has
    // since gone offline entirely) when `NUXT_PUBLIC_SITE_URL` wasn't set
    // in the production build environment -- every absolute URL (canonical,
    // og:url, og:image, twitter:image) must resolve to the real domain.
    const canonicalHref = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href")
    expect(canonicalHref).not.toContain("localhost")
    expect(canonicalHref).not.toContain("norahaines.com")
    expect(canonicalHref).toMatch(/^https:\/\//)

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content")
    expect(ogUrl).not.toContain("localhost")
    expect(ogUrl).not.toContain("norahaines.com")

    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content")
    expect(ogImage).not.toContain("norahaines.com")
    expect(ogImage).toMatch(/^https:\/\/.+\.png$/)
  })

  test("a book review's declared og:image dimensions match its actual image, and it has an author", async ({
    page,
  }) => {
    // Regression guard: og:image:width/height previously always inherited
    // the site-wide default banner's dimensions (1200x600) even when a
    // page overrode og:image with its own (differently-sized) socialImage.
    // Crawlers like LinkedIn's Post Inspector distrust a declared image
    // whose dimensions don't match the fetched file and silently fall
    // back to something else -- so these must stay in sync per-page.
    // Also guards that an author is always present, since LinkedIn
    // flagged "No author found" when neither `author` nor `article:author`
    // was emitted at all.
    await page.goto("/content/high-growth-handbook")

    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content")
    expect(ogImage).toContain("highGrowth.jpg")
    expect(ogImage).not.toContain("norahaines.com")

    const declaredWidth = await page
      .locator('meta[property="og:image:width"]')
      .getAttribute("content")
    const declaredHeight = await page
      .locator('meta[property="og:image:height"]')
      .getAttribute("content")
    expect(declaredWidth).toBe("600")
    expect(declaredHeight).toBe("314")

    const author = await page.locator('meta[name="author"]').getAttribute("content")
    expect(author).toBeTruthy()

    const articleAuthor = await page
      .locator('meta[property="article:author"]')
      .getAttribute("content")
    expect(articleAuthor).toMatch(/^https:\/\//)
  })

  test("a /tools/<slug> profile page's og:image uses its own socialImage, not the site-wide default banner", async ({
    page,
  }) => {
    // Regression guard: the /tools/<slug> page previously didn't set
    // og:image/twitter:image at all, so link previews silently fell back
    // to the site-wide default banner (Josh's logo) instead of the tool's
    // own socialImage (e.g. an actual photo of the typewriter).
    await page.goto("/tools/olympia-sm3")

    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content")
    expect(ogImage).toContain("olympia-sm3")
    expect(ogImage).not.toContain("josh-haines-social")
  })
})

test.describe("book shelf", () => {
  test("grid view cover images actually load (not proxied through /_ipx/*)", async ({
    page,
  }) => {
    await page.goto("/books")

    // Switch to grid/matrix view if the list view is the default.
    const gridToggle = page.getByRole("button", { name: /grid/i }).first()
    if (await gridToggle.isVisible().catch(() => false)) {
      await gridToggle.click()
    }

    const covers = page.locator('img[src*="-cover"]')
    await expect(covers.first()).toBeVisible()

    const count = await covers.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const img = covers.nth(i)
      const src = await img.getAttribute("src")
      // Regression guard: images must be served directly, never proxied
      // through the IPX route, which 404s on static hosting for any size
      // variant that wasn't part of the prerender crawl.
      expect(src).not.toContain("/_ipx/")

      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    }
  })
})

test.describe("content article", () => {
  test("a book review article renders with title and body", async ({ page }) => {
    const response = await page.goto("/content/accelerate")
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test('a post with a draftTool shows the "How This Was Drafted" sidebar widget, and its /tools/<slug> profile page renders', async ({
    page,
  }) => {
    // "accelerate" is one of the ~70 posts backfilled with `draftTool:
    // essay` -- this only cares that the opt-in mechanism works end to end,
    // not that this specific post always uses this specific tool. Matched
    // by href (not display text) since `tools/essay.md`'s `name` is content
    // Josh edits freely (e.g. "Essay" -> "Essay App").
    await page.goto("/content/accelerate")
    await expect(page.getByText("How This Was Drafted")).toBeVisible()
    await expect(page.locator('a[href="/tools/essay"]').first()).toBeVisible()

    const response = await page.goto("/tools/essay")
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/.+/)
    await expect(page.getByRole("heading", { name: "Accelerate" })).toBeVisible()
  })

  test("the /tools and /authors index pages render cards", async ({ page }) => {
    const toolsResponse = await page.goto("/tools")
    expect(toolsResponse?.status()).toBe(200)
    await expect(page.locator('a[href="/tools/essay"]').first()).toBeVisible()

    const authorsResponse = await page.goto("/authors")
    expect(authorsResponse?.status()).toBe(200)
    await expect(
      page.getByRole("link", { name: "Josh Haines", exact: true })
    ).toBeVisible()
  })

  test("typed-page images in the draft-process sidebar open a lightbox on click and close on Escape", async ({
    page,
  }) => {
    // embla-carousel's drag handling swallows the click before the browser's
    // native "view image at actual size" zoom can fire, so this widget needs
    // its own lightbox -- unlike plain prose images elsewhere in the article.
    await page.goto("/content/five-dysfunctions-of-a-team")
    const carouselImage = page.getByRole("img", { name: /typed draft page/i }).first()
    await expect(carouselImage).toBeVisible()

    await carouselImage.click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole("img", { name: /typed draft page/i })).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(dialog).not.toBeVisible()
  })

  test("the comments section renders with a submission form (Turnstile is configured)", async ({
    page,
  }) => {
    await page.goto("/content/accelerate")

    await expect(page.getByRole("heading", { name: "Comments" })).toBeVisible()
    // A Turnstile site key is configured by default (see nuxt.config.ts),
    // so the submission form should render.
    await expect(page.getByRole("button", { name: "Post comment" })).toBeVisible()
    // Optional email field (shown as "Name (email)" once approved).
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible()
  })

  test('a draft post still builds as a reachable "ghost" page, but is noindexed and unlinked from the homepage', async ({
    page,
  }) => {
    // Find whichever post currently has `draft: true` rather than hardcoding
    // a slug -- which post (if any) is a draft changes as content is
    // written/published, and this test only cares about the mechanism (see
    // draftContentRoutes() in nuxt.config.ts), not a specific article.
    const contentDir = fileURLToPath(new URL("../content/content", import.meta.url))
    const draftSlug = readdirSync(contentDir)
      .filter((file) => file.endsWith(".md"))
      .find((file) =>
        /^draft:\s*true\s*$/m.test(readFileSync(`${contentDir}/${file}`, "utf-8"))
      )
      ?.slice(0, -".md".length)

    test.skip(!draftSlug, "No draft post currently exists to test against.")

    // It must still be a real, working page so a direct link can be
    // privately shared, but must not be indexable or discoverable from any
    // listing.
    const response = await page.goto(`/content/${draftSlug}`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow"
    )

    await page.goto("/")
    await expect(page.locator(`a[href="/content/${draftSlug}"]`)).toHaveCount(0)
  })
})

test.describe("color mode", () => {
  test("site defaults to dark mode", async ({ page }) => {
    await page.goto("/")
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    )
    expect(isDark).toBe(true)
  })
})
