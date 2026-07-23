<script setup lang="ts">
defineProps<{
  src: string
  alt?: string
  portrait?: boolean
}>()
</script>

<template>
  <NuxtImg
    :src="src"
    :alt="alt"
    :class="[portrait ? 'aspect-[2/3] object-contain' : 'aspect-video object-cover', 'w-full rounded-lg']"
    :width="portrait ? 200 : 320"
    :height="portrait ? 300 : 180"
    sizes="288px"
  />
</template>
