<script setup lang="ts">
import type { AuthorsCollectionItem } from '@nuxt/content'

defineProps<{
  author?: AuthorsCollectionItem | null
}>()
</script>

<template>
  <section
    v-if="author"
    aria-labelledby="home-closing-cta-heading"
    class="flex flex-col items-start gap-6 border-t border-default pt-12 sm:flex-row sm:items-center"
  >
    <UAvatar :src="author.avatar" :alt="author.name" size="3xl" class="shrink-0" />

    <div>
      <h2
        id="home-closing-cta-heading"
        class="mb-2 font-serif text-2xl font-bold text-balance"
      >
        Why I write about this
      </h2>
      <p class="max-w-prose text-muted">
        I lead engineering and platform teams inside large, regulated
        organizations, and most of what I publish here comes directly out of
        that work -- the systems, the talks, and the books that shaped how I
        think about building better teams.
      </p>
      <UButton to="/about" variant="link" trailing-icon="i-lucide-arrow-right" class="mt-3 px-0">
        More about my background
      </UButton>
    </div>
  </section>
</template>
