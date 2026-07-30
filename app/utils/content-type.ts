import type { PostsCollectionItem } from '@nuxt/content'

type ContentType = NonNullable<PostsCollectionItem['contentType']>

/**
 * Label + Nuxt UI `color` pairing for a post's `contentType`, used to
 * color-code category badges consistently across the homepage, listing
 * pages, and the article header (Writing = primary/blue, Talks = orange,
 * Podcasts = a third distinct color).
 */
const CONTENT_TYPE_BADGES: Record<ContentType, { label: string, color: 'primary' | 'warning' | 'success' | 'secondary' }> = {
  article: { label: 'Article', color: 'primary' },
  talk: { label: 'Talk', color: 'warning' },
  podcast: { label: 'Podcast', color: 'success' },
  bookReview: { label: 'Book', color: 'secondary' },
}

export function getContentTypeBadge(contentType?: ContentType) {
  return CONTENT_TYPE_BADGES[contentType ?? 'article']
}
