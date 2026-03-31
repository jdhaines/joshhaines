'use client'

import { useEffect, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import useGoogleSheets from 'use-google-sheets'

type SheetRow = {
  Date?: string
  'Weight (lbs)'?: string | number
}

type WeightPoint = [number, number]

export default function ChartPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    check()

    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  const { data, loading, error } = useGoogleSheets({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
    sheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '',
    sheetsOptions: [{ id: 'data' }],
  })

  const weightPoints = useMemo<WeightPoint[]>(() => {
    const rows = (data?.[0]?.data ?? []) as SheetRow[]

    return rows
      .map((row) => {
        const rawDate = row.Date?.toString().trim()
        const rawWeight = row['Weight (lbs)']

        if (!rawDate || rawWeight == null || rawWeight === '') return null

        const date = parseSheetDate(rawDate)
        const weight = Number.parseFloat(String(rawWeight))

        if (!date || Number.isNaN(weight)) return null

        return [date.getTime(), weight] as WeightPoint
      })
      .filter((point): point is WeightPoint => point !== null)
      .sort((a, b) => a[0] - b[0])
  }, [data])

  const chartOption = useMemo(() => {
    const bg = isDark ? '#020c1b' : '#e5e7eb'
    const panel = isDark ? '#0b1220' : '#f8fafc'
    const text = isDark ? '#e5e7eb' : '#111827'
    const muted = isDark ? '#94a3b8' : '#6b7280'
    const grid = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(107, 114, 128, 0.18)'
    const axisLine = isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(107, 114, 128, 0.35)'
    const accent = '#07A6E2'

    return {
      backgroundColor: bg,
      animation: false,
      grid: {
        left: 48,
        right: 18,
        top: 32,
        bottom: 90,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? 'rgba(11, 18, 32, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(107, 114, 128, 0.2)',
        borderWidth: 1,
        textStyle: {
          color: text,
        },
        formatter: (params: any) => {
          const point = Array.isArray(params) ? params[0] : params
          const date = new Date(point.value[0])
          const weight = point.value[1]

          return `
            <div style="font-weight:600;margin-bottom:6px;">
              ${formatDate(date)}
            </div>
            <div>
              Weight: <span style="font-weight:600;">${weight.toFixed(2)} lbs</span>
            </div>
          `
        },
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          color: muted,
        },
        axisLine: {
          lineStyle: {
            color: axisLine,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: grid,
          },
        },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: {
          color: muted,
          formatter: (value: number) => `${value}`,
        },
        axisLine: {
          lineStyle: {
            color: axisLine,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: grid,
          },
        },
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'none',
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          height: 34,
          bottom: 26,
          borderColor: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(107, 114, 128, 0.18)',
          backgroundColor: panel,
          fillerColor: isDark ? 'rgba(7, 166, 226, 0.18)' : 'rgba(7, 166, 226, 0.12)',
          dataBackground: {
            lineStyle: { color: accent, opacity: 0.9 },
            areaStyle: { color: isDark ? 'rgba(7, 166, 226, 0.18)' : 'rgba(7, 166, 226, 0.1)', opacity: 0.08 },
          },
          textStyle: {
            color: muted,
          },
          handleStyle: {
            color: isDark ? '#dbeafe' : '#ffffff',
            borderColor: accent,
          },
          moveHandleStyle: {
            color: accent,
            opacity: 0.9,
          },
        },
      ],
      series: [
        {
          name: 'Weight (lbs)',
          type: 'line',
          data: weightPoints,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 6,
          smooth: true,
          connectNulls: false,
          lineStyle: {
            width: 2,
            color: accent,
          },
          itemStyle: {
            color: accent,
          },
          emphasis: {
            focus: 'series',
            scale: true,
            itemStyle: {
              borderColor: isDark ? '#ffffff' : '#111827',
              borderWidth: 1,
            },
          },
          areaStyle: {
            opacity: 0,
          },
        },
      ],
    }
  }, [isDark, weightPoints])

  if (loading) {
    return <div className="text-sm text-zinc-500 dark:text-zinc-300">Loading...</div>
  }

  if (error) {
    return <div className="text-sm text-red-600 dark:text-red-300">Failed to load sheet data.</div>
  }

  return (
    <div className="rounded-xl border border-cyan-900/40 bg-zinc-200 dark:bg-[#020c1b]">
      <ReactECharts
        option={chartOption}
        style={{ width: '100%', height: '800px' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  )
}

function parseSheetDate(value: string): Date | null {
  const parts = value.split('/')
  if (parts.length !== 3) return null

  const month = Number(parts[0])
  const day = Number(parts[1])
  const year = Number(parts[2])

  if (!month || !day || !year) return null

  const date = new Date(year, month - 1, day)
  date.setHours(12, 0, 0, 0)
  return date
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
