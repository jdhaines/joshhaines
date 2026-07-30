-- D1 schema for the comments feature.
-- Apply with: wrangler d1 execute joshhaines-comments --file=workers/schema.sql
-- (add --remote to apply to the live database instead of the local dev copy)

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- The content page this comment belongs to, e.g. "/content/high-growth-handbook".
  path TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  -- pending: awaiting moderation, approved: publicly visible, rejected: hidden.
  status TEXT NOT NULL DEFAULT 'pending',
  -- SHA-256 hash of the submitter's IP (never the raw IP), used only for
  -- rudimentary rate-limiting -- never displayed or exposed via the API.
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_path_status ON comments (path, status, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_ip_created ON comments (ip_hash, created_at);
