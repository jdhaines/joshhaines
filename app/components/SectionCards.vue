<script setup lang="ts">
const sections = [
  {
    title: 'Writing',
    description: 'Thoughts on leadership, engineering, productivity, and more.',
    icon: 'i-lucide-file-text',
    to: '/writing',
  },
  {
    title: 'Talks',
    description: 'Conference talks, keynotes, and the slides that go with them.',
    icon: 'i-lucide-presentation',
    to: '/talks',
  },
  {
    title: 'Podcasts',
    description: 'Episodes and appearances on engineering and leadership shows.',
    icon: 'i-lucide-headphones',
    to: '/podcasts',
  },
  {
    title: 'Book Reviews',
    description: 'Notes and takeaways from books on leadership and software.',
    icon: 'i-lucide-book-open',
    to: '/books',
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
  <UPageGrid class="sm:grid-cols-2 lg:grid-cols-3">
    <UPageCard
      v-for="section in sections"
      :key="section.to"
      v-bind="section"
      spotlight
    />
  </UPageGrid>
</template>
