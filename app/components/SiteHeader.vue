<script setup lang="ts">
const links = [
  { label: 'Home', to: '/' },
  { label: 'Writing', to: '/writing' },
  { label: 'Talks', to: '/talks' },
  { label: 'Podcasts', to: '/podcasts' },
  { label: 'About', to: '/about' },
]
</script>

<template>
  <UHeader>
    <template #title>
      <NuxtLink
        to="/"
        class="flex items-center gap-2 font-serif text-lg font-semibold"
      >
        <img
          src="~/assets/images/logo.svg"
          alt="Josh Haines logo"
          class="h-6 w-auto"
        >
        <span>JoshHaines<span class="text-primary">.com</span></span>
      </NuxtLink>
    </template>

    <UNavigationMenu :items="links" />

    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>
</template>
