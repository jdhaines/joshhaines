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
 *
 * See DEVELOPER.md's "Comments" section for the one-time Cloudflare setup
 * (D1 database, Turnstile widget, secrets) this depends on.
 */

interface Env {
  COMMENTS_DB: D1Database
  ASSETS: Fetcher
  TURNSTILE_SECRET: string
  COMMENTS_ADMIN_TOKEN: string
}

interface CommentRow {
  id: number
  path: string
  author_name: string
  author_url: string | null
  body: string
  created_at: string
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' }

// Keeps the abuse checks below intentionally simple ("rudimentary" per the
// brief) rather than pulling in a full spam-detection dependency -- this is
// a low-traffic personal site, not a high-value spam target.
const MAX_NAME_LENGTH = 60
const MAX_URL_LENGTH = 200
const MAX_BODY_LENGTH = 2000
const MAX_LINKS_IN_BODY = 2
const RATE_LIMIT_WINDOW_MINUTES = 10
const RATE_LIMIT_MAX_SUBMISSIONS = 3
const SPAM_KEYWORD_PATTERN = /\b(viagra|cialis|casino|crypto\s*airdrop|seo\s*backlink|forex\s*signal)\b/i

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
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

async function listApprovedComments(request: Request, env: Env) {
  const path = new URL(request.url).searchParams.get('path')
  if (!path) return jsonResponse({ error: 'Missing "path" query parameter' }, 400)

  const { results } = await env.COMMENTS_DB.prepare(
    `SELECT id, path, author_name, author_url, body, created_at FROM comments
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

  await env.COMMENTS_DB.prepare(
    `INSERT INTO comments (path, author_name, author_url, body, status, ip_hash) VALUES (?1, ?2, ?3, ?4, 'pending', ?5)`,
  ).bind(path, name, authorUrl, body, ipHash).run()

  return jsonResponse({ ok: true, message: 'Comment submitted for review' }, 201)
}

async function listPendingComments(request: Request, env: Env) {
  if (!requireAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401)

  const { results } = await env.COMMENTS_DB.prepare(
    `SELECT id, path, author_name, author_url, body, created_at FROM comments
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

    // Any other /api/* path, or a non-API request that reached the Worker
    // unexpectedly -- fall back to the static asset bundle rather than
    // erroring, matching the default (non-Worker-first) routing behavior.
    return env.ASSETS.fetch(request)
  },
}
