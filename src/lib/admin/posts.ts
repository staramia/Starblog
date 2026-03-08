import type { D1Like } from '../db';

export interface ManagedPost {
  slug: string;
  authorId: string;
  postCategory: 'article' | 'report';
  title: string;
  excerpt: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
  updatedAt?: string;
  content: string;
}

type PostRow = {
  slug: string;
  author_id: string;
  post_category: 'article' | 'report';
  title: string;
  excerpt: string | null;
  tags_json: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  updated_at: string;
  content: string | null;
};

function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    const value = JSON.parse(tagsJson) as unknown;
    if (!Array.isArray(value)) return [];
    return value.map((item) => String(item)).filter(Boolean);
  } catch {
    return [];
  }
}

function mapPost(row: PostRow): ManagedPost {
  return {
    slug: row.slug,
    authorId: row.author_id,
    postCategory: row.post_category,
    title: row.title,
    excerpt: row.excerpt || '',
    tags: parseTags(row.tags_json),
    status: row.status,
    publishedAt: row.published_at || undefined,
    updatedAt: row.updated_at,
    content: row.content || '',
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function listManagedPosts(db: D1Like, authorId?: string) {
  const baseQuery =
    'SELECT slug, author_id, post_category, title, excerpt, tags_json, status, published_at, updated_at, content FROM posts';

  const { results } = authorId
    ? await db
        .prepare(`${baseQuery} WHERE author_id = ? ORDER BY datetime(updated_at) DESC`)
        .bind(authorId)
        .all<PostRow>()
    : await db.prepare(`${baseQuery} ORDER BY datetime(updated_at) DESC`).bind().all<PostRow>();

  return results.map(mapPost);
}

export async function getManagedPost(db: D1Like, slug: string) {
  const row = await db
    .prepare(
      'SELECT slug, author_id, post_category, title, excerpt, tags_json, status, published_at, updated_at, content FROM posts WHERE slug = ? LIMIT 1'
    )
    .bind(slug)
    .first<PostRow>();
  if (!row) throw new Error('NOT_FOUND');
  return mapPost(row);
}

export async function createManagedPost(db: D1Like, input: Partial<ManagedPost>) {
  const slug = slugify(input.slug || input.title || `post-${Date.now()}`);

  const exists = await db.prepare('SELECT slug FROM posts WHERE slug = ? LIMIT 1').bind(slug).first<{ slug: string }>();
  if (exists) throw new Error('SLUG_EXISTS');

  const now = new Date().toISOString();
  const status: 'draft' | 'published' = input.status === 'published' ? 'published' : 'draft';
  const post: ManagedPost = {
    slug,
    authorId: String(input.authorId || ''),
    postCategory: (input.postCategory as 'article' | 'report') || 'article',
    title: input.title || slug,
    excerpt: input.excerpt || '',
    tags: input.tags || [],
    status,
    publishedAt: status === 'published' ? now : undefined,
    updatedAt: now,
    content: input.content || '',
  };

  await db
    .prepare(
      'INSERT INTO posts (slug, author_id, post_category, title, excerpt, tags_json, status, published_at, updated_at, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(
      post.slug,
      post.authorId,
      post.postCategory,
      post.title,
      post.excerpt,
      JSON.stringify(post.tags),
      post.status,
      post.publishedAt || null,
      post.updatedAt,
      post.content
    )
    .run();
  return post;
}

export async function updateManagedPost(db: D1Like, slug: string, input: Partial<ManagedPost>) {
  const current = await getManagedPost(db, slug);
  const now = new Date().toISOString();
  const status: 'draft' | 'published' = input.status === 'published' ? 'published' : 'draft';

  const merged: ManagedPost = {
    ...current,
    ...input,
    slug,
    authorId: current.authorId,
    postCategory: current.postCategory,
    status,
    updatedAt: now,
    publishedAt: current.publishedAt || (status === 'published' ? now : undefined),
    tags: input.tags || current.tags,
  };

  await db
    .prepare(
      'UPDATE posts SET title = ?, excerpt = ?, tags_json = ?, status = ?, published_at = ?, updated_at = ?, content = ? WHERE slug = ?'
    )
    .bind(
      merged.title,
      merged.excerpt,
      JSON.stringify(merged.tags),
      merged.status,
      merged.publishedAt || null,
      merged.updatedAt,
      merged.content,
      slug
    )
    .run();

  return merged;
}

export async function deleteManagedPost(db: D1Like, slug: string) {
  await db.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run();
}
