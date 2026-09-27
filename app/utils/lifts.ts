import { parseSheetDateKey } from "./habits"

export const liftNames = [
  "Deadlift",
  "Low-Bar Squat",
  "Overhead Press",
  "Bench Press",
  "Snatch",
  "Clean & Jerk",
] as const

export type LiftName = (typeof liftNames)[number]

export interface LiftRecord {
  dateKey: string
  values: Partial<Record<LiftName, number>>
}

export function parseLiftRows(rows: unknown[][]): LiftRecord[] {
  const headers = rows[0] ?? []
  const dateColumn = headers.findIndex((header) => header === "Date")
  const liftColumns = liftNames.map((name) => ({
    name,
    column: headers.findIndex((header) => header === name),
  }))

  if (dateColumn < 0 || liftColumns.every(({ column }) => column < 0)) return []

  const recordsByDate = new Map<string, LiftRecord>()

  for (const row of rows.slice(1)) {
    const dateKey = parseSheetDateKey(row[dateColumn])
    if (!dateKey) continue

    const values: Partial<Record<LiftName, number>> = {}
    for (const { name, column } of liftColumns) {
      if (column < 0) continue

      const rawValue = row[column]
      const value =
        typeof rawValue === "number"
          ? rawValue
          : typeof rawValue === "string" && rawValue.trim()
            ? Number(rawValue.replaceAll(",", "").trim())
            : Number.NaN

      if (Number.isFinite(value) && value > 0) values[name] = value
    }

    if (Object.keys(values).length) {
      recordsByDate.set(dateKey, { dateKey, values })
    }
  }

  return [...recordsByDate.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey))
}
