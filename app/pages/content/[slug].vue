<script setup lang="ts">
import type { PostsCollectionItem } from '@nuxt/content'
import type { ContentSurroundLink } from '@nuxt/ui'
import { getRuntimeLabel } from '~/utils/reading-time'
import { getImageDimensions } from '~/utils/social-image'

const route = useRoute()

const { data: page } = await useAsyncData(`content-${route.path}`, () => {
  return queryCollection('posts').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const { data: author } = await useAsyncData(`content-author-${page.value.author}`, () => {
  return queryCollection('authors').path(`/authors/${page.value!.author}`).first()
})

const { data: bookShelf } = await useAsyncData('content-book-shelf', () => {
  return queryCollection('bookShelf').first()
})

const bookShelfRank = computed(() => {
  if (page.value?.contentType !== 'bookReview') return undefined
  const slug = page.value.path.split('/').pop()
  const index = bookShelf.value?.order.indexOf(slug ?? '') ?? -1
  return index === -1 ? undefined : index + 1
})

// All published posts, ordered by date, so we can compute prev/next
// neighbors and tag-overlap "On This Topic" suggestions in-memory. The
// collection is small enough that this is simpler and more flexible than
// `queryCollectionItemSurroundings` (which doesn't support custom ordering).
const { data: allPosts } = await useAsyncData('content-all', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .all()
})

const runtimeLabel = computed(() => getRuntimeLabel(page.value!))

const currentIndex = computed(() => allPosts.value?.findIndex(post => post.path === page.value!.path) ?? -1)

const surround = computed(() => {
  const posts = allPosts.value
  if (!posts || currentIndex.value === -1) return []

  const next = currentIndex.value > 0 ? posts[currentIndex.value - 1] : undefined
  const prev = currentIndex.value < posts.length - 1 ? posts[currentIndex.value + 1] : undefined

  return [
    prev ? { path: prev.path, title: prev.title, description: prev.description } : undefined,
    next ? { path: next.path, title: next.title, description: next.description } : undefined,
  ] as (ContentSurroundLink | undefined)[]
})

const onThisTopic = computed<PostsCollectionItem[]>(() => {
  const posts = allPosts.value
  const tags = page.value?.tags
  if (!posts || !tags?.length) return []

  return posts
    .filter(post => post.path !== page.value!.path)
    .map(post => ({ post, score: post.tags?.filter(tag => tags.includes(tag)).length ?? 0 }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ post }) => post)
})

const { data: relatedWriting } = await useAsyncData(`content-related-${page.value.path}`, () => {
  const slugs = page.value?.relatedWriting ?? []
  if (!slugs.length) return Promise.resolve([])

  return Promise.all(
    slugs.map(slug => queryCollection('posts').path(`/content/${slug}`).first()),
  ).then(results => results.filter((post): post is PostsCollectionItem => !!post))
})

// Resolved once, eagerly, during setup while the Nuxt app context is still
// active -- calling useSiteUrl() (and therefore useRuntimeConfig()) lazily
// from inside the computed getter below fails during static prerendering,
// where the getter can re-run outside of an active Nuxt app instance.
const siteUrl = useSiteUrl()
const canonicalUrl = page.value.canonicalUrl ?? new URL(route.path, siteUrl).toString()
const socialImagePath = computed(() => page.value?.socialImage ?? page.value?.image)
const socialImageUrl = computed(() => {
  const socialImage = socialImagePath.value
  return socialImage ? new URL(socialImage, siteUrl).toString() : undefined
})

// The site-wide default `og:image:width`/`og:image:height` set in
// `nuxt.config.ts` only match the site's default banner image -- every
// page here overrides `og:image` with its own `socialImage`, which is a
// different size, so the dimensions must be looked up per-image rather
// than inheriting the global (wrong) values.
const { data: socialImageDimensions } = await useAsyncData(`content-image-size-${route.path}`, () => {
  const imagePath = socialImagePath.value
  return imagePath ? getImageDimensions(imagePath) : Promise.resolve(undefined)
})

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
  author: () => author.value?.name,
  ogTitle: () => page.value?.title,
  ogDescription: () => page.value?.description,
  ogImage: socialImageUrl,
  ogImageWidth: () => socialImageDimensions.value?.width,
  ogImageHeight: () => socialImageDimensions.value?.height,
  ogUrl: canonicalUrl,
  ogType: 'article',
  articlePublishedTime: () => page.value?.publishedAt ? new Date(page.value.publishedAt).toISOString() : undefined,
  articleModifiedTime: () => page.value?.updatedAt ? new Date(page.value.updatedAt).toISOString() : undefined,
  articleAuthor: () => author.value?.linkedin ? [author.value.linkedin] : undefined,
  twitterCard: 'summary_large_image',
  twitterImage: socialImageUrl,
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>

<template>
  <UContainer
    v-if="page"
    class="py-12"
  >
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <article class="min-w-0">
        <ArticleHeader
          :page="page"
          :author="author"
          :runtime-label="runtimeLabel"
          :book-shelf-rank="bookShelfRank"
        />

        <ContentRenderer
          :value="page"
          class="article-body prose dark:prose-invert mt-8 max-w-none"
        />

        <UContentSurround
          v-if="surround.some(Boolean)"
          :surround="(surround as ContentSurroundLink[])"
          class="mt-12"
        />
      </article>

      <aside class="hidden lg:block">
        <div class="sticky top-24 flex flex-col gap-8">
          <UContentToc
            v-if="page.body?.toc?.links?.length"
            :links="page.body.toc.links"
            title="On this page"
          />

          <ArticleHeroThumb
            v-if="page.image"
            :src="page.image"
            :alt="page.imageAlt ?? page.title"
            :portrait="page.contentType === 'bookReview'"
          />

          <RelatedList
            title="On This Topic"
            :posts="onThisTopic"
          />

          <RelatedList
            title="You Might Also Like"
            :posts="relatedWriting ?? []"
          />
        </div>
      </aside>
    </div>
  </UContainer>
</template>
