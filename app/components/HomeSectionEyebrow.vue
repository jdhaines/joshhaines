<script setup lang="ts">
// Shared "eyebrow" heading treatment for homepage editorial sections
// (Explore, Featured, Latest, Start Here, Bookshelf, media features) so the
// section labels read as confident section dividers rather than faint
// metadata text, without turning into a heavy/gaudy banner.
defineProps<{
  id?: string
  label: string
}>()
</script>

<template>
  <div class="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <div class="flex items-center gap-3">
      <span class="h-px w-8 shrink-0 bg-primary" aria-hidden="true" />
      <h2
        :id="id"
        class="text-sm font-bold tracking-[0.2em] text-highlighted uppercase"
      >
        {{ label }}
      </h2>
    </div>
    <slot name="action" />
  </div>
</template>
