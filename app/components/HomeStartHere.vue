<script setup lang="ts">
import type { PostsCollectionItem } from '@nuxt/content'

defineProps<{
  posts: PostsCollectionItem[]
}>()
</script>

<template>
  <section v-if="posts.length" aria-labelledby="home-start-here-heading">
    <HomeSectionEyebrow id="home-start-here-heading" label="Start Here" />
    <p class="mb-6 max-w-prose text-muted">
      New here? These are the pieces that best represent how I think and work.
    </p>

    <ol class="grid gap-6 sm:grid-cols-3">
      <li v-for="(post, index) in posts" :key="post.path">
        <NuxtLink :to="post.path" class="group block">
          <span class="mb-2 block font-mono text-sm text-muted">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <UBadge
            variant="subtle"
            :color="getContentTypeBadge(post.contentType).color"
            size="md"
            class="mb-2"
          >
            {{ getContentTypeBadge(post.contentType).label }}
          </UBadge>
          <h3 class="font-serif text-lg font-semibold text-balance group-hover:text-primary">
            {{ post.title }}
          </h3>
          <p class="mt-1 line-clamp-2 text-sm text-muted">
            {{ post.description }}
          </p>
        </NuxtLink>
      </li>
    </ol>
  </section>
</template>
