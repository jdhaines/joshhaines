import type { PostsCollectionItem } from "@nuxt/content"

type ContentType = NonNullable<PostsCollectionItem["contentType"]>

/**
 * Label + Nuxt UI `color` pairing for a post's `contentType`, used to
 * color-code category badges consistently across the homepage, listing
 * pages, and the article header (Writing = primary/blue, Talks = orange,
 * Podcasts = a third distinct color).
 */
const CONTENT_TYPE_BADGES: Record<
  ContentType,
  {
    label: string
    color: "primary" | "warning" | "success" | "secondary"
    icon: string
  }
> = {
  article: { label: "Article", color: "primary", icon: "i-lucide-file-text" },
  talk: { label: "Talk", color: "warning", icon: "i-lucide-presentation" },
  podcast: { label: "Podcast", color: "success", icon: "i-lucide-headphones" },
  bookReview: { label: "Book", color: "secondary", icon: "i-lucide-book-open" },
}

export function getContentTypeBadge(contentType?: ContentType) {
  return CONTENT_TYPE_BADGES[contentType ?? "article"]
}

/**
 * Image prop for a `UBlogPost` card on the `/writing`, `/talks`, and
 * `/podcasts` listing pages. Cards render at a fixed 16:9 crop, so a wide
 * `socialImage` (if set) is preferred over a portrait/square `coverImage` --
 * same fallback used for the homepage "Latest" hero and the OG/social
 * preview image. Returns `undefined` (hiding the card's image slot
 * entirely) when the post has neither.
 */
export function getPostCardImage(
  post: Pick<
    PostsCollectionItem,
    "coverImage" | "socialImage" | "coverImageAlt" | "title"
  >
) {
  const src = post.socialImage ?? post.coverImage
  if (!src) return undefined

  return { src, alt: post.coverImageAlt ?? post.title }
}

/**
 * Badge shown on the `/tools` listing card. All tools share one label/icon
 * regardless of `kind` -- there are only ever a couple of kinds and they
 * don't need their own visual distinction, just a shared "this is a tool"
 * signal like the `contentType` badges give posts.
 */
const TOOL_BADGE = { label: "Tool", color: "primary", icon: "i-lucide-wrench" } as const

export function getToolBadge() {
  return TOOL_BADGE
}
