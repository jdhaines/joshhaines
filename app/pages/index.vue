<script setup lang="ts">
const { data: latestPosts } = await useAsyncData('home-latest-writing', () => {
  return queryCollection('writing')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .limit(3)
    .all()
})

const latestPostPath = computed(() => latestPosts.value?.[0]?.path)

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
            Latest from the writing
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
            :badge="post.tags?.[0]"
          />
        </UBlogPosts>
      </section>
    </UContainer>
  </div>
</template>
