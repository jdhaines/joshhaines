<script setup lang="ts">
const links = [
  { label: 'Writing', to: '/writing' },
  { label: 'Talks', to: '/talks' },
  { label: 'Podcasts', to: '/podcasts' },
  { label: 'Books', to: '/books' },
  { label: 'About', to: '/about' },
]

const socialLinks = [
  { icon: 'i-simple-icons-x', to: 'https://x.com/joshhaines', label: 'X' },
  { icon: 'i-simple-icons-linkedin', to: 'https://www.linkedin.com/in/JoshuaHaines', label: 'LinkedIn' },
  { icon: 'i-simple-icons-github', to: 'https://github.com/jdhaines', label: 'GitHub' },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-default">
    <UContainer class="flex flex-col items-center gap-6 py-12 text-center">
      <div>
        <h2 class="font-serif text-2xl font-semibold">
          Let's build something worth writing about.
        </h2>
        <p class="mt-2 text-muted">
          Get in touch if you'd like to talk engineering leadership, platform transformation, or the next post.
        </p>
      </div>

      <UButton
        to="mailto:Josh@JoshHaines.com"
        color="primary"
        size="lg"
      >
        Say hello
      </UButton>

      <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="hover:text-default"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <div class="flex gap-3">
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

      <p class="text-xs text-muted">
        © {{ year }} Josh Haines. All rights reserved.
      </p>
    </UContainer>
  </footer>
</template>
