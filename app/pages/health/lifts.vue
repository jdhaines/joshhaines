<script setup lang="ts">
import { parseLiftRows } from "~/utils/lifts"

definePageMeta({
  layout: "health",
})

const { data: rows, status, error, refresh } = useGoogleSheetValues("'lifts'!A:G")
const records = computed(() => parseLiftRows(rows.value))

useSeoMeta({
  title: "Lifts | Health | Josh Haines",
  description: "Josh Haines's major lift history.",
})
</script>

<template>
  <main>
    <div class="mb-8">
      <h1 class="font-serif text-3xl font-semibold sm:text-4xl">1RM for Major Lifts</h1>
      <p class="mt-2 text-muted">
        {{ records.length ? `${records.length} recorded checkpoints` : "" }}
      </p>
    </div>

    <div v-if="status === 'pending'" aria-label="Loading lifts tracker">
      <USkeleton class="h-[40rem] w-full rounded-2xl" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      title="Could not load lift data from Google Sheets."
      description="Check the Google Sheets API configuration and try again."
      :actions="[
        {
          label: 'Try again',
          color: 'error',
          variant: 'soft',
          onClick: () => refresh(),
        },
      ]"
    />

    <UAlert
      v-else-if="!records.length"
      color="neutral"
      variant="subtle"
      title="No lift entries were found."
    />

    <HealthLiftsChart v-else :records="records" />
  </main>
</template>
