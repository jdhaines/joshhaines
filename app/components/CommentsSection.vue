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
  author_url: string | null
  author_email: string | null
  body: string
  created_at: string
}

const { data: comments, refresh: refreshComments } = await useAsyncData(
  `comments-${props.path}`,
  () => $fetch<{ comments: CommentItem[] }>('/api/comments', { query: { path: props.path } }).then(res => res.comments),
  {
    default: () => [],
    // This page is statically generated, so a normal (server-side)
    // useAsyncData call would run once at build time and bake that
    // snapshot into the prerendered payload -- newly approved comments
    // would never show up until some other client-side refresh
    // (e.g. submitting a new comment) happened to refetch. Comments are
    // inherently dynamic, so always fetch them fresh on the client instead.
    server: false,
  },
)

const name = ref('')
const authorUrl = ref('')
const authorEmail = ref('')
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
  if (authorEmail.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail.value.trim())) {
    errorMessage.value = 'Please enter a valid email address.'
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
        authorUrl: authorUrl.value.trim(),
        authorEmail: authorEmail.value.trim(),
        body: body.value.trim(),
        turnstileToken: turnstileToken.value,
        website: website.value,
      },
    })
    status.value = 'success'
    name.value = ''
    authorUrl.value = ''
    authorEmail.value = ''
    body.value = ''
    await refreshComments()
  }
  catch (error) {
    status.value = 'error'
    errorMessage.value = (error as { data?: { error?: string } })?.data?.error ?? 'Something went wrong submitting your comment.'
  }
  finally {
    // Turnstile tokens are single-use -- whether the submit succeeded or
    // failed, the token we just sent is now spent. Reset the widget so a
    // retry (or a second comment) gets a fresh token instead of silently
    // being rejected as "timeout-or-duplicate" by Cloudflare.
    turnstileToken.value = ''
    if (turnstileWidgetId.value) {
      (window as unknown as { turnstile?: { reset: (id: string) => void } }).turnstile?.reset(turnstileWidgetId.value)
    }
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
          <span class="font-medium">
            <a
              v-if="comment.author_url"
              :href="comment.author_url"
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              class="text-primary hover:underline"
            >{{ comment.author_name }}</a>
            <template v-else>{{ comment.author_name }}</template>
            <span
              v-if="comment.author_email"
              class="font-normal text-muted"
            > ({{ comment.author_email }})</span>
          </span>
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

      <UFormField
        label="Website or profile link"
        hint="optional"
      >
        <UInput
          v-model="authorUrl"
          name="authorUrl"
          type="url"
          maxlength="200"
          autocomplete="url"
          placeholder="https://linkedin.com/in/you"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Email"
        hint="optional, shown next to your name"
      >
        <UInput
          v-model="authorEmail"
          name="authorEmail"
          type="email"
          maxlength="254"
          autocomplete="email"
          placeholder="you@example.com"
          class="w-full"
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
