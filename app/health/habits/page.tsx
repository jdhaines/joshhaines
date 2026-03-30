'use client'

import React, { useMemo, useState } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import useGoogleSheets from 'use-google-sheets'

type SheetRow = {
  Date?: string
  'Activity Tracking'?: string
}

type HeatmapValue = {
  date: Date
  key: string
  count: number
  note: string
  weekKey: string
  weekCount: number
}

export default function HabitsPage() {
  const [active, setActive] = useState<HeatmapValue | null>(null)

  const { data, loading, error } = useGoogleSheets({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
    sheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '',
    sheetsOptions: [{ id: 'data' }],
  })

  const { values, startDate, endDate, thisWeekCount, yearLabel } = useMemo(() => {
    const rows = (data?.[0]?.data ?? []) as SheetRow[]

    const parsedBase = rows
      .map((row) => {
        const rawDate = row.Date?.toString().trim()
        const note = row['Activity Tracking']?.toString().trim() ?? ''

        if (!rawDate || !note) return null

        const date = parseSheetDate(rawDate)
        if (!date) return null

        const weekStart = startOfWeekSunday(date)

        return {
          date,
          key: toLocalDateKey(date),
          count: 1,
          note,
          weekKey: toLocalDateKey(weekStart),
        }
      })
      .filter(
        (
          v
        ): v is {
          date: Date
          key: string
          count: number
          note: string
          weekKey: string
        } => v !== null
      )
      .sort((a, b) => a.key.localeCompare(b.key))

    const weekCounts = new Map<string, number>()
    for (const item of parsedBase) {
      weekCounts.set(item.weekKey, (weekCounts.get(item.weekKey) ?? 0) + 1)
    }

    const parsed: HeatmapValue[] = parsedBase.map((item) => ({
      ...item,
      weekCount: weekCounts.get(item.weekKey) ?? 0,
    }))

    const today = new Date()
    const currentYear = today.getFullYear()

    const startDate = new Date(currentYear, 0, 1)
    const endDate = new Date(currentYear, 11, 31)

    const thisWeekKey = toLocalDateKey(startOfWeekSunday(today))
    const thisWeekCount = weekCounts.get(thisWeekKey) ?? 0

    return {
      values: parsed,
      startDate,
      endDate,
      thisWeekCount,
      yearLabel: String(currentYear),
    }
  }, [data])

  if (loading) {
    return <div className="px-4 pt-4 text-sm text-zinc-300">Loading...</div>
  }

  if (error) {
    return <div className="px-4 pt-4 text-sm text-red-300">Failed to load sheet data.</div>
  }

  return (
    <div className="min-h-screen px-4 pt-4"
      onClick={() => setActive(null)}
    >
      <div className="mb-8 mt-2 flex items-center gap-4">
        <h1 className="text-4xl font-light tracking-tight text-zinc-700 dark:text-zinc-200">Activity Tracker</h1>
        <div className="rounded-md border border-cyan-500/40 bg-slate-950/70 px-3 py-1 text-sm text-zinc-300 shadow-[0_0_0_1px_rgba(8,145,178,0.08)] mt-2">
          This week: <span className="font-semibold text-cyan-400">{thisWeekCount}</span>
          <span className="text-zinc-500">/3</span>
        </div>
      </div>

      <div className="habit-shell">
        <div className="habit-side">
          <div className="habit-year text-zinc-700 dark:text-zinc-200">{yearLabel}</div>
        </div>
        <div className="habit-card"
        >
          <div className="habit-days">
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>
          <div className="habit-heatmap">
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={values}
              showWeekdayLabels={false}
              classForValue={(value) => {
                if (!value) return 'color-empty'
                if (value.weekCount >= 3) return 'color-goal'
                return 'color-under'
              }}
              titleForValue={(value) => {
                if (!value) return ''
                return `${formatDate(value.date)}\n\n${value.note}`
              }}
              transformDayElement={(element, value) => {
                if (!value) return element

                const monthStart = value.date.getDate() === 1
                const classes = monthStart ? 'month-start' : ''

                return React.cloneElement(element, {
                  key: value.key,
                  className: `${element.props.className ?? ''} ${classes}`.trim(),
                  onClick: (e: React.MouseEvent<SVGRectElement>) => {
                    e.stopPropagation()
                    setActive(value)
                  },
                  children: (
                    <title>{`${formatDate(value.date)}\n\n${value.note}`}</title>
                  ),
                })
              }}
            />
          </div>

          <div className="habit-footer">
            <div className="font-semibold">Goal: 3 days per week</div>

            <div className="habit-legend">
              <span>0–2</span>
              <span className="legend-box legend-under" />
              <span>3+</span>
              <span className="legend-box legend-goal" />
            </div>
          </div>
          {active && (
            <div className="habit-tooltip">
              <div className="habit-tooltip-date">
                {formatDate(active.date)}
              </div>

              <div className="habit-tooltip-note">
                {active.note}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .habit-shell {
          --cell: 10px;
          --gap: 4px;
          display: grid;
          grid-template-columns: 62px 1fr;
          gap: 12px;
          align-items: start;
        }

        .habit-side {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100%
        }
        .habit-year {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 4rem;
          line-height: 1;
          font-weight: 300;
          letter-spacing: 0.08em;
          margin-bottom: 18px;
          user-select: none;
        }

        .habit-days {
          position: absolute;
          left: 8px;
          top: 41px;
          height: calc((7 * var(--cell)) + (6 * var(--gap)) + 20px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          font-weight: 500;
          line-height: 1;
          color: rgba(161, 161, 170, 0.84);
          user-select: none;
          pointer-events: none;
        }

        .habit-card {
          position: relative;
          overflow-x: auto;
          border-radius: 18px;
          border: 1px solid rgba(8, 145, 178, 0.35);
          background: linear-gradient(180deg, rgba(2, 12, 27, 0.92), rgba(3, 19, 43, 0.96));
          padding: 18px 20px 14px 22px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.03),
            0 10px 40px rgba(0, 0, 0, 0.35);
        }

        .habit-heatmap {
          min-width: 860px;
          padding-left: 18px;
        }

        .habit-heatmap .react-calendar-heatmap {
          width: 100%;
        }

        .habit-heatmap .react-calendar-heatmap text {
          fill: rgba(212, 212, 216, 0.82);
          font-size: 11px;
          font-weight: 500;
        }

        .habit-heatmap .react-calendar-heatmap .month-label {
          fill: rgba(228, 228, 231, 0.88);
          font-size: 12px;
          font-weight: 600;
        }

        .habit-heatmap .react-calendar-heatmap rect {
          width: var(--cell);
          height: var(--cell);
          rx: 2.5;
          ry: 2.5;
          shape-rendering: geometricPrecision;
          transition:
            fill 120ms ease,
            stroke 120ms ease,
            filter 120ms ease;
        }

        .habit-heatmap .react-calendar-heatmap .color-empty {
          fill: rgba(148, 163, 184, 0.22);
          stroke: rgba(125, 211, 252, 0.08);
          stroke-width: 1;
        }

        .habit-heatmap .react-calendar-heatmap .color-under {
          fill: #ff5b2e;
          stroke: rgba(255, 255, 255, 0.16);
          stroke-width: 1;
          filter: drop-shadow(0 0 4px rgba(255, 91, 46, 0.18));
        }

        .habit-heatmap .react-calendar-heatmap .color-goal {
          fill: #1fb6ea;
          stroke: rgba(255, 255, 255, 0.18);
          stroke-width: 1;
          filter: drop-shadow(0 0 4px rgba(31, 182, 234, 0.2));
        }

        .habit-heatmap .react-calendar-heatmap rect:hover {
          stroke: rgba(255, 255, 255, 0.9);
          stroke-width: 1;
          filter: brightness(1.06);
        }

        .habit-heatmap .react-calendar-heatmap g.month-start rect {
          stroke-width: 1.35;
        }

        .habit-heatmap .react-calendar-heatmap g.month-start .color-empty {
          stroke: rgba(255, 255, 255, 0.18);
        }

        .habit-heatmap .react-calendar-heatmap g.month-start .color-under {
          stroke: rgba(255, 255, 255, 0.34);
        }

        .habit-heatmap .react-calendar-heatmap g.month-start .color-goal {
          stroke: rgba(255, 255, 255, 0.34);
        }

        .habit-footer {
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: rgba(161, 161, 170, 0.92);
        }

        .habit-legend {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-box {
          display: inline-block;
          width: 11px;
          height: 11px;
          border-radius: 3px;
        }

        .legend-empty {
          background: rgba(148, 163, 184, 0.25);
          border: 1px solid rgba(125, 211, 252, 0.1);
        }

        .legend-under {
          background: #ff5b2e;
          box-shadow: 0 0 6px rgba(255, 91, 46, 0.18);
        }

        .legend-goal {
          background: #1fb6ea;
          box-shadow: 0 0 6px rgba(31, 182, 234, 0.2);
        }

        @media (max-width: 900px) {
          .habit-shell {
            grid-template-columns: 60px 1fr;
            gap: 8px;
          }

          .habit-side {
            padding-top: 24px;
          }

          .habit-year {
            font-size: 2.8rem;
            margin-bottom: 14px;
          }

          .habit-days {
            font-size: 10px;
          }

          .habit-card {
            padding: 16px 14px 12px;
          }
        }

        .habit-tooltip {
          position: absolute;
          left: 50%;
          bottom: 12px;
          transform: translateX(-50%);
          max-width: 260px;

          background: rgba(10, 18, 32, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 8px;

          padding: 10px 12px;
          font-size: 13px;
          color: #e5e7eb;

          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(6px);

          z-index: 10;
        }

        .habit-tooltip-date {
          font-weight: 600;
          margin-bottom: 6px;
          color: #f9fafb;
        }

        .habit-tooltip-note {
          color: #d1d5db;
          line-height: 1.4;
        }
      `}</style>
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

function toLocalDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}


function startOfWeekSunday(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}
