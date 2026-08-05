<script setup lang="ts">
const { data: posts } = await useAsyncData("podcasts-index", () => {
  return queryCollection("posts")
    .where("draft", "=", false)
    .where("contentType", "=", "podcast")
    .order("publishedAt", "DESC")
    .all()
})

const canonicalUrl = new URL("/podcasts", useSiteUrl()).toString()

useSeoMeta({
  title: "Podcasts",
  description: "Podcast episodes and appearances from Josh Haines.",
  ogTitle: "Podcasts",
  ogDescription: "Podcast episodes and appearances from Josh Haines.",
  ogUrl: canonicalUrl,
  ogType: "website",
})

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
})
</script>

<template>
  <UContainer class="py-12">
    <h1 class="mb-8 text-3xl font-bold">Podcasts</h1>

    <UBlogPosts>
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
