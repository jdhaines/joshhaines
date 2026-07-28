<script setup lang="ts">
import type { PostsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  posts: PostsCollectionItem[]
}>()

// First item gets the larger treatment, the rest render as compact rows --
// one component handles every content type rather than a separate list per
// collection.
const [heroPost, ...restPosts] = props.posts

// This slot is rendered at a wide 16:9 aspect ratio. A portrait book cover
// (`image`) looks badly cropped there, so prefer the wide `socialImage` art
// when present -- same fallback used for the OG/social preview image.
const heroImage = computed(() => heroPost?.socialImage ?? heroPost?.image)

function formatDate(date?: Date | string) {
  if (!date) return undefined
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <section v-if="heroPost" aria-labelledby="home-latest-heading">
    <HomeSectionEyebrow id="home-latest-heading" label="Latest" />

    <div class="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <NuxtLink :to="heroPost.path" class="group block">
        <NuxtImg
          v-if="heroImage"
          :src="heroImage"
          :alt="heroPost.imageAlt ?? heroPost.title"
          class="mb-4 aspect-video w-full rounded-lg object-cover transition-opacity group-hover:opacity-90"
          width="560"
          height="315"
          sizes="560px"
        />
        <UBadge
          variant="subtle"
          :color="getContentTypeBadge(heroPost.contentType).color"
          size="lg"
          class="mb-2"
        >
          {{ getContentTypeBadge(heroPost.contentType).label }}
        </UBadge>
        <h3 class="mb-2 font-serif text-2xl font-bold text-balance group-hover:text-primary">
          {{ heroPost.title }}
        </h3>
        <p class="line-clamp-2 text-muted">
          {{ heroPost.description }}
        </p>
        <p
          v-if="heroPost.publishedAt"
          class="mt-2 text-sm text-muted"
        >
          {{ formatDate(heroPost.publishedAt) }}
        </p>
      </NuxtLink>

      <ul class="flex flex-col divide-y divide-default border-t border-default lg:border-t-0">
        <li v-for="post in restPosts" :key="post.path">
          <NuxtLink
            :to="post.path"
            class="group flex items-start justify-between gap-4 py-4"
          >
            <div>
              <UBadge
                variant="subtle"
                :color="getContentTypeBadge(post.contentType).color"
                size="md"
                class="mb-1.5"
              >
                {{ getContentTypeBadge(post.contentType).label }}
              </UBadge>
              <p class="font-medium text-balance group-hover:text-primary">
                {{ post.title }}
              </p>
            </div>
            <time
              v-if="post.publishedAt"
              class="shrink-0 pt-1 text-sm whitespace-nowrap text-muted"
            >
              {{ formatDate(post.publishedAt) }}
            </time>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>
