<script setup lang="ts">
import { parseWeightRows } from "~/utils/weight"

definePageMeta({
  layout: "health",
})

const { data: rows, status, error, refresh } = useGoogleSheetValues("'data'!A:B")
const points = computed(() => parseWeightRows(rows.value))

useSeoMeta({
  title: "Weight | Health | Josh Haines",
  description: "Josh Haines's personal weight history.",
})
</script>

<template>
  <main>
    <div class="mb-8">
      <h1 class="font-serif text-3xl font-semibold sm:text-4xl">Weight Tracker</h1>
      <p class="mt-2 text-muted">
        {{
          points.length ? `${points.length.toLocaleString()} recorded weigh-ins` : ""
        }}
      </p>
    </div>

    <div v-if="status === 'pending'" aria-label="Loading weight tracker">
      <USkeleton class="h-[38rem] w-full rounded-2xl" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      title="Could not load weight data from Google Sheets."
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
      v-else-if="!points.length"
      color="neutral"
      variant="subtle"
      title="No weight entries were found."
    />

    <HealthWeightChart v-else :points="points" />
  </main>
</template>
