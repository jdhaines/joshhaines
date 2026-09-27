import { describe, expect, it } from "vitest"
import { parseHabitRows, parseSheetDateKey, startOfWeekKey } from "../app/utils/habits"

describe("parseSheetDateKey", () => {
  it("normalizes valid Google Sheets dates", () => {
    expect(parseSheetDateKey("4/15/2026")).toBe("2026-04-15")
    expect(parseSheetDateKey(" 12/1/2025 ")).toBe("2025-12-01")
  })

  it.each(["Date", "", "2/29/2025", "13/1/2026", "2026-04-15"])(
    "rejects invalid sheet date %s",
    (value) => {
      expect(parseSheetDateKey(value)).toBeNull()
    }
  )
})

describe("startOfWeekKey", () => {
  it("uses Sunday as the start of the week", () => {
    expect(startOfWeekKey("2026-04-15")).toBe("2026-04-12")
    expect(startOfWeekKey("2026-04-12")).toBe("2026-04-12")
  })
})

describe("parseHabitRows", () => {
  it("counts distinct non-empty activity days by week", () => {
    const entries = parseHabitRows([
      ["Date", "Weight (lbs)", "Activity Tracking"],
      ["4/12/2026", "", "Sunday walk"],
      ["4/13/2026", "", "Lift"],
      ["4/14/2026", "", ""],
      ["4/15/2026", "", "Ruck"],
      ["4/19/2026", "", "Lift"],
    ])

    expect(entries).toEqual([
      {
        dateKey: "2026-04-12",
        note: "Sunday walk",
        weekKey: "2026-04-12",
        weekCount: 3,
      },
      {
        dateKey: "2026-04-13",
        note: "Lift",
        weekKey: "2026-04-12",
        weekCount: 3,
      },
      {
        dateKey: "2026-04-15",
        note: "Ruck",
        weekKey: "2026-04-12",
        weekCount: 3,
      },
      {
        dateKey: "2026-04-19",
        note: "Lift",
        weekKey: "2026-04-19",
        weekCount: 1,
      },
    ])
  })

  it("counts duplicate dates once and preserves both comments", () => {
    const entries = parseHabitRows([
      ["4/15/2026", "", "Lift"],
      ["4/15/2026", "", "Walk"],
    ])

    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({
      dateKey: "2026-04-15",
      note: "Lift\nWalk",
      weekCount: 1,
    })
  })
})
