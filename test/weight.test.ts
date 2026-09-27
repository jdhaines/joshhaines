import { describe, expect, it } from "vitest"
import { formatWeight, parseWeightRows } from "../app/utils/weight"

describe("parseWeightRows", () => {
  it("parses, sorts, and preserves decimal weights", () => {
    expect(
      parseWeightRows([
        ["Date", "Weight (lbs)"],
        ["4/22/2026", "258.90"],
        ["1/1/2009", "275.00"],
        ["4/19/2026", 261],
      ])
    ).toEqual([
      { dateKey: "2009-01-01", weight: 275 },
      { dateKey: "2026-04-19", weight: 261 },
      { dateKey: "2026-04-22", weight: 258.9 },
    ])
  })

  it("ignores headers, empty values, invalid numbers, and nonpositive weights", () => {
    expect(
      parseWeightRows([
        ["Date", "Weight (lbs)"],
        ["4/19/2026", ""],
        ["4/20/2026", "not a number"],
        ["4/21/2026", "0"],
        ["bad date", "250.00"],
      ])
    ).toEqual([])
  })

  it("uses the last value when a date occurs more than once", () => {
    expect(
      parseWeightRows([
        ["4/19/2026", "261.00"],
        ["4/19/2026", "260.50"],
      ])
    ).toEqual([{ dateKey: "2026-04-19", weight: 260.5 }])
  })
})

describe("formatWeight", () => {
  it("always displays two decimal places", () => {
    expect(formatWeight(265)).toBe("265.00 lbs")
    expect(formatWeight(214.5)).toBe("214.50 lbs")
  })
})
