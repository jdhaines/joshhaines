<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const { data: posts } = await useAsyncData("tags-index-posts", () => {
  return queryCollection("posts")
    .where("draft", "=", false)
    .select(
      "path",
      "title",
      "description",
      "publishedAt",
      "contentType",
      "bookAuthor",
      "image",
      "imageAlt",
      "socialImage",
      "tags"
    )
    .all()
})

// Alphabetical tag -> post count, used both to render the cloud and to size
// each tag's text relative to how often it's used.
const tagCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const post of posts.value ?? []) {
    for (const tag of post.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag))
})

const maxCount = computed(() =>
  tagCounts.value.reduce((max, { count }) => Math.max(max, count), 1)
)

// Five size (and weight) steps from the least- to most-used tag, so the
// cloud reads as a cloud (old-school tag-cloud UX) rather than a flat list.
// Counts skew hard toward a handful of dominant tags (e.g. every book
// review carries "book-shelf"), so steps are bucketed on a log scale --
// a linear scale squashes almost every other tag into the smallest bucket.
const TAG_SIZE_CLASSES = [
  "text-xs",
  "text-sm",
  "text-lg",
  "text-2xl",
  "text-4xl",
] as const
const TAG_WEIGHT_CLASSES = [
  "font-normal",
  "font-normal",
  "font-medium",
  "font-semibold",
  "font-bold",
] as const

function tagStep(count: number) {
  if (maxCount.value <= 1) return 2
  const ratio = Math.log(count) / Math.log(maxCount.value)
  const step = Math.round(ratio * (TAG_SIZE_CLASSES.length - 1))
  return Math.min(TAG_SIZE_CLASSES.length - 1, Math.max(0, step))
}

function tagSizeClass(count: number) {
  const step = tagStep(count)
  return `${TAG_SIZE_CLASSES[step]} ${TAG_WEIGHT_CLASSES[step]}`
}

const cloudQuery = ref("")

const filteredTagCounts = computed(() => {
  const query = cloudQuery.value.trim().toLowerCase()
  if (!query) return tagCounts.value
  return tagCounts.value.filter(({ tag }) => tag.toLowerCase().includes(query))
})

const selectedTag = computed(() => {
  const tag = route.query.tag
  return typeof tag === "string" && tag ? tag : undefined
})

const taggedPosts = computed(() => {
  if (!selectedTag.value) return []
  return (posts.value ?? [])
    .filter((post) => post.tags?.includes(selectedTag.value!))
    .sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
})

function selectTag(tag: string) {
  router.push({ query: { ...route.query, tag } })
}

function clearTag() {
  const query = { ...route.query }
  delete query.tag
  router.push({ query })
}

const canonicalUrl = new URL("/tags", useSiteUrl()).toString()
const description = "Browse every topic Josh has written, talked, or podcasted about."

useSeoMeta({
  title: () => (selectedTag.value ? `Tag: ${selectedTag.value}` : "Tags"),
  description,
  ogTitle: "Tags",
  ogDescription: description,
  ogUrl: canonicalUrl,
  ogType: "website",
  // A selected tag is a filtered view of the same content, not a distinct
  // page worth indexing on its own -- same treatment as `/search?q=...`.
  robots: () => (selectedTag.value ? "noindex, follow" : "index, follow"),
})

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
})
</script>

<template>
  <UContainer class="py-12">
    <h1 class="mb-3 text-3xl font-bold">Tags</h1>
    <p class="mb-8 max-w-2xl text-muted">
      Browse every topic across articles, talks, podcasts, and book reviews. Click a tag
      to see everything tagged with it.
    </p>

    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput
        v-model="cloudQuery"
        icon="i-lucide-search"
        placeholder="Filter tags..."
        class="sm:max-w-xs"
        aria-label="Filter tags"
      />
      <UButton to="/search" variant="link" color="neutral" icon="i-lucide-arrow-right">
        Search Everything
      </UButton>
    </div>

    <p v-if="!filteredTagCounts.length" class="py-6 text-muted">
      No tags match "{{ cloudQuery }}".
    </p>

    <div v-else class="flex flex-wrap items-baseline gap-x-4 gap-y-3">
      <button
        v-for="{ tag, count } in filteredTagCounts"
        :key="tag"
        type="button"
        :class="[
          tagSizeClass(count),
          tag === selectedTag
            ? 'font-semibold text-primary'
            : 'text-muted hover:text-primary',
        ]"
        class="cursor-pointer leading-none transition-colors"
        @click="selectTag(tag)"
      >
        {{ tag }}
        <span class="text-xs text-dimmed">({{ count }})</span>
      </button>
    </div>

    <section v-if="selectedTag" class="mt-14 border-t border-default pt-10">
      <div class="mb-6 flex items-center justify-between gap-4">
        <h2 class="flex items-center gap-2 text-xl font-semibold">
          Tagged <span class="text-muted">({{ taggedPosts.length }})</span>
          <UBadge variant="subtle" color="primary" size="lg">{{ selectedTag }}</UBadge>
        </h2>
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-x"
          @click="clearTag"
        >
          Clear
        </UButton>
      </div>

      <p v-if="!taggedPosts.length" class="text-muted">
        Nothing is tagged "{{ selectedTag }}" yet.
      </p>

      <UBlogPosts v-else>
        <UBlogPost
          v-for="post in taggedPosts"
          :key="post.path"
          :to="post.path"
          :title="post.bookAuthor ? `${post.title} (${post.bookAuthor})` : post.title"
          :description="post.description"
          :date="post.publishedAt"
          :badge="getContentTypeBadge(post.contentType)"
          :image="getPostCardImage(post)"
        />
      </UBlogPosts>
    </section>
  </UContainer>
</template>
