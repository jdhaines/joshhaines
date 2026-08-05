<script setup lang="ts">
import type { AuthorsCollectionItem } from "@nuxt/content"

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
        Why I write
      </h2>
      <p class="max-w-prose text-muted">
        William Zinsser wrote that "<em class="text-secondary"
          >writing is thinking on paper</em
        >." This site is where I work through that thinking... reflecting on lessons
        from leading engineering teams, making sense of ideas I encounter in my
        research, and sharing what I'm learning along the way.
      </p>
      <UButton
        to="/about"
        variant="link"
        trailing-icon="i-lucide-arrow-right"
        class="mt-3 px-0"
      >
        More about me
      </UButton>
    </div>
  </section>
</template>
