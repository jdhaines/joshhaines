import type { AuthorsCollectionItem, ToolsCollectionItem } from "@nuxt/content"

/**
 * Image prop for a `UBlogPost` card on the `/tools` listing page. Prefers a
 * purpose-made wide `socialImage` (cards render a 16:9 crop) over the
 * profile photo, same fallback convention as `getPostCardImage`. Returns
 * `undefined` (hiding the card's image slot) when the tool has neither.
 */
export function getToolCardImage(
  tool: Pick<ToolsCollectionItem, "image" | "socialImage" | "imageAlt" | "name">
) {
  const src = tool.socialImage ?? tool.image
  if (!src) return undefined

  return { src, alt: tool.imageAlt ?? tool.name }
}

/**
 * Image prop for a `UBlogPost` card on the `/authors` listing page.
 */
export function getAuthorCardImage(
  author: Pick<AuthorsCollectionItem, "avatar" | "name">
) {
  if (!author.avatar) return undefined

  return { src: author.avatar, alt: author.name }
}
