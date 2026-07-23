<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`writing-${route.path}`, () => {
  return queryCollection('writing').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const requestUrl = useRequestURL()
const canonicalUrl = new URL(route.path, requestUrl.origin).toString()

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
  ogTitle: () => page.value?.title,
  ogDescription: () => page.value?.description,
  ogImage: () => page.value?.image,
  ogUrl: canonicalUrl,
  ogType: 'article',
  articlePublishedTime: () => page.value?.publishedAt?.toString(),
  articleModifiedTime: () => page.value?.updatedAt?.toString(),
  twitterCard: 'summary_large_image',
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
    <div class="mx-auto max-w-3xl">
      <div class="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
        <time :datetime="page.publishedAt?.toString()">
          {{ new Date(page.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </time>
        <template v-if="page.tags?.length">
          <span>·</span>
          <UBadge
            v-for="tag in page.tags"
            :key="tag"
            variant="subtle"
            size="sm"
          >
            {{ tag }}
          </UBadge>
        </template>
      </div>

      <h1 class="mb-8 font-serif text-4xl font-bold">
        {{ page.title }}
      </h1>

      <ContentRenderer
        :value="page"
        class="max-w-none"
      />
    </div>
  </UContainer>
</template>
