import { describe, expect, it } from "vitest"
import { getYouTubeVideoId } from "../app/utils/youtube"

const videoId = "dQw4w9WgXcQ"

describe("getYouTubeVideoId", () => {
  it.each([
    videoId,
    `https://www.youtube.com/shorts/${videoId}`,
    `https://youtube.com/watch?v=${videoId}`,
    `https://youtu.be/${videoId}?feature=shared`,
    `https://www.youtube-nocookie.com/embed/${videoId}`,
    `youtube.com/live/${videoId}`,
  ])("extracts a video ID from %s", (value) => {
    expect(getYouTubeVideoId(value)).toBe(videoId)
  })

  it.each([
    "",
    "not-a-valid-video-id",
    "https://example.com/shorts/dQw4w9WgXcQ",
    "https://youtube.com/shorts/too-short",
    "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
  ])("rejects invalid input %s", (value) => {
    expect(getYouTubeVideoId(value)).toBeNull()
  })
})
