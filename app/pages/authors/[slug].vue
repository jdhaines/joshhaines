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

const canonicalUrl = new URL(route.path, useSiteUrl()).toString()

useSeoMeta({
  title: () => author.value?.name,
  description: () => author.value?.occupation,
  ogTitle: () => author.value?.name,
  ogDescription: () => author.value?.occupation,
  ogUrl: canonicalUrl,
  ogType: 'profile',
})

const personSchema = computed(() => {
  if (!author.value) return undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.value.name,
    description: author.value.occupation,
    url: canonicalUrl,
    sameAs: author.value.linkedin ? [author.value.linkedin] : undefined,
  }
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => personSchema.value ? JSON.stringify(personSchema.value) : undefined,
    },
  ],
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
