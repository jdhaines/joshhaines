<script setup lang="ts">
import type { PostsCollectionItem } from "@nuxt/content"

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

    <UBlogPosts>
      <UBlogPost
        v-for="post in posts"
        :key="post.path"
        :to="post.path"
        :title="post.title"
        :description="post.description"
        :badge="getContentTypeBadge(post.contentType)"
        :image="getPostCardImage(post)"
      />
    </UBlogPosts>
  </section>
</template>
