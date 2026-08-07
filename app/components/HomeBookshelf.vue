<script setup lang="ts">
import type { PostsCollectionItem } from "@nuxt/content"

defineProps<{
  posts: PostsCollectionItem[]
}>()
</script>

<template>
  <section v-if="posts.length" aria-labelledby="home-bookshelf-heading">
    <HomeSectionEyebrow id="home-bookshelf-heading" label="From the Bookshelf">
      <template #action>
        <UButton to="/books" variant="link" trailing-icon="i-lucide-arrow-right">
          Browse all reviews
        </UButton>
      </template>
    </HomeSectionEyebrow>

    <ul class="flex gap-6 overflow-x-auto pb-2">
      <li v-for="post in posts" :key="post.path" class="w-32 shrink-0 sm:w-40">
        <NuxtLink :to="post.path" class="group block">
          <div
            v-if="post.image"
            class="mb-3 aspect-[2/3] w-full overflow-hidden rounded-md bg-elevated p-2 transition-transform group-hover:-translate-y-1"
          >
            <NuxtImg
              :src="post.image"
              :alt="post.imageAlt ?? post.title"
              class="size-full object-contain drop-shadow-lg"
              width="200"
              height="300"
              sizes="160px"
            />
          </div>
          <p class="font-medium text-balance group-hover:text-primary">
            {{ post.title }}
          </p>
          <p
            v-if="formatBookAuthors(post.bookAuthor)"
            class="mt-0.5 text-sm text-muted"
          >
            {{ formatBookAuthors(post.bookAuthor) }}
          </p>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
