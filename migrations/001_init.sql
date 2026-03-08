CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('author', 'bot', 'admin')),
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  slug TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  post_category TEXT NOT NULL CHECK (post_category IN ('article', 'report')),
  title TEXT NOT NULL,
  excerpt TEXT,
  tags_json TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  published_at TEXT,
  updated_at TEXT NOT NULL,
  content TEXT,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON posts(status, published_at);
