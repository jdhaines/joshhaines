<script setup lang="ts">
import type { PostsCollectionItem } from "@nuxt/content"

defineProps<{
  title: string
  posts: PostsCollectionItem[]
}>()
</script>

<template>
  <div v-if="posts.length">
    <h2 class="mb-3 font-mono text-xs font-semibold tracking-wide text-muted uppercase">
      {{ title }}
    </h2>
    <ul class="flex flex-col gap-3">
      <li v-for="post in posts" :key="post.path">
        <NuxtLink
          :to="post.path"
          class="group block rounded-lg border border-default p-3 transition-colors hover:border-primary"
        >
          <p class="line-clamp-2 text-sm font-medium group-hover:text-primary">
            {{ post.title }}
          </p>
          <p v-if="post.publishedAt" class="mt-1 text-xs text-muted">
            {{
              formatDate(post.publishedAt, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }}
          </p>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
