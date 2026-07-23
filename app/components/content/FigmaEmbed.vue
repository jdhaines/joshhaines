<script setup lang="ts">
// Figma slide deck embed used in the TechPoint keynote write-up. Reacts to
// the current color mode so the embedded frame matches light/dark theme,
// mirroring the legacy site's next-themes-based FigmaEmbed component.
const colorMode = useColorMode()

const theme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'))

const src = computed(
  () =>
    `https://embed.figma.com/slides/jahZYSSGvIcVakkqcfdzNx/TechPoint-Keynote--Public-?node-id=1-42&embed-host=share&theme=${theme.value}`,
)
</script>

<template>
  <div class="my-8 aspect-video w-full overflow-hidden rounded-lg bg-elevated">
    <ClientOnly>
      <iframe
        :key="theme"
        title="TechPoint Keynote presentation"
        :src="src"
        class="h-full w-full border border-default"
        allow="fullscreen"
        loading="lazy"
      />
      <template #fallback>
        <div class="h-full w-full animate-pulse bg-elevated" />
      </template>
    </ClientOnly>
  </div>
</template>
