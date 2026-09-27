import { parseSheetDateKey } from "./habits"

export interface WeightPoint {
  dateKey: string
  weight: number
}

export function parseWeightRows(rows: unknown[][]): WeightPoint[] {
  const pointsByDate = new Map<string, WeightPoint>()

  for (const row of rows) {
    const dateKey = parseSheetDateKey(row[0])
    const rawWeight =
      typeof row[1] === "number"
        ? row[1]
        : typeof row[1] === "string"
          ? Number(row[1].replaceAll(",", "").trim())
          : Number.NaN

    if (!dateKey || !Number.isFinite(rawWeight) || rawWeight <= 0) continue

    pointsByDate.set(dateKey, {
      dateKey,
      weight: rawWeight,
    })
  }

  return [...pointsByDate.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey))
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(2)} lbs`
}
