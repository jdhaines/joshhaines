<script setup lang="ts">
const { data: latestPosts } = await useAsyncData('home-latest-posts', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('contentType', '=', 'article')
    .order('publishedAt', 'DESC')
    .limit(3)
    .all()
})

const { data: latestAnyPost } = await useAsyncData('home-latest-any-post', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .limit(1)
    .all()
})

const { data: latestTalks } = await useAsyncData('home-latest-talks', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('contentType', '=', 'talk')
    .order('publishedAt', 'DESC')
    .limit(3)
    .all()
})

const { data: latestPodcasts } = await useAsyncData('home-latest-podcasts', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('contentType', '=', 'podcast')
    .order('publishedAt', 'DESC')
    .limit(3)
    .all()
})

const latestPostPath = computed(() => latestAnyPost.value?.[0]?.path)

const requestUrl = useRequestURL()
const canonicalUrl = new URL('/', requestUrl.origin).toString()

useSeoMeta({
  title: 'Josh Haines',
  description:
    'Leadership, software and platform engineering, innovation, book reviews, and career material from Josh Haines.',
  ogTitle: 'Josh Haines',
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
    <HomeHero :latest-post-path="latestPostPath" />

    <UContainer class="space-y-16 pb-16">
      <SectionCards />

      <section>
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            Latest Writing
          </h2>
          <UButton
            to="/writing"
            variant="link"
            trailing-icon="i-lucide-arrow-right"
          >
            View all articles
          </UButton>
        </div>

        <UBlogPosts>
          <UBlogPost
            v-for="post in latestPosts"
            :key="post.path"
            :to="post.path"
            :title="post.title"
            :description="post.description"
            :date="post.publishedAt"
            :badge="getContentTypeBadge(post.contentType)"
          />
        </UBlogPosts>
      </section>

      <section v-if="latestTalks?.length">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            Talks
          </h2>
          <UButton
            to="/talks"
            variant="link"
            trailing-icon="i-lucide-arrow-right"
          >
            View all talks
          </UButton>
        </div>

        <UBlogPosts>
          <UBlogPost
            v-for="post in latestTalks"
            :key="post.path"
            :to="post.path"
            :title="post.title"
            :description="post.description"
            :date="post.publishedAt"
            :badge="getContentTypeBadge(post.contentType)"
          />
        </UBlogPosts>
      </section>

      <section v-if="latestPodcasts?.length">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            Podcasts
          </h2>
          <UButton
            to="/podcasts"
            variant="link"
            trailing-icon="i-lucide-arrow-right"
          >
            View all episodes
          </UButton>
        </div>

        <UBlogPosts>
          <UBlogPost
            v-for="post in latestPodcasts"
            :key="post.path"
            :to="post.path"
            :title="post.title"
            :description="post.description"
            :date="post.publishedAt"
            :badge="getContentTypeBadge(post.contentType)"
          />
        </UBlogPosts>
      </section>
    </UContainer>
  </div>
</template>
