<script setup lang="ts">
const links = [
  { label: "Home", to: "/" },
  { label: "Books", to: "/books" },
  { label: "Podcasts", to: "/podcasts" },
  { label: "Talks", to: "/talks" },
  { label: "Writing", to: "/writing" },
  { label: "About", to: "/about" },
]
</script>

<template>
  <UHeader>
    <template #title>
      <NuxtLink to="/" class="flex items-center gap-2 font-serif text-xl font-semibold">
        <img src="~/assets/images/logo.svg" alt="Josh Haines logo" class="h-8 w-auto" />
        <span
          ><span class="text-secondary">Josh</span>
          <span class="text-primary">Haines</span></span
        >
      </NuxtLink>
    </template>

    <UNavigationMenu :items="links" />

    <template #right>
      <UContentSearchButton />
      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="links" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
