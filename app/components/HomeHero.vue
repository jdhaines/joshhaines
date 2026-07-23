<script setup lang="ts">
defineProps<{
  latestPostPath?: string
}>()
</script>

<template>
  <UPageHero
orientation="vertical"
    :ui="{ container: 'text-left items-start', title: 'text-left', description: 'text-left max-w-2xl' }">
    <template #title>
      <p class="mb-3 text-sm font-semibold tracking-wide text-primary uppercase">
        Hi, I'm Josh Haines
      </p>
      <span class="block">Engineering Better Systems.</span>
      <span class="block">Building Stronger Teams.</span>
    </template>

    <template #description>
      I lead engineering and platform teams at the intersection of people,
      process, and technology. I write about leadership, technology,
      productivity, and the journey of building awesome products.
    </template>

    <template #links>
      <UButton v-if="latestPostPath" :to="latestPostPath" icon="i-lucide-file-text" size="lg">
        Read Latest Post
      </UButton>
      <UButton
to="/writing/behind-the-product-podcast" icon="i-lucide-headphones" variant="outline" color="neutral"
        size="lg">
        Listen to the Podcast
      </UButton>
    </template>
  </UPageHero>
</template>
