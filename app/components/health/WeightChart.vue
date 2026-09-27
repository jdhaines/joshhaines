<script setup lang="ts">
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts"
import type { WeightPoint } from "~/utils/weight"
import { formatWeight } from "~/utils/weight"

const props = defineProps<{
  points: WeightPoint[]
}>()

type RangeKey = "3M" | "6M" | "1Y" | "5Y" | "ALL"

const ranges: { label: string; value: RangeKey; months?: number }[] = [
  { label: "3M", value: "3M", months: 3 },
  { label: "6M", value: "6M", months: 6 },
  { label: "1Y", value: "1Y", months: 12 },
  { label: "5Y", value: "5Y", months: 60 },
  { label: "All", value: "ALL" },
]

const colorMode = useColorMode()
const chartContainer = useTemplateRef("chartContainer")
const selectedPoint = ref<WeightPoint | null>(props.points.at(-1) ?? null)
const activeRange = ref<RangeKey>("1Y")
const isReady = ref(false)

let chart: IChartApi | null = null
let series: ISeriesApi<"Line"> | null = null
let resizeObserver: ResizeObserver | null = null

const pointByDate = computed(
  () => new Map(props.points.map((point) => [point.dateKey, point]))
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
      vertLines: { color: colors.grid },
      horzLines: { color: colors.grid },
    },
    rightPriceScale: { borderColor: colors.border },
    timeScale: { borderColor: colors.border },
  })
}

function selectRange(range: RangeKey) {
  if (!chart || !props.points.length) return

  activeRange.value = range
  const rangeConfig = ranges.find((candidate) => candidate.value === range)
  const lastPoint = props.points.at(-1)
  if (!lastPoint) return

  if (!rangeConfig?.months) {
    chart.timeScale().fitContent()
    return
  }

  const cutoff = new Date(`${lastPoint.dateKey}T00:00:00Z`)
  cutoff.setUTCMonth(cutoff.getUTCMonth() - rangeConfig.months)

  chart.timeScale().setVisibleRange({
    from: cutoff.toISOString().slice(0, 10),
    to: lastPoint.dateKey,
  })
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
  if (!chartContainer.value || !props.points.length) return

  const { ColorType, CrosshairMode, LineSeries, LineType, createChart } =
    await import("lightweight-charts")
  const colors = chartColors()

  chart = createChart(chartContainer.value, {
    autoSize: true,
    height: 560,
    layout: {
      background: { type: ColorType.Solid, color: "transparent" },
      textColor: colors.text,
      fontFamily: "IBM Plex Sans, system-ui, sans-serif",
      attributionLogo: false,
    },
    grid: {
      vertLines: { color: colors.grid },
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
      scaleMargins: { top: 0.12, bottom: 0.12 },
    },
    timeScale: {
      borderColor: colors.border,
      minBarSpacing: 0.5,
      rightOffset: 2,
      timeVisible: false,
    },
    localization: {
      priceFormatter: (value: number) => value.toFixed(2),
    },
  })

  series = chart.addSeries(LineSeries, {
    color: "#25b3e9",
    crosshairMarkerBackgroundColor: "#25b3e9",
    crosshairMarkerBorderColor: colorMode.value === "dark" ? "#ffffff" : "#060b14",
    crosshairMarkerRadius: 5,
    lineType: LineType.Curved,
    lineWidth: 2,
    priceFormat: {
      type: "price",
      precision: 2,
      minMove: 0.01,
    },
  })
  series.setData(
    props.points.map((point) => ({
      time: point.dateKey,
      value: point.weight,
    }))
  )

  chart.subscribeCrosshairMove((event) => {
    if (!event.time) return
    const dateKey = crosshairDateKey(event.time)
    selectedPoint.value = dateKey ? (pointByDate.value.get(dateKey) ?? null) : null
  })

  resizeObserver = new ResizeObserver(() => {
    chart?.applyOptions({ width: chartContainer.value?.clientWidth })
  })
  resizeObserver.observe(chartContainer.value)

  isReady.value = true
  selectRange(activeRange.value)
})

watch(() => colorMode.value, applyColors)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart?.remove()
  chart = null
  series = null
})
</script>

<template>
  <section
    aria-label="Weight history chart"
    class="rounded-2xl border border-primary/30 bg-muted/60 p-3 shadow-sm sm:p-5"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="min-h-12" aria-live="polite">
        <p v-if="selectedPoint" class="font-mono text-2xl font-semibold text-primary">
          {{ formatWeight(selectedPoint.weight) }}
        </p>
        <p v-if="selectedPoint" class="text-sm text-muted">
          {{ formatDate(selectedPoint.dateKey) }}
        </p>
      </div>

      <div class="flex items-center gap-1" aria-label="Visible date range">
        <UButton
          v-for="range in ranges"
          :key="range.value"
          size="xs"
          color="neutral"
          :variant="activeRange === range.value ? 'solid' : 'ghost'"
          :aria-pressed="activeRange === range.value"
          :disabled="!isReady"
          @click="selectRange(range.value)"
        >
          {{ range.label }}
        </UButton>
      </div>
    </div>

    <div
      ref="chartContainer"
      data-testid="weight-chart"
      class="h-[32rem] w-full sm:h-[35rem]"
    />

    <p class="mt-3 text-xs text-muted">
      Drag to move through time. Scroll or pinch to zoom. Hover or tap for an exact
      reading.
    </p>
  </section>
</template>
