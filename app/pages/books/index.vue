<script setup lang="ts">
const { data: posts } = await useAsyncData('books-index', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('contentType', '=', 'bookReview')
    .order('publishedAt', 'DESC')
    .all()
})

const requestUrl = useRequestURL()
const canonicalUrl = new URL('/books', requestUrl.origin).toString()

useSeoMeta({
  title: 'Book Reviews',
  description: 'Book reviews and notes from Josh Haines.',
  ogTitle: 'Book Reviews',
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
      Book Reviews
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
