<script setup lang="ts">
const { data: posts } = await useAsyncData('writing-index', () => {
  return queryCollection('writing')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .all()
})

const requestUrl = useRequestURL()
const canonicalUrl = new URL('/writing', requestUrl.origin).toString()

useSeoMeta({
  title: 'Writing',
  description: 'Articles, talks, and podcast write-ups from Josh Haines.',
  ogTitle: 'Writing',
  ogUrl: canonicalUrl,
  ogType: 'website',
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>

<template>
  <UContainer class="py-12">
    <h1 class="mb-8 text-3xl font-bold">
      Writing
    </h1>

    <UBlogPosts>
      <UBlogPost
        v-for="post in posts"
        :key="post.path"
        :to="post.path"
        :title="post.title"
        :description="post.description"
        :date="post.publishedAt"
        :badge="post.tags?.[0]"
      />
    </UBlogPosts>
  </UContainer>
</template>
