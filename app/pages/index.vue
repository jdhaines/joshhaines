<script setup lang="ts">
const { data: latestAnyPost } = await useAsyncData('home-latest-any-post', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .limit(1)
    .all()
})

const { data: featuredPosts } = await useAsyncData('home-featured', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('featured', '=', true)
    .order('publishedAt', 'DESC')
    .limit(1)
    .all()
})

const featuredPost = computed(() => featuredPosts.value?.[0])

const { data: latestMixedPosts } = await useAsyncData('home-latest-mixed', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .limit(6)
    .all()
})

// Mixed "Latest" feed shouldn't repeat whatever is already the big Featured
// item above it.
const latestPosts = computed(() => {
  return (latestMixedPosts.value ?? [])
    .filter(post => post.path !== featuredPost.value?.path)
    .slice(0, 4)
})

const { data: startHerePosts } = await useAsyncData('home-start-here', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('startHere', '=', true)
    .order('publishedAt', 'ASC')
    .limit(3)
    .all()
})

const { data: bookshelfPosts } = await useAsyncData('home-bookshelf', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('contentType', '=', 'bookReview')
    .order('publishedAt', 'DESC')
    .limit(6)
    .all()
})

const { data: mediaFeaturePosts } = await useAsyncData('home-media-feature', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('contentType', 'IN', ['talk', 'podcast'])
    .order('publishedAt', 'DESC')
    .limit(4)
    .all()
})

// Prefer a podcast for the media feature (the Featured section above is
// already a talk in the current lineup); fall back to the newest talk if no
// podcast is available, always skipping whatever's already Featured.
const mediaFeaturePost = computed(() => {
  const candidates = (mediaFeaturePosts.value ?? []).filter(post => post.path !== featuredPost.value?.path)
  return candidates.find(post => post.contentType === 'podcast') ?? candidates[0]
})

const { data: josh } = await useAsyncData('home-author-josh', () => {
  return queryCollection('authors').path('/authors/josh').first()
})

const latestPostPath = computed(() => latestAnyPost.value?.[0]?.path)

const canonicalUrl = new URL('/', useSiteUrl()).toString()

useSeoMeta({
  title: 'Josh Haines',
  description:
    'Leadership, software and platform engineering, innovation, book reviews, and career material from Josh Haines.',
  ogTitle: 'Josh Haines',
  ogDescription:
    'Leadership, software and platform engineering, innovation, book reviews, and career material from Josh Haines.',
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>

<template>
  <div>
    <HomeHero :latest-post-path="latestPostPath" :featured-post="featuredPost" />

    <UContainer class="space-y-24 pb-20">
      <HomeExplore />

      <HomeStartHere v-if="startHerePosts?.length" :posts="startHerePosts" />

      <HomeBookshelf v-if="bookshelfPosts?.length" :posts="bookshelfPosts" />

      <HomeLatest v-if="latestPosts.length" :posts="latestPosts" />

      <HomeMediaFeature v-if="mediaFeaturePost" :post="mediaFeaturePost" />

      <HomeClosingCta :author="josh" />
    </UContainer>
  </div>
</template>
