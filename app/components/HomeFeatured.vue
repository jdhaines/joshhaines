<script setup lang="ts">
import type { PostsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  post: PostsCollectionItem
}>()

const badge = computed(() => getContentTypeBadge(props.post.contentType))
const runtimeLabel = computed(() => getRuntimeLabel(props.post))

// This slot is rendered at a wide 16:9 aspect ratio. A portrait book cover
// (`image`) looks badly cropped there, so prefer the wide `socialImage` art
// when present -- same fallback used for the OG/social preview image.
const heroImage = computed(() => props.post.socialImage ?? props.post.image)

function formatDate(date?: Date | string) {
  if (!date) return undefined
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <section aria-labelledby="home-featured-heading">
    <HomeSectionEyebrow id="home-featured-heading" label="Featured" />

    <NuxtLink
      :to="post.path"
      class="group grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10"
    >
      <NuxtImg
        v-if="heroImage"
        :src="heroImage"
        :alt="post.imageAlt ?? post.title"
        class="aspect-video w-full rounded-lg object-cover transition-opacity group-hover:opacity-90"
        width="640"
        height="360"
        sizes="640px"
      />

      <div>
        <div class="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <UBadge
            variant="subtle"
            :color="badge.color"
            size="lg"
          >
            {{ badge.label }}
          </UBadge>
          <template v-if="post.tags?.length">
            <span>·</span>
            <span>{{ post.tags.slice(0, 2).join(' · ') }}</span>
          </template>
          <span>·</span>
          <span>{{ runtimeLabel }}</span>
        </div>

        <h2 class="mb-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
          {{ post.title }}
        </h2>

        <p class="mb-6 max-w-prose text-lg text-muted">
          {{ post.description }}
        </p>

        <span
          v-if="post.publishedAt"
          class="mb-4 block text-sm text-muted"
        >
          {{ formatDate(post.publishedAt) }}
        </span>

        <span class="inline-flex items-center gap-1 font-semibold text-primary">
          Read the feature
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </NuxtLink>
  </section>
</template>
