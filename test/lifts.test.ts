import { describe, expect, it } from "vitest"
import { parseLiftRows } from "../app/utils/lifts"

const headers = [
  "Date",
  "Deadlift",
  "Low-Bar Squat",
  "Overhead Press",
  "Bench Press",
  "Snatch",
  "Clean & Jerk",
]

describe("parseLiftRows", () => {
  it("parses and sorts lift records while preserving missing values", () => {
    expect(
      parseLiftRows([
        headers,
        ["3/20/2026", "340.00", "280.00", "160.00", "225.00"],
        ["10/14/2011", "207.00", "140.00", "105.00", "172.00"],
        ["3/17/2024", "390.00", "320.00", "185.00", "255.00", "185", "215"],
      ])
    ).toEqual([
      {
        dateKey: "2011-10-14",
        values: {
          Deadlift: 207,
          "Low-Bar Squat": 140,
          "Overhead Press": 105,
          "Bench Press": 172,
        },
      },
      {
        dateKey: "2024-03-17",
        values: {
          Deadlift: 390,
          "Low-Bar Squat": 320,
          "Overhead Press": 185,
          "Bench Press": 255,
          Snatch: 185,
          "Clean & Jerk": 215,
        },
      },
      {
        dateKey: "2026-03-20",
        values: {
          Deadlift: 340,
          "Low-Bar Squat": 280,
          "Overhead Press": 160,
          "Bench Press": 225,
        },
      },
    ])
  })

  it("ignores invalid rows and nonpositive lift values", () => {
    expect(
      parseLiftRows([
        headers,
        ["Date", "Deadlift"],
        ["1/1/2026", "", "not a number", "0", "-5"],
      ])
    ).toEqual([])
  })

  it("returns no records when the expected headers are absent", () => {
    expect(
      parseLiftRows([
        ["When", "Exercise"],
        ["1/1/2026", "225"],
      ])
    ).toEqual([])
  })
})
