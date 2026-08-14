<script setup lang="ts">
const { image, close } = useImageLightbox()

const isOpen = computed({
  get: () => image.value !== null,
  set: (value) => {
    if (!value) close()
  },
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    fullscreen
    :ui="{ content: 'bg-transparent dark:bg-transparent shadow-none ring-0' }"
  >
    <template #content>
      <button
        type="button"
        class="flex h-full w-full cursor-zoom-out items-center justify-center p-6 sm:p-12"
        @click="close"
      >
        <img
          v-if="image"
          :src="image.src"
          :alt="image.alt"
          class="max-h-full max-w-full rounded-md object-contain shadow-2xl"
        />
      </button>
    </template>
  </UModal>
</template>
