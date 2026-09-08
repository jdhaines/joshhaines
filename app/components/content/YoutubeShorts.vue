<script setup lang="ts">
import { getYouTubeVideoId } from "~/utils/youtube"

defineOptions({ name: "YoutubeShorts" })

const props = defineProps<{
  videos: string[]
}>()

const parsedVideos = computed(() =>
  props.videos.map((video) => ({
    source: video,
    id: getYouTubeVideoId(video),
  }))
)
const validVideoIds = computed(() =>
  parsedVideos.value.map(({ id }) => id).filter((id): id is string => id !== null)
)
const invalidVideoCount = computed(
  () => parsedVideos.value.length - validVideoIds.value.length
)

const selectedVideoId = ref<string | null>(null)
const isOpen = computed({
  get: () => selectedVideoId.value !== null,
  set: (value) => {
    if (!value) selectedVideoId.value = null
  },
})

const embedUrl = computed(() =>
  selectedVideoId.value
    ? `https://www.youtube-nocookie.com/embed/${selectedVideoId.value}?autoplay=1&rel=0`
    : ""
)
</script>

<template>
  <div v-if="videos.length" class="not-prose my-8">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <button
        v-for="(videoId, index) in validVideoIds"
        :key="`${videoId}-${index}`"
        type="button"
        class="group relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-lg bg-elevated shadow-md outline-none ring-primary transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-default motion-reduce:transition-none"
        :aria-label="`Play YouTube Short ${index + 1}`"
        @click="selectedVideoId = videoId"
      >
        <img
          :src="`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`"
          alt=""
          class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02] motion-reduce:transition-none"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
        <span
          class="absolute inset-0 flex items-center justify-center bg-black/15 transition group-hover:bg-black/25 motion-reduce:transition-none"
          aria-hidden="true"
        >
          <span
            class="flex size-12 items-center justify-center rounded-full bg-black/70 text-white shadow-lg sm:size-14"
          >
            <UIcon name="i-lucide-play" class="ml-0.5 size-6 fill-current" />
          </span>
        </span>
      </button>
    </div>

    <p v-if="invalidVideoCount" role="alert" class="mt-3 text-sm text-error">
      {{ invalidVideoCount }}
      {{ invalidVideoCount === 1 ? "video link is" : "video links are" }} invalid.
    </p>

    <UModal
      v-model:open="isOpen"
      title="YouTube Short"
      description="Video player"
      :ui="{
        content: 'w-auto max-w-none bg-transparent shadow-none ring-0',
        header: 'sr-only',
        body: 'p-0 sm:p-0',
      }"
    >
      <template #content>
        <div
          class="relative aspect-[9/16] w-[min(90vw,calc(85vh*9/16))] overflow-hidden rounded-lg bg-black shadow-2xl"
        >
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="solid"
            size="lg"
            aria-label="Close video"
            class="absolute top-2 right-2 z-10 rounded-full"
            @click="isOpen = false"
          />
          <iframe
            v-if="selectedVideoId"
            :src="embedUrl"
            title="YouTube Short video player"
            class="h-full w-full"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
              web-share;
            "
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
