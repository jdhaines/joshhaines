<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error?.statusCode ?? 404)

useSeoMeta({
  title: 'Page not found',
  description: 'This page doesn\'t exist, or it moved and nobody told the intern.',
})

// Nuxt keeps the error state around until it's explicitly cleared, so
// navigating away from this page uses `clearError` (with its own redirect)
// rather than a plain link -- otherwise the app can get stuck thinking
// there's still an active error after the user leaves.
function goTo(path: string) {
  return clearError({ redirect: path })
}
</script>

<template>
  <UApp>
    <SiteHeader />

    <UContainer class="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <div class="mb-6 flex items-center gap-3">
        <span class="h-px w-8 shrink-0 bg-primary" aria-hidden="true" />
        <span class="font-mono text-sm font-bold tracking-[0.2em] text-highlighted uppercase">
          {{ statusCode }}
        </span>
        <span class="h-px w-8 shrink-0 bg-primary" aria-hidden="true" />
      </div>

      <h1 class="mb-4 font-serif text-4xl font-bold text-balance sm:text-5xl">
        This page wandered off.
      </h1>

      <p class="mb-8 max-w-prose text-lg text-muted">
        We've checked everywhere and there's no sign of it. Josh definitely
        didn't break a link, so we've sent the intern to go dig through the
        server logs and figure out what happened. In the meantime, here are
        a few places that are still exactly where they should be.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <UButton icon="i-lucide-home" size="lg" @click="goTo('/')">
          Back to the homepage
        </UButton>
        <UButton icon="i-lucide-file-text" variant="outline" color="neutral" size="lg" @click="goTo('/books')">
          Go see the bookshelf
        </UButton>
      </div>
    </UContainer>

    <SiteFooter />
  </UApp>
</template>
