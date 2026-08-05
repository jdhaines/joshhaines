<script setup lang="ts">
defineProps<{
  src: string
  alt?: string
  portrait?: boolean
}>()
</script>

<template>
  <div
    :class="[
      portrait ? 'aspect-[2/3] bg-elevated p-3' : 'aspect-video',
      'w-full overflow-hidden rounded-lg',
    ]"
  >
    <NuxtImg
      :src="src"
      :alt="alt"
      :class="[
        portrait
          ? 'size-full object-contain drop-shadow-lg'
          : 'aspect-video w-full rounded-lg object-cover',
      ]"
      :width="portrait ? 200 : 320"
      :height="portrait ? 300 : 180"
      sizes="288px"
    />
  </div>
</template>
