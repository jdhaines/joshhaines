<script setup lang="ts">
import type { PostsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  latestPostPath?: string
  featuredPost?: PostsCollectionItem
}>()

const badge = computed(() => props.featuredPost && getContentTypeBadge(props.featuredPost.contentType))

// This slot is rendered at a wide 16:9 aspect ratio. A portrait book cover
// (`image`) looks badly cropped there, so prefer the wide `socialImage` art
// when present -- same fallback used for the OG/social preview image.
const heroImage = computed(() => props.featuredPost?.socialImage ?? props.featuredPost?.image)

function formatDate(date?: Date | string) {
  if (!date) return undefined
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <UPageHero orientation="horizontal"
    :ui="{ container: 'lg:grid-cols-5', wrapper: 'lg:col-span-3', description: 'max-w-xl' }">
    <template #title>
      <span class="block">Building Stronger Teams.</span>
      <span class="block">Engineering Better Systems.</span>
    </template>

    <template #description>
      I lead engineering and platform teams at the intersection of people,
      process, and technology. I write about leadership, technology,
      productivity, and the journey of building awesome products.
    </template>

    <template #links>
      <UButton v-if="latestPostPath" :to="latestPostPath" icon="i-lucide-file-text" size="lg">
        Read Latest Post
      </UButton>
      <UButton to="/content/behind-the-product-podcast" icon="i-lucide-headphones" variant="outline" color="neutral"
        size="lg">
        Listen to the Podcast
      </UButton>
    </template>

    <div v-if="featuredPost" class="lg:col-span-2 lg:border-l lg:border-default lg:pl-10">
      <NuxtLink :to="featuredPost.path" class="group block" aria-label="Featured">
        <NuxtImg v-if="heroImage" :src="heroImage" :alt="featuredPost.imageAlt ?? featuredPost.title"
          class="mb-4 aspect-video w-full rounded-lg object-cover transition-opacity group-hover:opacity-90" width="480"
          height="270" sizes="480px" />

        <div class="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted">
          <UBadge v-if="badge" variant="subtle" :color="badge.color" size="lg">
            {{ badge.label }}
          </UBadge>
          <span v-if="featuredPost.publishedAt">
            {{ formatDate(featuredPost.publishedAt) }}
          </span>
        </div>

        <h2 class="mb-2 font-serif text-xl font-bold text-balance group-hover:text-primary">
          {{ featuredPost.title }}
        </h2>

        <p class="mb-3 line-clamp-2 text-muted">
          {{ featuredPost.description }}
        </p>

        <span class="inline-flex items-center gap-1 font-semibold text-primary">
          Read the feature
          <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </NuxtLink>
    </div>
  </UPageHero>
</template>
