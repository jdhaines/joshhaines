import { legacyRedirects } from "../utils/legacy-redirects"

export default defineEventHandler((event) => {
  const target = legacyRedirects[event.path]

  if (target) {
    return sendRedirect(event, target, 301)
  }
})
