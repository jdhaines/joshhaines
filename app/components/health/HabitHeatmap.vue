<script setup lang="ts">
import type { HabitEntry } from "~/utils/habits"
import { toDateKey } from "~/utils/habits"

const props = withDefaults(
  defineProps<{
    entries: HabitEntry[]
    year: number
    goal?: number
  }>(),
  {
    goal: 3,
  }
)

interface CalendarDay {
  dateKey: string
  entry?: HabitEntry
  inYear: boolean
  isFuture: boolean
}

const todayKey = toLocalDateKey(new Date())
const selectedDay = ref<CalendarDay | null>(null)

const entryByDate = computed(
  () => new Map(props.entries.map((entry) => [entry.dateKey, entry]))
)

const calendar = computed(() => {
  const firstDay = new Date(Date.UTC(props.year, 0, 1))
  const lastDay = new Date(Date.UTC(props.year, 11, 31))
  const gridStart = new Date(firstDay)
  const gridEnd = new Date(lastDay)

  gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay())
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()))

  const days: CalendarDay[] = []
  const cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    const dateKey = toDateKey(cursor)
    days.push({
      dateKey,
      entry: entryByDate.value.get(dateKey),
      inYear: cursor.getUTCFullYear() === props.year,
      isFuture: dateKey > todayKey,
    })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  const weekCount = days.length / 7
  const months = Array.from({ length: 12 }, (_, month) => {
    const monthDate = new Date(Date.UTC(props.year, month, 1))
    const dayOffset = Math.round(
      (monthDate.getTime() - gridStart.getTime()) / 86_400_000
    )

    return {
      label: monthDate.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      column: Math.floor(dayOffset / 7) + 1,
    }
  })

  return { days, months, weekCount }
})

const calendarGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${calendar.value.weekCount}, 0.875rem)`,
}))

function cellClass(day: CalendarDay) {
  if (!day.inYear) return "invisible"
  if (!day.entry) {
    return day.isFuture
      ? "cursor-default bg-accented/45 opacity-50"
      : "bg-accented hover:ring-1 hover:ring-muted"
  }

  return day.entry.weekCount >= props.goal
    ? "bg-primary shadow-sm shadow-primary/20 hover:ring-2 hover:ring-primary/40"
    : "bg-secondary shadow-sm shadow-secondary/20 hover:ring-2 hover:ring-secondary/40"
}

function dayLabel(day: CalendarDay) {
  const date = formatDate(day.dateKey)
  if (!day.entry) return `${date}: no activity logged`
  return `${date}: ${day.entry.note}`
}
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-4">
    <div
      class="hidden items-center justify-center text-5xl font-light tracking-[0.12em] text-toned select-none sm:flex"
      aria-hidden="true"
    >
      <span class="vertical-year">{{ year }}</span>
    </div>

    <div
      class="overflow-x-auto rounded-2xl border border-primary/30 bg-muted/60 px-4 py-5 shadow-sm sm:px-5"
    >
      <div class="w-max min-w-full">
        <div class="mb-2 ml-6 grid gap-[3px]" :style="calendarGridStyle">
          <span
            v-for="month in calendar.months"
            :key="month.label"
            class="text-xs font-semibold text-toned"
            :style="{ gridColumnStart: month.column }"
          >
            {{ month.label }}
          </span>
        </div>

        <div class="flex gap-2">
          <div
            class="grid grid-rows-7 gap-[3px] text-[0.65rem] leading-[0.875rem] font-medium text-muted select-none"
            aria-hidden="true"
          >
            <span v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day">
              {{ day }}
            </span>
          </div>

          <div
            class="grid grid-flow-col grid-rows-7 gap-[3px]"
            :style="calendarGridStyle"
          >
            <button
              v-for="day in calendar.days"
              :key="day.dateKey"
              type="button"
              class="size-3.5 rounded-[3px] outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default motion-reduce:transition-none"
              :class="cellClass(day)"
              :aria-label="dayLabel(day)"
              :title="dayLabel(day)"
              :disabled="!day.inYear || day.isFuture"
              @mouseenter="selectedDay = day"
              @focus="selectedDay = day"
              @click="selectedDay = day"
            />
          </div>
        </div>

        <div
          class="mt-4 flex min-w-[48rem] flex-wrap items-start justify-between gap-3 text-xs text-muted"
        >
          <div>
            <p class="font-semibold">Goal: {{ goal }} days per week</p>
            <div class="mt-1 min-h-10" aria-live="polite">
              <template v-if="selectedDay">
                <p class="font-medium text-highlighted">
                  {{ formatDate(selectedDay.dateKey) }}
                </p>
                <p class="max-w-xl whitespace-pre-line">
                  {{ selectedDay.entry?.note ?? "No activity logged." }}
                </p>
              </template>
              <p v-else>Hover over or select a day to see its activity.</p>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-0.5" aria-label="Activity legend">
            <span>No activity</span>
            <span class="size-3 rounded-[3px] bg-accented" />
            <span>1–{{ goal - 1 }}</span>
            <span class="size-3 rounded-[3px] bg-secondary" />
            <span>{{ goal }}+</span>
            <span class="size-3 rounded-[3px] bg-primary" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vertical-year {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
</style>
