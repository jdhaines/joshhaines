<script setup lang="ts">
// Compact navigational strip -- these are wayfinding to the four content
// categories, not primary homepage content, so they stay small and light
// rather than full cards. Colors mirror each category's badge color from
// app/utils/content-type.ts so the strip previews the same color-coding used
// throughout the site.
const categories = [
  {
    label: 'Books',
    description: 'Reviews and reading lists',
    icon: 'i-lucide-book-open',
    to: '/books',
    color: 'text-secondary',
  },
  {
    label: 'Podcasts',
    description: 'Conversations and interviews',
    icon: 'i-lucide-headphones',
    to: '/podcasts',
    color: 'text-success',
  },
  {
    label: 'Talks',
    description: 'Keynotes and slides',
    icon: 'i-lucide-presentation',
    to: '/talks',
    color: 'text-warning',
  },
  {
    label: 'Writing',
    description: 'Essays and ideas',
    icon: 'i-lucide-file-text',
    to: '/writing',
    color: 'text-primary',
  },
]
</script>

<template>
  <nav aria-labelledby="home-explore-heading">
    <HomeSectionEyebrow id="home-explore-heading" label="Explore" />

    <div class="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
      <NuxtLink
        v-for="category in categories"
        :key="category.to"
        :to="category.to"
        class="group flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2"
      >
        <UIcon
          :name="category.icon"
          :class="[category.color, 'size-5 shrink-0 transition-transform group-hover:translate-x-0.5']"
        />
        <span>
          <span class="block font-serif text-base font-semibold text-highlighted">
            {{ category.label }}
          </span>
          <span class="block text-sm text-muted">
            {{ category.description }}
          </span>
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>
