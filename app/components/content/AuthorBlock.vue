<script setup lang="ts">
import type { AuthorsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  author: AuthorsCollectionItem
}>()

const socialLinks = computed(() => {
  return [
    props.author.linkedin && { icon: 'i-simple-icons-linkedin', to: props.author.linkedin, label: 'LinkedIn' },
    props.author.github && { icon: 'i-simple-icons-github', to: props.author.github, label: 'GitHub' },
    props.author.discord && { icon: 'i-simple-icons-discord', to: props.author.discord, label: 'Discord' },
    props.author.email && { icon: 'i-lucide-mail', to: `mailto:${props.author.email}`, label: 'Email' },
  ].filter(Boolean) as { icon: string, to: string, label: string }[]
})
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border border-default bg-elevated p-6 sm:flex-row sm:items-start">
    <UAvatar
      :src="author.avatar"
      :alt="author.name"
      size="3xl"
      class="shrink-0"
    />
    <div>
      <p class="font-serif text-lg font-semibold">
        {{ author.name }}
      </p>
      <p
        v-if="author.occupation"
        class="mb-2 text-sm text-muted"
      >
        {{ author.occupation }}<template v-if="author.company">
          , {{ author.company }}
        </template>
      </p>
      <ContentRenderer
        :value="author"
        class="prose prose-sm max-w-none dark:prose-invert"
      />
      <div
        v-if="socialLinks.length"
        class="mt-3 flex gap-3"
      >
        <UButton
          v-for="link in socialLinks"
          :key="link.label"
          :to="link.to"
          :icon="link.icon"
          :aria-label="link.label"
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
          color="neutral"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>
