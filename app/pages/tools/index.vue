<script setup lang="ts">
const { data: tools } = await useAsyncData("tools-index", () => {
  return queryCollection("tools").order("name", "ASC").all()
})

const canonicalUrl = new URL("/tools", useSiteUrl()).toString()

useSeoMeta({
  title: "Tools",
  description: "Apps, typewriters, and other tools Josh writes with.",
  ogTitle: "Tools",
  ogDescription: "Apps, typewriters, and other tools Josh writes with.",
  ogUrl: canonicalUrl,
  ogType: "website",
})

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
})
</script>

<template>
  <UContainer class="py-12">
    <h1 class="mb-8 text-3xl font-bold">Tools</h1>

    <UBlogPosts>
      <UBlogPost
        v-for="tool in tools"
        :key="tool.path"
        :to="tool.path"
        :title="tool.name"
        :description="tool.tagline"
        :badge="getToolBadge()"
        :image="getToolCardImage(tool)"
      />
    </UBlogPosts>
  </UContainer>
</template>
