/**
 * Cloudflare Worker for the site's comments feature.
 *
 * Deployed alongside the static site (see `wrangler.jsonc`'s `main` +
 * `assets.run_worker_first: ["/api/*"]`) -- every other route is served
 * directly from the static asset bundle without invoking this script at
 * all, so this only ever runs for `/api/*` requests.
 *
 * Endpoints:
 *   GET  /api/comments?path=/content/some-slug
 *     -> approved comments for that page, oldest first.
 *   POST /api/comments
 *     -> submit a new comment (starts as "pending", requires a valid
 *        Turnstile token, subject to basic abuse checks below).
 *   GET  /api/comments/pending           (requires admin bearer token)
 *     -> list all pending comments, for manual moderation.
 *   POST /api/comments/moderate          (requires admin bearer token)
 *     -> { id, action: "approve" | "reject" }
 *   GET  /api/comments/moderate-link?id=&action=&sig=
 *     -> one-click moderation links sent in the notification email (see
 *        notifyModerator below). Shows a small confirmation page; the
 *        actual DB update only happens on the POST below, so that email
 *        client/security-scanner link prefetching (which only ever does
 *        GET) can't silently approve or reject a comment.
 *   POST /api/comments/moderate-link
 *     -> performs the approve/reject from the confirmation page's form.
 *
 * See DEVELOPER.md's "Comments" section for the one-time Cloudflare setup
 * (D1 database, Turnstile widget, secrets) this depends on.
 */

interface Env {
  COMMENTS_DB: D1Database
  ASSETS: Fetcher
  TURNSTILE_SECRET: string
  COMMENTS_ADMIN_TOKEN: string
  EMAIL: SendEmail
  COMMENT_NOTIFY_EMAIL: string
  // Secret used to sign one-click moderation links (see `signModerationAction`
  // below) -- distinct from COMMENTS_ADMIN_TOKEN so a leaked link can only
  // ever approve/reject the one comment it was generated for, never grant
  // full admin API access.
  COMMENT_MODERATION_SECRET: string
  // e.g. "https://joshhaines.com" -- used to build absolute links in the
  // notification email, since email clients can't resolve relative URLs.
  COMMENT_SITE_ORIGIN: string
}

interface CommentRow {
  id: number
  path: string
  author_name: string
  author_url: string | null
  author_email: string | null
  body: string
  created_at: string
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' }

// Keeps the abuse checks below intentionally simple ("rudimentary" per the
// brief) rather than pulling in a full spam-detection dependency -- this is
// a low-traffic personal site, not a high-value spam target.
const MAX_NAME_LENGTH = 60
const MAX_URL_LENGTH = 200
const MAX_EMAIL_LENGTH = 254 // RFC 5321 max mailbox length
const MAX_BODY_LENGTH = 2000
const MAX_LINKS_IN_BODY = 2
const RATE_LIMIT_WINDOW_MINUTES = 10
const RATE_LIMIT_MAX_SUBMISSIONS = 3
const SPAM_KEYWORD_PATTERN = /\b(viagra|cialis|casino|crypto\s*airdrop|seo\s*backlink|forex\s*signal)\b/i
// Deliberately simple shape check (not a full RFC 5322 validator) -- good
// enough to catch typos/garbage without rejecting legitimate addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

function htmlResponse(body: string, status = 200) {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } })
}

type ModerationAction = 'approve' | 'reject'

