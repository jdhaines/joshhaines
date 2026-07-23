<script setup lang="ts">
import type { PostsCollectionItem, AuthorsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  page: PostsCollectionItem
  author?: AuthorsCollectionItem | null
  runtimeLabel: string
}>()

const contentTypeBadge = computed(() => getContentTypeBadge(props.page.contentType))

function formatDate(date?: Date | string) {
  if (!date) return undefined
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <header class="mb-12">
    <div class="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
      <UBadge
        variant="subtle"
        :color="contentTypeBadge.color"
        size="lg"
      >
        {{ contentTypeBadge.label }}
      </UBadge>
      <span>·</span>
      <time :datetime="new Date(page.publishedAt).toISOString()">
        {{ formatDate(page.publishedAt) }}
      </time>
      <template v-if="page.updatedAt">
        <span>·</span>
        <span>Updated {{ formatDate(page.updatedAt) }}</span>
      </template>
      <span>·</span>
      <span>{{ runtimeLabel }}</span>
    </div>

    <h1 class="mb-4 font-serif text-4xl font-bold text-balance sm:text-5xl">
      {{ page.title }}
    </h1>

    <p
      v-if="page.description"
      class="mb-8 max-w-prose text-lg text-muted"
    >
      {{ page.description }}
    </p>

    <div class="flex flex-wrap items-center justify-between gap-4 border-y border-default py-6">
      <NuxtLink
        v-if="author"
        :to="`/authors/${author.path?.split('/').pop()}`"
        class="flex items-center gap-3"
      >
        <UAvatar
          :src="author.avatar"
          :alt="author.name"
          size="md"
        />
        <div class="leading-tight">
          <p class="font-medium">
            {{ author.name }}
          </p>
          <p
            v-if="author.occupation"
            class="text-sm text-muted"
          >
            {{ author.occupation }}<template v-if="author.company">
              , {{ author.company }}
            </template>
          </p>
        </div>
      </NuxtLink>

      <div
        v-if="page.tags?.length"
        class="flex flex-wrap gap-2"
      >
        <UBadge
          v-for="tag in page.tags"
          :key="tag"
          variant="soft"
          color="neutral"
          size="md"
        >
          {{ tag }}
        </UBadge>
      </div>
    </div>
  </header>
</template>
