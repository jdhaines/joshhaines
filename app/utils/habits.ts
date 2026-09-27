export interface HabitEntry {
  dateKey: string
  note: string
  weekKey: string
  weekCount: number
}

interface ParsedHabitEntry {
  dateKey: string
  note: string
  weekKey: string
}

const SHEET_DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseSheetDateKey(value: unknown): string | null {
  if (typeof value !== "string") return null

  const match = value.trim().match(SHEET_DATE_PATTERN)
  if (!match) return null

  const [, monthValue, dayValue, yearValue] = match
  const month = Number(monthValue)
  const day = Number(dayValue)
  const year = Number(yearValue)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return toDateKey(date)
}

export function parseHabitRows(rows: unknown[][]): HabitEntry[] {
  const entriesByDate = new Map<string, ParsedHabitEntry>()

  for (const row of rows) {
    const dateKey = parseSheetDateKey(row[0])
    const note = typeof row[2] === "string" ? row[2].trim() : ""

    if (!dateKey || !note) continue

    const existing = entriesByDate.get(dateKey)
    entriesByDate.set(dateKey, {
      dateKey,
      note: existing ? `${existing.note}\n${note}` : note,
      weekKey: startOfWeekKey(dateKey),
    })
  }

  const weekCounts = new Map<string, number>()
  for (const entry of entriesByDate.values()) {
    weekCounts.set(entry.weekKey, (weekCounts.get(entry.weekKey) ?? 0) + 1)
  }

  return [...entriesByDate.values()]
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map((entry) => ({
      ...entry,
      weekCount: weekCounts.get(entry.weekKey) ?? 0,
    }))
}

export function startOfWeekKey(dateKey: string): string {
  const date = fromDateKey(dateKey)
  date.setUTCDate(date.getUTCDate() - date.getUTCDay())
  return toDateKey(date)
}

export function toLocalDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

export function fromDateKey(dateKey: string): Date {
  const match = dateKey.match(DATE_KEY_PATTERN)
  if (!match) throw new Error(`Invalid date key: ${dateKey}`)

  const [, year, month, day] = match
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
}

export function toDateKey(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-")
}