// HMAC-SHA256 over "<id>:<action>" -- ties a signature to one specific
// comment and action, so a leaked/forwarded link can't be replayed against
// a different comment. Not timing-safe-compared, which is an acceptable
// tradeoff here: the worst case of a successful forgery is a spam comment
// getting approved on a low-traffic personal site, not an account takeover.
async function signModerationAction(secret: string, id: number, action: ModerationAction) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}:${action}`))
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function buildModerationLink(env: Env, id: number, action: ModerationAction) {
  const sig = await signModerationAction(env.COMMENT_MODERATION_SECRET, id, action)
  const url = new URL('/api/comments/moderate-link', env.COMMENT_SITE_ORIGIN)
  url.searchParams.set('id', String(id))
  url.searchParams.set('action', action)
  url.searchParams.set('sig', sig)
  return url.toString()
}

function moderationPage(title: string, bodyHtml: string, status = 200) {
  return htmlResponse(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1.5rem; color: #1a1a2e; }
  blockquote { border-left: 3px solid #d9d9e3; margin: 1rem 0; padding: 0.25rem 1rem; color: #444; white-space: pre-wrap; }
  button { font-size: 1rem; padding: 0.6rem 1.2rem; border-radius: 0.375rem; border: 1px solid #2563eb; background: #2563eb; color: #fff; cursor: pointer; }
  .deny button { background: #dc2626; border-color: #dc2626; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`,
    status,
  )
}

async function hashIp(ip: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip))
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyTurnstile(token: string, secretKey: string, remoteIp: string) {
  const body = new URLSearchParams({ secret: secretKey, response: token, remoteip: remoteIp })
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  const result = await response.json() as { success: boolean }
  return result.success === true
}

