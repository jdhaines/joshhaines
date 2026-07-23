<script setup lang="ts">
defineProps<{
  src: string
  alt?: string
}>()
</script>

<template>
  <NuxtImg
    :src="src"
    :alt="alt"
    class="aspect-video w-full rounded-lg object-cover"
    width="320"
    height="180"
    sizes="288px"
  />
</template>
