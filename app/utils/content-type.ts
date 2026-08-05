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
  { label: string; color: "primary" | "warning" | "success" | "secondary" }
> = {
  article: { label: "Article", color: "primary" },
  talk: { label: "Talk", color: "warning" },
  podcast: { label: "Podcast", color: "success" },
  bookReview: { label: "Book", color: "secondary" },
}

export function getContentTypeBadge(contentType?: ContentType) {
  return CONTENT_TYPE_BADGES[contentType ?? "article"]
}

/**
 * Image prop for a `UBlogPost` card on the `/writing`, `/talks`, and
 * `/podcasts` listing pages. Cards render at a fixed 16:9 crop, so a wide
 * `socialImage` (if set) is preferred over a portrait/square `image` --
 * same fallback used for the homepage "Latest" hero and the OG/social
 * preview image. Returns `undefined` (hiding the card's image slot
 * entirely) when the post has neither.
 */
export function getPostCardImage(
  post: Pick<PostsCollectionItem, "image" | "socialImage" | "imageAlt" | "title">
) {
  const src = post.socialImage ?? post.image
  if (!src) return undefined

  return { src, alt: post.imageAlt ?? post.title }
}
