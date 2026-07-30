<script setup lang="ts">
/**
 * Comment list + submission form for a single content page. Talks directly
 * to the `/api/comments` Worker endpoint (see `workers/comments-api.ts`) --
 * same-origin, no separate API base URL needed once deployed.
 *
 * Requires a Cloudflare Turnstile site key (`NUXT_PUBLIC_TURNSTILE_SITE_KEY`
 * at build time) to render the submission form at all; see DEVELOPER.md's
 * "Comments" section for the one-time setup. Without it, only the existing
 * approved comments (if any) are shown, since there'd be nowhere to
 * validate a new submission's CAPTCHA token.
 */
const props = defineProps<{ path: string }>()

const config = useRuntimeConfig()
const turnstileSiteKey = config.public.turnstileSiteKey

interface CommentItem {
  id: number
  author_name: string
  body: string
  created_at: string
}

const { data: comments, refresh: refreshComments } = await useAsyncData(
  `comments-${props.path}`,
  () => $fetch<{ comments: CommentItem[] }>('/api/comments', { query: { path: props.path } }).then(res => res.comments),
  { default: () => [] },
)

const name = ref('')
const body = ref('')
const website = ref('') // honeypot -- must stay empty, never shown to real users
const turnstileToken = ref('')
const turnstileWidgetId = ref<string>()
const turnstileContainer = ref<HTMLDivElement>()

const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const errorMessage = ref('')

// Loads Cloudflare's Turnstile script once (client-only) and renders the
// widget into `turnstileContainer` when both are ready.
if (import.meta.client && turnstileSiteKey) {
  useHead({
    script: [{ src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', async: true, defer: true }],
  })

  onMounted(() => {
    const renderWidget = () => {
      const turnstile = (window as unknown as { turnstile?: { render: (el: HTMLElement, opts: object) => string } }).turnstile
      if (!turnstile || !turnstileContainer.value) {
        setTimeout(renderWidget, 200)
        return
      }
      turnstileWidgetId.value = turnstile.render(turnstileContainer.value, {
        sitekey: turnstileSiteKey,
        callback: (token: string) => { turnstileToken.value = token },
        'expired-callback': () => { turnstileToken.value = '' },
      })
    }
    renderWidget()
  })
}

async function submitComment() {
  errorMessage.value = ''

  if (!name.value.trim() || !body.value.trim()) {
    errorMessage.value = 'Please fill in your name and a comment.'
    return
  }
  if (!turnstileToken.value) {
    errorMessage.value = 'Please complete the CAPTCHA challenge.'
    return
  }

  status.value = 'submitting'

  try {
    await $fetch('/api/comments', {
      method: 'POST',
      body: {
        path: props.path,
        name: name.value.trim(),
        body: body.value.trim(),
        turnstileToken: turnstileToken.value,
        website: website.value,
      },
    })
    status.value = 'success'
    name.value = ''
    body.value = ''
    turnstileToken.value = ''
    await refreshComments()
  }
  catch (error) {
    status.value = 'error'
    errorMessage.value = (error as { data?: { error?: string } })?.data?.error ?? 'Something went wrong submitting your comment.'
  }
}
</script>

<template>
  <section
    class="mt-16 border-t border-default pt-8"
    aria-labelledby="comments-heading"
  >
    <h2
      id="comments-heading"
      class="font-serif text-2xl font-semibold"
    >
      Comments
    </h2>

    <ul
      v-if="comments.length"
      class="mt-6 flex flex-col gap-6"
    >
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="rounded-lg border border-default p-4"
      >
        <div class="flex items-baseline justify-between gap-4">
          <span class="font-medium">{{ comment.author_name }}</span>
          <time
            class="text-sm text-muted"
            :datetime="comment.created_at"
          >{{ new Date(comment.created_at).toLocaleDateString() }}</time>
        </div>
        <p class="mt-2 whitespace-pre-wrap text-muted">
          {{ comment.body }}
        </p>
      </li>
    </ul>
    <p
      v-else
      class="mt-4 text-muted"
    >
      No comments yet -- be the first to share your thoughts.
    </p>

    <form
      v-if="turnstileSiteKey"
      class="mt-8 flex flex-col gap-4"
      @submit.prevent="submitComment"
    >
      <h3 class="text-lg font-medium">
        Leave a comment
      </h3>

      <UAlert
        v-if="status === 'success'"
        color="success"
        variant="subtle"
        title="Thanks! Your comment was submitted and will appear once it's reviewed."
      />
      <UAlert
        v-if="status === 'error'"
        color="error"
        variant="subtle"
        :title="errorMessage"
      />

      <UFormField label="Name">
        <UInput
          v-model="name"
          name="name"
          maxlength="60"
          autocomplete="name"
          placeholder="Your name"
        />
      </UFormField>

      <!-- Honeypot: hidden from real users via CSS, not `type="hidden"`, so
           it's still present in the DOM/tab order for bots that naively
           fill every input, but invisible and unreachable for people. -->
      <div
        class="absolute -left-[9999px]"
        aria-hidden="true"
      >
        <label for="comment-website">Website</label>
        <input
          id="comment-website"
          v-model="website"
          name="website"
          type="text"
          tabindex="-1"
          autocomplete="off"
        >
      </div>

      <UFormField label="Comment">
        <UTextarea
          v-model="body"
          name="body"
          :rows="4"
          maxlength="2000"
          placeholder="Share your thoughts..."
          class="w-full"
        />
      </UFormField>

      <div
        ref="turnstileContainer"
        class="cf-turnstile"
      />

      <UButton
        type="submit"
        :loading="status === 'submitting'"
        class="self-start"
      >
        Post comment
      </UButton>
    </form>
  </section>
</template>
