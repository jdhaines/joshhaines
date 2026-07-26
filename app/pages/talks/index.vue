<script setup lang="ts">
const { data: posts } = await useAsyncData('talks-index', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('contentType', '=', 'talk')
    .order('publishedAt', 'DESC')
    .all()
})

const canonicalUrl = new URL('/talks', useSiteUrl()).toString()

useSeoMeta({
  title: 'Talks',
  description: 'Conference talks and keynotes from Josh Haines.',
  ogTitle: 'Talks',
  ogDescription: 'Conference talks and keynotes from Josh Haines.',
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
      Talks
    </h1>

    <UBlogPosts>
      <UBlogPost
        v-for="post in posts"
        :key="post.path"
        :to="post.path"
        :title="post.title"
        :description="post.description"
        :date="post.publishedAt"
        :badge="getContentTypeBadge(post.contentType)"
      />
    </UBlogPosts>
  </UContainer>
</template>
