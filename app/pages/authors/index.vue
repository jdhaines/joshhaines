<script setup lang="ts">
const { data: authors } = await useAsyncData("authors-index", () => {
  return queryCollection("authors").order("name", "ASC").all()
})

const canonicalUrl = new URL("/authors", useSiteUrl()).toString()

useSeoMeta({
  title: "Authors",
  description: "Writers and contributors on JoshHaines.com.",
  ogTitle: "Authors",
  ogDescription: "Writers and contributors on JoshHaines.com.",
  ogUrl: canonicalUrl,
  ogType: "website",
})

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
})
</script>

<template>
  <UContainer class="py-12">
    <h1 class="mb-8 text-3xl font-bold">Authors</h1>

    <UBlogPosts>
      <UBlogPost
        v-for="author in authors"
        :key="author.path"
        :to="author.path"
        :title="author.name"
        :description="author.occupation"
        :image="getAuthorCardImage(author)"
      />
    </UBlogPosts>
  </UContainer>
</template>
