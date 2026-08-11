<script setup lang="ts">
import type { PostsCollectionItem } from "@nuxt/content"

const props = defineProps<{
  latestPostPath?: string
  featuredPost?: PostsCollectionItem
}>()

const badge = computed(
  () => props.featuredPost && getContentTypeBadge(props.featuredPost.contentType)
)

// This slot is rendered at a wide 16:9 aspect ratio. A portrait book cover
// (`image`) looks badly cropped there, so prefer the wide `socialImage` art
// when present -- same fallback used for the OG/social preview image.
const heroImage = computed(
  () => props.featuredPost?.socialImage ?? props.featuredPost?.image
)

const runtimeLabel = computed(
  () => props.featuredPost && getRuntimeLabel(props.featuredPost)
)
</script>

<template>
  <UPageHero
    orientation="horizontal"
    :ui="{
      root: 'border-b border-default bg-muted',
      container: 'lg:items-stretch py-16 sm:py-20 lg:py-28',
      wrapper: 'flex flex-col lg:h-full',
      description: 'max-w-xl',
      footer: 'mt-8 lg:mt-auto',
    }"
  >
    <template #title>
      <span class="block mb-2">better products</span>
      <span class="block mb-2">better teams</span>
      <span class="block">better leaders</span>
    </template>

    <template #description>
      I lead engineering and platform teams at the intersection of people and
      technology. This is where I write about what's working and what I'm learning along
      the way.</template
    >
    <template #links>
      <UButton
        v-if="latestPostPath"
        :to="latestPostPath"
        icon="i-lucide-file-text"
        size="lg"
      >
        Read the Latest Post
      </UButton>
      <UButton
        to="/content/behind-the-product-podcast"
        icon="i-lucide-headphones"
        variant="outline"
        color="neutral"
        size="lg"
      >
        Listen to the Podcast
      </UButton>
    </template>

    <div v-if="featuredPost" class="flex">
      <NuxtLink
        :to="featuredPost.path"
        class="group flex w-full flex-col overflow-hidden rounded-2xl border border-default bg-elevated/40 p-6 transition-colors hover:border-primary/50 sm:p-8"
        aria-label="Featured"
      >
        <NuxtImg
          v-if="heroImage"
          :src="heroImage"
          :alt="featuredPost.imageAlt ?? featuredPost.title"
          class="mb-6 aspect-video w-full rounded-lg object-cover transition-opacity group-hover:opacity-90"
          width="640"
          height="360"
          sizes="(min-width: 1024px) 480px, 100vw"
        />

        <div class="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <UBadge
            v-if="badge"
            variant="subtle"
            :color="badge.color"
            :icon="badge.icon"
            size="lg"
          >
            {{ badge.label }}
          </UBadge>
          <span v-if="featuredPost.publishedAt">
            {{
              formatDate(featuredPost.publishedAt, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }}
          </span>
          <span v-if="runtimeLabel">· {{ runtimeLabel }}</span>
        </div>

        <h2
          class="mb-3 font-serif text-2xl font-bold text-balance group-hover:text-primary"
        >
          {{ featuredPost.title }}
        </h2>

        <p class="mb-5 line-clamp-3 text-muted">
          {{ featuredPost.description }}
        </p>

        <span class="mt-auto inline-flex items-center gap-1 font-semibold text-primary">
          Read the feature
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 transition-transform group-hover:translate-x-1"
          />
        </span>
      </NuxtLink>
    </div>
  </UPageHero>
</template>
