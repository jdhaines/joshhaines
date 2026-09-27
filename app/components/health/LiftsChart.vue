<script setup lang="ts">
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts"
import type { LiftName, LiftRecord } from "~/utils/lifts"
import { liftNames } from "~/utils/lifts"
import { formatWeight } from "~/utils/weight"

const props = defineProps<{
  records: LiftRecord[]
}>()

const liftColors: Record<LiftName, string> = {
  Deadlift: "#25b3e9",
  "Low-Bar Squat": "#ff6747",
  "Overhead Press": "#a78bfa",
  "Bench Press": "#34d399",
  Snatch: "#fbbf24",
  "Clean & Jerk": "#f472b6",
}

const colorMode = useColorMode()
const chartContainer = useTemplateRef("chartContainer")
const selectedRecord = ref<LiftRecord | null>(props.records.at(-1) ?? null)
const hiddenLifts = ref<LiftName[]>([])
const isReady = ref(false)

let chart: IChartApi | null = null
let resizeObserver: ResizeObserver | null = null
const seriesByLift = new Map<LiftName, ISeriesApi<"Line">>()

const recordByDate = computed(
  () => new Map(props.records.map((record) => [record.dateKey, record]))
)

function chartColors() {
  const isDark = colorMode.value === "dark"

  return {
    text: isDark ? "#94a3b8" : "#475569",
    grid: isDark ? "rgba(148, 163, 184, 0.13)" : "rgba(71, 85, 105, 0.13)",
    border: isDark ? "rgba(148, 163, 184, 0.28)" : "rgba(71, 85, 105, 0.28)",
  }
}

function applyColors() {
  if (!chart) return
  const colors = chartColors()

  chart.applyOptions({
    layout: {
      background: { color: "transparent" },
      textColor: colors.text,
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { color: colors.grid },
    },
    rightPriceScale: { borderColor: colors.border },
    timeScale: { borderColor: colors.border },
  })
}

function toggleLift(lift: LiftName) {
  const isHidden = hiddenLifts.value.includes(lift)
  hiddenLifts.value = isHidden
    ? hiddenLifts.value.filter((name) => name !== lift)
    : [...hiddenLifts.value, lift]
  seriesByLift.get(lift)?.applyOptions({ visible: isHidden })
}

function crosshairDateKey(time: Time): string | null {
  if (typeof time === "string") return time
  if (typeof time === "number") return new Date(time * 1000).toISOString().slice(0, 10)

  return [
    time.year,
    String(time.month).padStart(2, "0"),
    String(time.day).padStart(2, "0"),
  ].join("-")
}

onMounted(async () => {
  if (!chartContainer.value || !props.records.length) return

  const { ColorType, CrosshairMode, LineSeries, LineType, createChart } =
    await import("lightweight-charts")
  const colors = chartColors()

  chart = createChart(chartContainer.value, {
    autoSize: true,
    height: 600,
    layout: {
      background: { type: ColorType.Solid, color: "transparent" },
      textColor: colors.text,
      fontFamily: "IBM Plex Sans, system-ui, sans-serif",
      attributionLogo: false,
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { color: colors.grid },
    },
    crosshair: { mode: CrosshairMode.Normal },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: false,
    },
    handleScale: {
      axisDoubleClickReset: true,
      axisPressedMouseMove: true,
      mouseWheel: true,
      pinch: true,
    },
    rightPriceScale: {
      borderColor: colors.border,
      scaleMargins: { top: 0.08, bottom: 0.08 },
    },
    timeScale: {
      borderColor: colors.border,
      minBarSpacing: 1,
      rightOffset: 2,
    },
    localization: {
      priceFormatter: (value: number) => value.toFixed(2),
    },
  })

  for (const lift of liftNames) {
    const liftSeries = chart.addSeries(LineSeries, {
      color: liftColors[lift],
      crosshairMarkerBackgroundColor: liftColors[lift],
      crosshairMarkerBorderColor: colorMode.value === "dark" ? "#ffffff" : "#060b14",
      crosshairMarkerRadius: 4,
      lineType: LineType.Curved,
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    })
    liftSeries.setData(
      props.records.flatMap((record) => {
        const value = record.values[lift]
        return value === undefined ? [] : [{ time: record.dateKey, value }]
      })
    )
    seriesByLift.set(lift, liftSeries)
  }

  chart.timeScale().fitContent()
  chart.subscribeCrosshairMove((event) => {
    if (!event.time) return
    const dateKey = crosshairDateKey(event.time)
    selectedRecord.value = dateKey ? (recordByDate.value.get(dateKey) ?? null) : null
  })

  resizeObserver = new ResizeObserver(() => {
    chart?.applyOptions({ width: chartContainer.value?.clientWidth })
  })
  resizeObserver.observe(chartContainer.value)
  isReady.value = true
})

watch(() => colorMode.value, applyColors)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart?.remove()
  chart = null
  seriesByLift.clear()
})
</script>

<template>
  <section
    aria-label="Major lifts history chart"
    class="rounded-2xl border border-primary/30 bg-muted/60 p-3 shadow-sm sm:p-5"
  >
    <div class="mb-2 overflow-x-auto pb-2">
      <div
        class="flex w-max min-w-full flex-nowrap items-center gap-4"
        aria-label="Lift series"
      >
        <button
          v-for="lift in liftNames"
          :key="lift"
          type="button"
          class="flex shrink-0 items-center gap-1.5 rounded-sm py-1 text-xs font-medium text-toned transition hover:text-highlighted focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none"
          :class="{ 'opacity-40': hiddenLifts.includes(lift) }"
          :aria-pressed="!hiddenLifts.includes(lift)"
          :disabled="!isReady"
          @click="toggleLift(lift)"
        >
          <span
            class="size-2.5 rounded-full"
            :style="{ backgroundColor: liftColors[lift] }"
            aria-hidden="true"
          />
          {{ lift }}
        </button>
      </div>
    </div>

    <div
      ref="chartContainer"
      data-testid="lifts-chart"
      class="h-[34rem] w-full sm:h-[37.5rem]"
    />

    <div class="mt-3 min-h-14 text-xs" aria-live="polite">
      <template v-if="selectedRecord">
        <p class="font-semibold text-highlighted">
          {{ formatDate(selectedRecord.dateKey) }}
        </p>
        <dl class="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <template v-for="lift in liftNames" :key="lift">
            <div v-if="selectedRecord.values[lift] !== undefined">
              <dt class="sr-only">{{ lift }}</dt>
              <dd class="font-mono" :style="{ color: liftColors[lift] }">
                {{ lift }}: {{ formatWeight(selectedRecord.values[lift]!) }}
              </dd>
            </div>
          </template>
        </dl>
      </template>
    </div>

    <p class="text-xs text-muted">
      Toggle a lift above. Drag to pan; scroll or pinch to zoom.
    </p>
  </section>
</template>
