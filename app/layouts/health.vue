<script setup lang="ts">
const route = useRoute()

const healthSections = [
  { label: "Weight", path: "/health/weight", available: true },
  { label: "Habits", path: "/health/habits", available: true },
  { label: "Lifts", path: "/health/lifts", available: true },
]

useSeoMeta({
  robots: "noindex, nofollow",
})

useHead({
  meta: [{ name: "googlebot", content: "noindex, nofollow" }],
})
</script>

<template>
  <UContainer class="max-w-7xl py-8 sm:py-12">
    <nav aria-label="Health sections" class="mb-8 border-b border-default">
      <ul class="flex gap-1">
        <li v-for="section in healthSections" :key="section.path">
          <NuxtLink
            v-if="section.available"
            :to="section.path"
            class="-mb-px block border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none"
            :class="
              route.path === section.path
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-highlighted'
            "
          >
            {{ section.label }}
          </NuxtLink>
          <span
            v-else
            class="block cursor-not-allowed px-4 py-3 text-sm font-medium text-dimmed"
            aria-disabled="true"
            :title="`${section.label} is coming later`"
          >
            {{ section.label }}
          </span>
        </li>
      </ul>
    </nav>

    <slot />
  </UContainer>
</template>
