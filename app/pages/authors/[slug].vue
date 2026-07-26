<script setup lang="ts">
const route = useRoute()

const { data: author } = await useAsyncData(`author-${route.path}`, () => {
  return queryCollection('authors').path(route.path).first()
})

if (!author.value) {
  throw createError({ statusCode: 404, statusMessage: 'Author not found', fatal: true })
}

const { data: posts } = await useAsyncData(`author-posts-${route.path}`, () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('author', '=', route.params.slug as string)
    .order('publishedAt', 'DESC')
    .all()
})

const requestUrl = useRequestURL()
const canonicalUrl = new URL(route.path, requestUrl.origin).toString()

useSeoMeta({
  title: () => author.value?.name,
  description: () => author.value?.occupation,
  ogTitle: () => author.value?.name,
  ogDescription: () => author.value?.occupation,
  ogUrl: canonicalUrl,
  ogType: 'profile',
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>

<template>
  <UContainer
    v-if="author"
    class="py-12"
  >
    <div class="mx-auto max-w-3xl">
      <AuthorBlock :author="author" />

      <UBlogPosts
        v-if="posts?.length"
        class="mt-12"
      >
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
    </div>
  </UContainer>
</template>
