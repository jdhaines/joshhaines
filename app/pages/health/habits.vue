<script setup lang="ts">
import { parseHabitRows, startOfWeekKey, toLocalDateKey } from "~/utils/habits"

definePageMeta({
  layout: "health",
})

const year = new Date().getFullYear()
const todayKey = toLocalDateKey(new Date())
const currentWeekKey = startOfWeekKey(todayKey)

const { data: rows, status, error, refresh } = useGoogleSheetValues("'data'!A:C")
const entries = computed(() => parseHabitRows(rows.value))
const thisWeekCount = computed(
  () => entries.value.filter((entry) => entry.weekKey === currentWeekKey).length
)

useSeoMeta({
  title: "Habits | Health | Josh Haines",
  description: "Josh Haines's personal activity tracker.",
})
</script>

<template>
  <main>
    <div class="mb-8 flex flex-wrap items-end gap-4">
      <h1 class="font-serif text-3xl font-semibold sm:text-4xl">Activity Tracker</h1>
      <div
        class="rounded-md border border-primary/40 bg-muted px-3 py-1.5 text-sm text-toned"
      >
        This week:
        <span class="font-semibold text-primary">{{ thisWeekCount }}</span>
        <span class="text-dimmed">/3</span>
      </div>
    </div>

    <div v-if="status === 'pending'" aria-label="Loading activity tracker">
      <USkeleton class="h-72 w-full rounded-2xl" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      title="Could not load habit data from Google Sheets."
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

    <HealthHabitHeatmap v-else :entries="entries" :year="year" />
  </main>
</template>
