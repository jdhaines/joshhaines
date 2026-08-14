<script setup lang="ts">
const route = useRoute()

const { data: tool } = await useAsyncData(`tool-${route.path}`, () => {
  return queryCollection("tools").path(route.path).first()
})

if (!tool.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Tool not found",
    fatal: true,
  })
}

const { data: posts } = await useAsyncData(`tool-posts-${route.path}`, () => {
  return queryCollection("posts")
    .where("draft", "=", false)
    .where("draftTool", "=", route.params.slug as string)
    .order("publishedAt", "DESC")
    .all()
})

const canonicalUrl = new URL(route.path, useSiteUrl()).toString()

const { open: openLightbox } = useImageLightbox()

useSeoMeta({
  title: () => tool.value?.name,
  description: () => tool.value?.tagline,
  ogTitle: () => tool.value?.name,
  ogDescription: () => tool.value?.tagline,
  ogUrl: canonicalUrl,
  ogType: "profile",
})

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
})
</script>

<template>
  <UContainer v-if="tool" class="py-12">
    <div
      class="flex flex-col gap-4 rounded-lg border border-default bg-elevated p-6 sm:flex-row sm:items-start"
    >
      <UAvatar
        v-if="tool.image"
        :src="tool.image"
        :alt="tool.imageAlt ?? tool.name"
        size="3xl"
        class="shrink-0"
      />
      <div>
        <p class="font-serif text-lg font-semibold">
          {{ tool.name }}
        </p>
        <p v-if="tool.color" class="mb-2 text-sm text-muted">
          {{ tool.color }}
        </p>
        <ContentRenderer
          :value="tool"
          class="prose prose-sm max-w-none dark:prose-invert"
        />
        <UButton
          v-if="tool.link"
          :to="tool.link"
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
          color="neutral"
          size="sm"
          class="mt-3"
          icon="i-lucide-external-link"
        >
          Learn more
        </UButton>
      </div>
    </div>

    <UCarousel
      v-if="tool.images?.length"
      v-slot="{ item, index }"
      :items="tool.images"
      arrows
      class="mx-auto mt-8 max-w-xl"
      :ui="{
        prev: 'start-2 sm:start-2 top-1/2 -translate-y-1/2',
        next: 'end-2 sm:end-2 top-1/2 -translate-y-1/2',
      }"
    >
      <img
        :src="item"
        :alt="`${tool.name} photo ${index + 1}`"
        class="aspect-[4/3] w-full cursor-zoom-in rounded-lg object-cover"
        @click="openLightbox(item, `${tool.name} photo ${index + 1}`)"
      />
    </UCarousel>

    <UBlogPosts v-if="posts?.length" class="mt-12">
      <UBlogPost
        v-for="post in posts"
        :key="post.path"
        :to="post.path"
        :title="post.title"
        :description="post.description"
        :date="post.publishedAt"
        :badge="getContentTypeBadge(post.contentType)"
        :image="getPostCardImage(post)"
      />
    </UBlogPosts>
  </UContainer>
</template>
