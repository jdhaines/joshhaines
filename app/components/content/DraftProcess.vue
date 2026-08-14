<script setup lang="ts">
import type { ToolsCollectionItem } from "@nuxt/content"

const props = defineProps<{
  tool: ToolsCollectionItem
  postTitle: string
  typedPageImages?: string[]
}>()

const images = computed(() => props.typedPageImages ?? [])

const { open: openLightbox } = useImageLightbox()
</script>

<template>
  <div
    class="flex min-w-0 flex-col gap-3 rounded-lg border border-default bg-elevated p-4"
  >
    <h2 class="font-mono text-xs font-semibold tracking-wide text-muted uppercase">
      How This Was Drafted
    </h2>

    <div class="flex items-center gap-3">
      <UAvatar
        v-if="tool.image"
        :src="tool.image"
        :alt="tool.imageAlt ?? tool.name"
        size="lg"
        class="shrink-0"
      />
      <div>
        <div class="flex items-center gap-1.5">
          <NuxtLink :to="tool.path" class="text-sm font-medium hover:text-primary">
            {{ tool.name }}
          </NuxtLink>
          <UButton
            v-if="tool.link"
            :to="tool.link"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${tool.name} website`"
            icon="i-lucide-external-link"
            variant="link"
            color="neutral"
            size="xs"
            class="p-0"
          />
        </div>
        <p v-if="tool.tagline" class="text-xs text-muted">
          {{ tool.tagline }}
        </p>
      </div>
    </div>

    <UCarousel
      v-if="images.length"
      v-slot="{ item, index }"
      :items="images"
      arrows
      class="mt-1"
      :ui="{
        prev: 'start-2 sm:start-2 top-1/2 -translate-y-1/2',
        next: 'end-2 sm:end-2 top-1/2 -translate-y-1/2',
      }"
    >
      <img
        :src="item"
        :alt="`${postTitle} - typed draft page ${index + 1}`"
        class="aspect-[3/4] w-full cursor-zoom-in rounded-md object-cover"
        @click="openLightbox(item, `${postTitle} - typed draft page ${index + 1}`)"
      />
    </UCarousel>
  </div>
</template>