function requireAdmin(request: Request, env: Env) {
  const auth = request.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : ''
  return token.length > 0 && token === env.COMMENTS_ADMIN_TOKEN
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Best-effort only -- a failed notification email should never block or
// fail the comment submission itself (the comment is already saved as
// "pending" regardless). Errors are logged, not thrown.
async function notifyModerator(env: Env, comment: { id: number, path: string, name: string, authorUrl: string | null, authorEmail: string | null, body: string }) {
  if (!env.COMMENT_NOTIFY_EMAIL) return

  const preview = comment.body.length > 280 ? `${comment.body.slice(0, 280)}... ` : comment.body

  try {
    const [approveLink, denyLink] = await Promise.all([
      buildModerationLink(env, comment.id, 'approve'),
      buildModerationLink(env, comment.id, 'reject'),
    ])

    const textDetails = [
      `Name: ${comment.name}`,
      `Email: ${comment.authorEmail ?? '(none provided)'}`,
      `Website: ${comment.authorUrl ?? '(none provided)'}`,
      `Page: ${comment.path}`,
    ].join('\n')

    const htmlDetails = `<ul>
  <li><strong>Name:</strong> ${escapeHtml(comment.name)}</li>
  <li><strong>Email:</strong> ${comment.authorEmail ? escapeHtml(comment.authorEmail) : '<em>(none provided)</em>'}</li>
  <li><strong>Website:</strong> ${comment.authorUrl ? `<a href="${escapeHtml(comment.authorUrl)}">${escapeHtml(comment.authorUrl)}</a>` : '<em>(none provided)</em>'}</li>
  <li><strong>Page:</strong> <code>${escapeHtml(comment.path)}</code></li>
</ul>`

    await env.EMAIL.send({
      to: env.COMMENT_NOTIFY_EMAIL,
      from: { email: 'comments@joshhaines.com', name: 'JoshHaines.com Comments' },
      subject: `New comment awaiting review on ${comment.path}`,
      text: `New comment awaiting moderation:\n\n${textDetails}\n\nMessage:\n${comment.body}\n\nApprove: ${approveLink}\nDeny: ${denyLink}`,
      html: `<p>New comment awaiting moderation:</p>
${htmlDetails}
<p><strong>Message:</strong></p>
<blockquote>${escapeHtml(preview)}</blockquote>
<p>
  <a href="${approveLink}" style="display:inline-block;padding:0.5rem 1rem;background:#2563eb;color:#fff;text-decoration:none;border-radius:0.375rem;">Approve</a>
  &nbsp;
  <a href="${denyLink}" style="display:inline-block;padding:0.5rem 1rem;background:#dc2626;color:#fff;text-decoration:none;border-radius:0.375rem;">Deny</a>
</p>
<p>Each link opens a one-click confirmation page -- nothing is approved or rejected until you click the button there.</p>`,
    })
  }
  catch (error) {
    console.error('Failed to send comment moderation notification email', error)
  }
}

async function listApprovedComments(request: Request, env: Env) {
  const path = new URL(request.url).searchParams.get('path')
  if (!path) return jsonResponse({ error: 'Missing "path" query parameter' }, 400)

  const { results } = await env.COMMENTS_DB.prepare(
    `SELECT id, path, author_name, author_url, author_email, body, created_at FROM comments
     WHERE path = ?1 AND status = 'approved'
     ORDER BY created_at ASC`,
  ).bind(path).all<CommentRow>()

  return jsonResponse({ comments: results ?? [] })
}

async function submitComment(request: Request, env: Env) {
  let payload: {
    path?: string
    name?: string
    authorUrl?: string
    authorEmail?: string
    body?: string
    turnstileToken?: string
    website?: string // honeypot: real users never fill this in
  }

  try {
    payload = await request.json()
  }
  catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const path = payload.path?.trim()
  const name = payload.name?.trim()
  const body = payload.body?.trim()
  const turnstileToken = payload.turnstileToken
  let authorUrl = payload.authorUrl?.trim() || null
  const authorEmail = payload.authorEmail?.trim() || null

  // Honeypot: a hidden field real commenters never see or fill in. Bots
  // that blindly fill every form field trip this silently -- return a
  // generic success so they don't learn to skip it next time.
  if (payload.website) {
    return jsonResponse({ ok: true })
  }

  if (!path || !name || !body || !turnstileToken) {
    return jsonResponse({ error: 'Missing required field' }, 400)
  }
  if (name.length > MAX_NAME_LENGTH) {
    return jsonResponse({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` }, 400)
  }
  if (authorUrl) {
    // A bare domain like "linkedin.com/in/me" is a common thing to type --
    // treat it as https by default rather than rejecting it.
    if (!/^https?:\/\//i.test(authorUrl)) authorUrl = `https://${authorUrl}`
    if (authorUrl.length > MAX_URL_LENGTH) {
      return jsonResponse({ error: `Link must be ${MAX_URL_LENGTH} characters or fewer` }, 400)
    }
    try {
      new URL(authorUrl)
    }
    catch {
      return jsonResponse({ error: 'Link must be a valid URL' }, 400)
    }
  }
  if (authorEmail) {
    if (authorEmail.length > MAX_EMAIL_LENGTH) {
      return jsonResponse({ error: `Email must be ${MAX_EMAIL_LENGTH} characters or fewer` }, 400)
    }
    if (!EMAIL_PATTERN.test(authorEmail)) {
      return jsonResponse({ error: 'Email must be a valid email address' }, 400)
    }
  }
  if (body.length === 0 || body.length > MAX_BODY_LENGTH) {
    return jsonResponse({ error: `Comment must be 1-${MAX_BODY_LENGTH} characters` }, 400)
  }
  if (SPAM_KEYWORD_PATTERN.test(body) || SPAM_KEYWORD_PATTERN.test(name)) {
    return jsonResponse({ error: 'Comment rejected' }, 400)
  }
  const linkCount = (body.match(/https?:\/\//gi) ?? []).length
  if (linkCount > MAX_LINKS_IN_BODY) {
    return jsonResponse({ error: 'Comment rejected' }, 400)
  }

  const remoteIp = request.headers.get('cf-connecting-ip') ?? '0.0.0.0'

  const turnstileOk = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, remoteIp)
  if (!turnstileOk) {
    return jsonResponse({ error: 'CAPTCHA verification failed' }, 400)
  }

  const ipHash = await hashIp(remoteIp)
  const { results: recent } = await env.COMMENTS_DB.prepare(
    `SELECT COUNT(*) as count FROM comments
     WHERE ip_hash = ?1 AND created_at > datetime('now', ?2)`,
  ).bind(ipHash, `-${RATE_LIMIT_WINDOW_MINUTES} minutes`).all<{ count: number }>()

  if ((recent?.[0]?.count ?? 0) >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return jsonResponse({ error: 'Too many comments submitted recently, please try again later' }, 429)
  }

  const inserted = await env.COMMENTS_DB.prepare(
    `INSERT INTO comments (path, author_name, author_url, author_email, body, status, ip_hash) VALUES (?1, ?2, ?3, ?4, ?5, 'pending', ?6)`,
  ).bind(path, name, authorUrl, authorEmail, body, ipHash).run()

  const insertedId = inserted.meta.last_row_id
  if (insertedId) {
    await notifyModerator(env, { id: insertedId, path, name, authorUrl, authorEmail, body })
  }

  return jsonResponse({ ok: true, message: 'Comment submitted for review' }, 201)
}

async function listPendingComments(request: Request, env: Env) {
  if (!requireAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401)

  const { results } = await env.COMMENTS_DB.prepare(
    `SELECT id, path, author_name, author_url, author_email, body, created_at FROM comments
     WHERE status = 'pending' ORDER BY created_at ASC`,
  ).all<CommentRow>()

  return jsonResponse({ comments: results ?? [] })
}

async function moderateComment(request: Request, env: Env) {
  if (!requireAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401)

  let payload: { id?: number, action?: 'approve' | 'reject' }
  try {
    payload = await request.json()
  }
  catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  if (!payload.id || (payload.action !== 'approve' && payload.action !== 'reject')) {
    return jsonResponse({ error: 'Expected { id, action: "approve" | "reject" }' }, 400)
  }

  const status = payload.action === 'approve' ? 'approved' : 'rejected'
  await env.COMMENTS_DB.prepare('UPDATE comments SET status = ?1 WHERE id = ?2').bind(status, payload.id).run()

  return jsonResponse({ ok: true })
}

// Parses and validates the shared { id, action, sig } params used by both
// the GET confirmation page and the POST that actually moderates. Returns
// the matching comment row, or an HTML error/info response to short-circuit
// with (never both).
async function loadModerationLinkTarget(
  env: Env,
  params: URLSearchParams,
): Promise<{ error: Response } | { comment: CommentRow & { status: string }, action: ModerationAction }> {
  const idParam = params.get('id')
  const action = params.get('action')
  const sig = params.get('sig')
  const id = idParam ? Number(idParam) : Number.NaN

  if (!Number.isInteger(id) || (action !== 'approve' && action !== 'reject') || !sig) {
    return { error: moderationPage('Invalid link', '<h1>Invalid link</h1><p>This moderation link is malformed.</p>', 400) }
  }

  const expectedSig = await signModerationAction(env.COMMENT_MODERATION_SECRET, id, action)
  if (sig !== expectedSig) {
    return { error: moderationPage('Invalid link', '<h1>Invalid link</h1><p>This moderation link failed verification -- it may have been altered.</p>', 403) }
  }

  const comment = await env.COMMENTS_DB.prepare(
    'SELECT id, path, author_name, author_url, author_email, body, status, created_at FROM comments WHERE id = ?1',
  ).bind(id).first<CommentRow & { status: string }>()

  if (!comment) {
    return { error: moderationPage('Comment not found', '<h1>Comment not found</h1><p>It may have already been deleted.</p>', 404) }
  }

  return { comment, action } as const
}

// GET /api/comments/moderate-link -- shows a confirmation page instead of
// acting immediately. Email link-prefetchers (Gmail/Outlook safe-browsing
// scanners, chat-app unfurlers, etc.) only ever issue GET requests, so
// keeping the actual DB write behind a POST-only form submit prevents a
// scanner from silently approving or rejecting a comment before a human
// ever sees the email.
async function showModerationConfirmation(request: Request, env: Env) {
  const { searchParams } = new URL(request.url)
  const target = await loadModerationLinkTarget(env, searchParams)
  if ('error' in target) return target.error

  const { comment, action } = target
  const actionLabel = action === 'approve' ? 'Approve' : 'Deny'

  if (comment.status !== 'pending') {
    return moderationPage(
      'Already moderated',
      `<h1>Already moderated</h1><p>This comment from <strong>${escapeHtml(comment.author_name)}</strong> on <code>${escapeHtml(comment.path)}</code> was already marked <strong>${escapeHtml(comment.status)}</strong>. No action needed.</p>`,
    )
  }

  return moderationPage(
    `${actionLabel} comment?`,
    `<h1>${actionLabel} this comment?</h1>
<ul>
  <li><strong>Name:</strong> ${escapeHtml(comment.author_name)}</li>
  <li><strong>Email:</strong> ${comment.author_email ? escapeHtml(comment.author_email) : '<em>(none provided)</em>'}</li>
  <li><strong>Website:</strong> ${comment.author_url ? `<a href="${escapeHtml(comment.author_url)}">${escapeHtml(comment.author_url)}</a>` : '<em>(none provided)</em>'}</li>
  <li><strong>Page:</strong> <code>${escapeHtml(comment.path)}</code></li>
</ul>
<blockquote>${escapeHtml(comment.body)}</blockquote>
<form method="post" action="/api/comments/moderate-link" class="${action === 'reject' ? 'deny' : ''}">
  <input type="hidden" name="id" value="${comment.id}">
  <input type="hidden" name="action" value="${action}">
  <input type="hidden" name="sig" value="${escapeHtml(searchParams.get('sig') ?? '')}">
  <button type="submit">${actionLabel}</button>
</form>
<script>document.querySelector('form').submit()</script>`,
  )
}

// POST /api/comments/moderate-link -- the actual write, submitted from the
// confirmation page's form (see showModerationConfirmation above).
async function applyModerationLink(request: Request, env: Env) {
  const formData = await request.formData()
  const params = new URLSearchParams()
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') params.set(key, value)
  }

  const target = await loadModerationLinkTarget(env, params)
  if ('error' in target) return target.error

  const { comment, action } = target
  const actionLabel = action === 'approve' ? 'approved' : 'denied'

  if (comment.status !== 'pending') {
    return moderationPage(
      'Already moderated',
      `<h1>Already moderated</h1><p>This comment was already marked <strong>${escapeHtml(comment.status)}</strong>. No action needed.</p>`,
    )
  }

  const status = action === 'approve' ? 'approved' : 'rejected'
  await env.COMMENTS_DB.prepare('UPDATE comments SET status = ?1 WHERE id = ?2').bind(status, comment.id).run()

  return moderationPage(
    'Done',
    `<h1>Comment ${actionLabel}</h1><p>The comment from <strong>${escapeHtml(comment.author_name)}</strong> on <code>${escapeHtml(comment.path)}</code> has been ${actionLabel}.</p>`,
  )
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)

    if (pathname === '/api/comments' && request.method === 'GET') {
      return listApprovedComments(request, env)
    }
    if (pathname === '/api/comments' && request.method === 'POST') {
      return submitComment(request, env)
    }
    if (pathname === '/api/comments/pending' && request.method === 'GET') {
      return listPendingComments(request, env)
    }
    if (pathname === '/api/comments/moderate' && request.method === 'POST') {
      return moderateComment(request, env)
    }
    if (pathname === '/api/comments/moderate-link' && request.method === 'GET') {
      return showModerationConfirmation(request, env)
    }
    if (pathname === '/api/comments/moderate-link' && request.method === 'POST') {
      return applyModerationLink(request, env)
    }

    // Any other /api/* path, or a non-API request that reached the Worker
    // unexpectedly -- fall back to the static asset bundle rather than
    // erroring, matching the default (non-Worker-first) routing behavior.
    return env.ASSETS.fetch(request)
  },
}
