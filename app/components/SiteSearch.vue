<script setup lang="ts">
const { data: publishedPosts } = usePublishedPosts()

const publishedPaths = computed(
  () => new Set(publishedPosts.value?.map((post) => post.path) ?? [])
)

const { status, search, init } = useSearchCollection("posts", {
  immediate: false,
})

type SearchOptions = Parameters<typeof search>[1]
type SearchResults = Awaited<ReturnType<typeof search>>

const { open } = useContentSearch()
const router = useRouter()

// The command palette auto-highlights the first result as you type, so a
// bare Enter press would silently jump to whatever happens to be on top.
// Track whether the user has explicitly moved the highlight with the arrow
// keys; if not, Enter should submit the typed query to the full search page
// instead of selecting the auto-highlighted item.
const searchTerm = ref("")
const hasNavigated = ref(false)

watch(searchTerm, () => {
  hasNavigated.value = false
})

watch(open, (isOpen) => {
  if (!isOpen) {
    hasNavigated.value = false
  }
})

function goToFullSearch() {
  const query = searchTerm.value.trim()
  if (!query) return
  open.value = false
  router.push({ path: "/search", query: { q: query } })
}

// UContentSearch teleports its dialog content to <body>, so a listener bound
// via a template attribute (which Vue would attach to the modal's own root)
// never sees keydown events dispatched inside the teleported content. A
// document-level capture listener runs before Reka UI's own Enter handler
// regardless of where the DOM node ends up, so it can safely intercept.
function onDocumentKeydown(event: KeyboardEvent) {
  if (!open.value) return
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    hasNavigated.value = true
    return
  }
  if (event.key === "Enter" && !hasNavigated.value) {
    event.preventDefault()
    event.stopImmediatePropagation()
    goToFullSearch()
  }
}

onMounted(() => {
  document.addEventListener("keydown", onDocumentKeydown, true)
})

onUnmounted(() => {
  document.removeEventListener("keydown", onDocumentKeydown, true)
})

const links = [
  {
    label: "Books",
    description: "Josh's rank-ordered Book Shelf",
    icon: "i-lucide-book-open",
    to: "/books",
  },
  {
    label: "Podcasts",
    description: "Conversations and interviews",
    icon: "i-lucide-headphones",
    to: "/podcasts",
  },
  {
    label: "Talks",
    description: "Keynotes and slides",
    icon: "i-lucide-presentation",
    to: "/talks",
  },
  {
    label: "Writing",
    description: "Essays and ideas",
    icon: "i-lucide-file-text",
    to: "/writing",
  },
  {
    label: "About",
    description: "About Josh Haines",
    icon: "i-lucide-user",
    to: "/about",
  },
  {
    label: "Full search page",
    description: "Browse results on a dedicated, shareable page",
    icon: "i-lucide-external-link",
    to: "/search",
  },
]

watch(open, async (isOpen) => {
  if (isOpen && status.value === "idle") {
    await init()
  }
})

async function searchPublishedPosts(
  query: string,
  options?: SearchOptions
): Promise<SearchResults> {
  const limit = options?.limit ?? 12
  const fullTextResults = await search(query, {
    ...options,
    // Request a larger pool before removing draft results so the palette can
    // still fill its visible result limit.
    limit: limit * 3,
  })

  const authorResults = (publishedPosts.value ?? [])
    .filter((post) => matchesBookAuthor(post, query))
    .map((post) => ({
      collection: "posts",
      id: post.path,
      title: post.title,
      titles: [],
      level: 1,
      content: `Book author: ${formatBookAuthors(post.bookAuthor)}`,
      rank: Number.NEGATIVE_INFINITY,
    }))

  const tagResults = (publishedPosts.value ?? [])
    .filter((post) => matchesTag(post, query))
    .map((post) => ({
      collection: "posts",
      id: post.path,
      title: post.title,
      titles: [],
      level: 1,
      content: `Tags: ${post.tags?.join(", ")}`,
      rank: Number.NEGATIVE_INFINITY,
    }))

  const resultsById = new Map<string, SearchResults[number]>()

  for (const result of authorResults) {
    resultsById.set(result.id, result)
  }

  for (const result of tagResults) {
    resultsById.set(result.id, result)
  }

  for (const result of fullTextResults) {
    if (publishedPaths.value.has(result.id.split("#")[0] ?? result.id)) {
      resultsById.set(result.id, result)
    }
  }

  return [...resultsById.values()].slice(0, limit)
}
</script>

<template>
  <UContentSearch
    v-model:search-term="searchTerm"
    :links="links"
    :search="searchPublishedPosts"
    :search-status="status"
    title="Search JoshHaines.com"
    description="Find articles, talks, podcasts, and book reviews."
    placeholder="Search articles, talks, podcasts, and books..."
    :color-mode="false"
  />
</template>
