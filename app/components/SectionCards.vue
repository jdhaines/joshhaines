<script setup lang="ts">
const sections = [
  {
    title: 'Writing',
    description: 'Thoughts on leadership, engineering, productivity, and more.',
    icon: 'i-lucide-file-text',
    to: '/writing',
  },
  {
    title: 'About',
    description: 'My story, experience, and what drives me forward.',
    icon: 'i-lucide-user',
    to: '/about',
  },
]
</script>

<template>
  <UPageGrid class="sm:grid-cols-2">
    <UPageCard
      v-for="section in sections"
      :key="section.to"
      v-bind="section"
      spotlight
    />
  </UPageGrid>
</template>
