<script lang="ts">
import theme from '#build/ui/prose/pre'
</script>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useAppConfig } from '#imports'
import { tv } from '@nuxt/ui/utils/tv'

/**
 * Override of Nuxt UI's `ProsePre` that always shows the code block header
 * with a readable language label (e.g. "Shell", "TypeScript") even when the
 * fence has no `[filename]` annotation. When a filename is present it takes
 * priority, matching the upstream behavior.
 */
const props = defineProps<{
  icon?: string
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  hideHeader?: boolean
  meta?: string
  copy?: boolean | Record<string, unknown>
  class?: unknown
  ui?: Record<string, unknown>
}>()

defineSlots<{ default(): unknown }>()

const appConfig = useAppConfig()
const { copy: copyToClipboard, copied } = useClipboard()
const baseRef = useTemplateRef<HTMLPreElement>('baseRef')

const themeUi = computed(() => tv({ extend: theme, ...(appConfig.ui?.prose?.pre || {}) })())

// Show the language moniker exactly as typed after the code fence's
// triple-backticks (e.g. ```bash -> "bash"), not a prettified label.
const headerLabel = computed(() => props.filename ?? props.language)

const codeIcon = computed(() => {
  if (props.icon) return props.icon

  const codeIcons = (appConfig.ui?.prose?.codeIcon ?? {}) as Record<string, string>

  if (props.filename) {
    const cleanFilename = props.filename.replace(/\s*\(.*\)\s*$/, '')
    const extension = cleanFilename.includes('.') && cleanFilename.split('.').pop()
    const name = cleanFilename.split('/').pop()
    return (name && codeIcons[name.toLowerCase()])
      ?? (extension && (codeIcons[extension] ?? `i-vscode-icons-file-type-${extension}`))
  }

  if (props.language) {
    const key = props.language.toLowerCase()
    return codeIcons[key] ?? `i-vscode-icons-file-type-${key}`
  }

  return undefined
})

function copyCode() {
  const code = props.code ?? baseRef.value?.textContent ?? ''
  copyToClipboard(code)
}
</script>

<template>
  <div :class="themeUi.root({ class: [props.ui?.root], filename: !!headerLabel })">
    <div v-if="headerLabel && !hideHeader" :class="themeUi.header({ class: props.ui?.header })">
      <UIcon v-if="codeIcon" :name="codeIcon" :class="themeUi.icon({ class: props.ui?.icon })" />

      <span :class="themeUi.filename({ class: props.ui?.filename })">{{ headerLabel }}</span>
    </div>

    <UButton
      v-if="props.copy"
      :icon="copied ? appConfig.ui.icons.copyCheck : appConfig.ui.icons.copy"
      color="neutral"
      variant="outline"
      size="sm"
      aria-label="Copy code"
      v-bind="typeof props.copy === 'object' ? props.copy : {}"
      :class="themeUi.copy({ class: props.ui?.copy })"
      @click="copyCode"
    />

    <pre ref="baseRef" :class="themeUi.base({ class: [props.ui?.base, props.class] })" v-bind="$attrs"><slot /></pre>
  </div>
</template>
