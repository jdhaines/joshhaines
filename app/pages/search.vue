<script setup lang="ts">
import type { PublishedPostSummary } from '~/composables/usePublishedPosts'

// Lets any piece of body content link a name/topic straight to matching
// results, e.g. mentioning a book's author in a review body:
// `[Bren\u00e9 Brown](/search?q=Bren%C3%A9%20Brown)`. Reuses the exact same
// client-side full-text search (plus the "book author mentioned" boost)
// that powers the command-palette search, so this page never needs its own
// separate index -- see `usePublishedPosts.ts`.
const route = useRoute()
const router = useRouter()

const queryText = ref(String(route.query.q ?? ''))

const { data: publishedPosts } = usePublishedPosts()
const publishedByPath = computed(() => new Map((publishedPosts.value ?? []).map(post => [post.path, post])))

const { status, search, init } = useSearchCollection('posts', {
  immediate: false,
})

const results = ref<PublishedPostSummary[]>([])
const hasSearched = ref(false)

async function runSearch(query: string) {
  const trimmed = query.trim()
  if (!trimmed) {
    results.value = []
    hasSearched.value = false
    return
  }

  hasSearched.value = true
  if (status.value === 'idle') {
    await init()
  }

  const fullTextResults = await search(trimmed, { limit: 60 })
  const authorMatches = (publishedPosts.value ?? []).filter(post => matchesBookAuthor(post, trimmed))

  const orderedPaths: string[] = []
  const seenPaths = new Set<string>()
  function addPath(path: string) {
    if (!seenPaths.has(path) && publishedByPath.value.has(path)) {
      seenPaths.add(path)
      orderedPaths.push(path)
    }
  }

  for (const post of authorMatches) addPath(post.path)
  for (const result of fullTextResults) addPath(result.id.split('#')[0] ?? result.id)

  results.value = orderedPaths.map(path => publishedByPath.value.get(path)!).filter(Boolean)
}

watch(() => route.query.q, (q) => {
  queryText.value = String(q ?? '')
  runSearch(queryText.value)
}, { immediate: true })

function onSubmit() {
  router.replace({ query: { ...route.query, q: queryText.value || undefined } })
}

// Search results are dynamic (client-side only) and shouldn't be indexed as
// their own pages, but should still be followable so link-shared search
// URLs work.
useSeoMeta({
  title: () => queryText.value ? `Search: ${queryText.value}` : 'Search',
  robots: 'noindex, follow',
})
</script>

<template>
  <UContainer class="py-12">
    <h1 class="mb-8 text-3xl font-bold">
      Search
    </h1>

    <form class="mb-10 flex gap-3" @submit.prevent="onSubmit">
      <UInput v-model="queryText" icon="i-lucide-search" size="lg"
        placeholder="Search articles, talks, podcasts, and books..." class="flex-1" />
      <UButton type="submit" size="lg">
        Search
      </UButton>
    </form>

    <p v-if="!hasSearched" class="text-muted">
      Enter a search term above to see matching articles, talks, podcasts, book reviews, or other content.
    </p>
    <p v-else-if="status === 'loading' && !results.length" class="text-muted">
      Searching...
    </p>
    <p v-else-if="!results.length" class="text-muted">
      No results for "{{ queryText }}".
    </p>

    <UBlogPosts v-else>
      <UBlogPost v-for="post in results" :key="post.path" :to="post.path"
        :title="post.bookAuthor ? `${post.title} (${post.bookAuthor})` : post.title" :description="post.description"
        :date="post.publishedAt" :badge="getContentTypeBadge(post.contentType)" />
    </UBlogPosts>
  </UContainer>
</template>
