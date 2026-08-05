<script setup lang="ts">
import type { PostsCollectionItem } from "@nuxt/content"

const props = defineProps<{
  post: PostsCollectionItem
}>()

const isPodcast = computed(() => props.post.contentType === "podcast")
const eyebrow = computed(() => (isPodcast.value ? "Listen" : "Speaking"))
const runtimeLabel = computed(() => getRuntimeLabel(props.post))
</script>

<template>
  <section
    aria-labelledby="home-media-feature-heading"
    class="rounded-xl border border-default bg-elevated/40 p-6 sm:p-10"
  >
    <HomeSectionEyebrow id="home-media-feature-heading" :label="eyebrow" />

    <div
      class="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center sm:gap-10"
    >
      <div class="order-2 sm:order-1">
        <h2 class="mb-3 font-serif text-2xl font-bold text-balance sm:text-3xl">
          {{ post.title }}
        </h2>
        <p class="mb-6 max-w-prose text-muted">
          {{ post.description }}
        </p>

        <UButton
          :to="post.path"
          :icon="isPodcast ? 'i-lucide-play' : 'i-lucide-presentation'"
          size="lg"
        >
          {{ isPodcast ? "Play episode" : "View talk and slides" }}
        </UButton>

        <span class="ml-4 text-sm text-muted">{{ runtimeLabel }}</span>
      </div>

      <NuxtImg
        v-if="post.image"
        :src="post.image"
        :alt="post.imageAlt ?? post.title"
        class="order-1 aspect-video w-full rounded-lg object-cover sm:order-2"
        width="480"
        height="270"
        sizes="480px"
      />
    </div>
  </section>
</template>
