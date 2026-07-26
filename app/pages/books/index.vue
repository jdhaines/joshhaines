<script setup lang="ts">
const { data: shelf } = await useAsyncData('book-shelf-data', () => {
  return queryCollection('bookShelf').first()
})

const { data: posts } = await useAsyncData('book-shelf-posts', () => {
  return queryCollection('posts')
    .where('draft', '=', false)
    .where('contentType', '=', 'bookReview')
    .all()
})

const { ranked, mentions } = computed(() => buildBookShelf(shelf.value, posts.value ?? [])).value

const sort = ref<BookShelfSort>('rank')
const sortDirection = ref<BookShelfSortDirection>('asc')
const view = ref<BookShelfView>('list')
const query = ref('')

const filteredRanked = computed(() => sortBooks(searchBooks(ranked, query.value), sort.value, sortDirection.value))
const filteredMentions = computed(() => searchBooks(mentions, query.value).sort((a, b) => a.post.title.localeCompare(b.post.title)))

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

const canonicalUrl = new URL('/books', useSiteUrl()).toString()
const description = 'Every book I\u2019ve read and reviewed, ranked from most useful to least useful.'

useSeoMeta({
  title: 'Book Shelf',
  description,
  ogTitle: 'Book Shelf',
  ogDescription: description,
  ogUrl: canonicalUrl,
  ogType: 'website',
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>

<template>
  <UContainer class="py-12">
    <header class="mb-10 max-w-2xl">
      <h1 class="mb-3 font-serif text-4xl font-bold">
        Book Shelf
      </h1>
      <p class="text-lg text-muted">
        In order of <strong>most useful</strong> to <strong>least useful</strong>. Switch the
        sort below to browse by title, author, or review date instead -- the
        <span class="font-mono text-sm">#</span> next to each book always shows where it
        sits in my own ranking.
      </p>
    </header>

    <div class="mb-8 flex flex-col gap-4 border-y border-default py-4 sm:flex-row sm:items-center sm:justify-between">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="Search by title, author, or date..."
        class="sm:max-w-xs"
        aria-label="Search the Book Shelf"
      />

      <div class="flex items-center gap-3">
        <USelect
          v-model="sort"
          :items="BOOK_SHELF_SORT_OPTIONS"
          class="w-36"
          aria-label="Sort the Book Shelf"
        />

        <UButton
          :icon="sortDirection === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
          variant="outline"
          color="neutral"
          :aria-label="sortDirection === 'asc' ? 'Sort ascending, click for descending' : 'Sort descending, click for ascending'"
          @click="toggleSortDirection"
        />

        <UFieldGroup>
          <UButton
            icon="i-lucide-list"
            :variant="view === 'list' ? 'solid' : 'outline'"
            color="neutral"
            aria-label="List view"
            @click="view = 'list'"
          />
          <UButton
            icon="i-lucide-grid-3x3"
            :variant="view === 'grid' ? 'solid' : 'outline'"
            color="neutral"
            aria-label="Grid view"
            @click="view = 'grid'"
          />
        </UFieldGroup>
      </div>
    </div>

    <p
      v-if="!filteredRanked.length"
      class="py-12 text-center text-muted"
    >
      No books match "{{ query }}".
    </p>

    <ol
      v-else-if="view === 'list'"
      class="divide-y divide-default"
    >
      <li
        v-for="book in filteredRanked"
        :key="book.post.path"
      >
        <NuxtLink
          :to="book.post.path"
          class="group flex items-center gap-4 py-4"
        >
          <span class="w-8 shrink-0 text-right font-mono text-base text-dimmed">
            {{ book.rank }}
          </span>

          <div
            v-if="book.post.image"
            class="aspect-[2/3] w-14 shrink-0 overflow-hidden rounded bg-elevated p-1"
          >
            <NuxtImg
              :src="book.post.image"
              :alt="book.post.imageAlt ?? book.post.title"
              class="size-full object-contain"
              width="80"
              height="120"
              sizes="56px"
            />
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-lg font-medium text-balance group-hover:text-primary">
              {{ book.post.title }}
            </p>
            <p
              v-if="book.post.bookAuthor"
              class="text-sm text-muted"
            >
              {{ book.post.bookAuthor }}
            </p>
            <p
              v-if="book.post.description"
              class="mt-1 line-clamp-2 text-base text-dimmed italic"
            >
              {{ book.post.description }}
            </p>
          </div>

          <span class="hidden shrink-0 font-mono text-sm text-dimmed sm:block">
            {{ formatBookDate(book.post.publishedAt) }}
          </span>

          <UIcon
            name="i-lucide-arrow-right"
            class="hidden size-4 shrink-0 text-dimmed transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block"
          />
        </NuxtLink>
      </li>
    </ol>

    <ul
      v-else
      class="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4"
    >
      <li
        v-for="book in filteredRanked"
        :key="book.post.path"
      >
        <NuxtLink
          :to="book.post.path"
          class="group block"
        >
          <div class="relative">
            <div
              v-if="book.post.image"
              class="aspect-[2/3] w-full overflow-hidden rounded-md bg-elevated p-3 transition-transform group-hover:-translate-y-1"
            >
              <NuxtImg
                :src="book.post.image"
                :alt="book.post.imageAlt ?? book.post.title"
                class="size-full object-contain drop-shadow-lg"
                width="200"
                height="300"
                sizes="240px"
              />
            </div>
            <span class="absolute top-1 left-1 flex size-8 items-center justify-center rounded-full bg-secondary font-mono text-sm font-medium text-inverted">
              {{ book.rank }}
            </span>
          </div>

          <p class="mt-3 text-lg font-medium text-balance group-hover:text-primary">
            {{ book.post.title }}
          </p>
          <p
            v-if="book.post.bookAuthor"
            class="text-sm text-muted"
          >
            {{ book.post.bookAuthor }}
          </p>
          <p
            v-if="book.post.description"
            class="mt-1 line-clamp-2 text-base text-dimmed italic"
          >
            {{ book.post.description }}
          </p>
        </NuxtLink>
      </li>
    </ul>

    <section
      v-if="filteredMentions.length"
      aria-labelledby="honorable-mentions-heading"
      class="mt-16"
    >
      <HomeSectionEyebrow
        id="honorable-mentions-heading"
        label="Honorable Mentions"
      />
      <p class="mb-6 max-w-2xl text-muted">
        Outside the main ranking -- outstanding books on unrelated topics, listed alphabetically.
      </p>

      <ul class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <li
          v-for="book in filteredMentions"
          :key="book.post.path"
        >
          <NuxtLink
            :to="book.post.path"
            class="group flex items-center gap-4"
          >
            <div
              v-if="book.post.image"
              class="aspect-[2/3] w-10 shrink-0 overflow-hidden rounded bg-elevated p-1"
            >
              <NuxtImg
                :src="book.post.image"
                :alt="book.post.imageAlt ?? book.post.title"
                class="size-full object-contain"
                width="80"
                height="120"
                sizes="40px"
              />
            </div>
            <div class="min-w-0">
              <p class="font-medium group-hover:text-primary">
                {{ book.post.title }}
              </p>
              <p
                v-if="book.post.bookAuthor"
                class="text-sm text-muted"
              >
                {{ book.post.bookAuthor }}
              </p>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </UContainer>
</template>
