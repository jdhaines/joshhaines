const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

export function getYouTubeVideoId(value: string): string | null {
  const candidate = value.trim()

  if (YOUTUBE_VIDEO_ID_PATTERN.test(candidate)) {
    return candidate
  }

  try {
    const url = new URL(
      candidate.startsWith("http://") || candidate.startsWith("https://")
        ? candidate
        : `https://${candidate}`
    )
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "")

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0]
      return id && YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : null
    }

    const isYouTubeHost =
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com") ||
      hostname === "youtube-nocookie.com" ||
      hostname.endsWith(".youtube-nocookie.com")

    if (!isYouTubeHost) {
      return null
    }

    const pathParts = url.pathname.split("/").filter(Boolean)
    const pathId = ["shorts", "embed", "live"].includes(pathParts[0] ?? "")
      ? pathParts[1]
      : undefined
    const id = pathId ?? url.searchParams.get("v")

    return id && YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : null
  } catch {
    return null
  }
}
