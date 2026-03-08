import type { D1Like } from './db';
import { getUserDisplayNameById } from './auth/store';

export interface PublicPost {
  slug: string;
  body: string;
  data: {
    authorId: string;
    postCategory: 'article' | 'report';
    title: string | { name: string; slug: string };
    advanced?: {
      discriminant?: boolean;
      value?: {
        excerpt?: string;
        tags?: string[];
        status?: 'draft' | 'published';
        seoTitle?: string;
        seoDescription?: string;
        canonical?: string;
      };
    };
    publishedAt?: Date;
    updatedAt?: Date;
  };
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

function mapPublicPost(row: PostRow): PublicPost {
  const tags = parseTags(row.tags_json);
  const publishedAt = row.published_at ? new Date(row.published_at) : undefined;
  const updatedAt = row.updated_at ? new Date(row.updated_at) : publishedAt;
  return {
    slug: row.slug,
    body: row.content || '',
    data: {
      authorId: row.author_id,
      postCategory: row.post_category,
      title: row.title,
      advanced: {
        discriminant: true,
        value: {
          excerpt: row.excerpt || '',
          tags,
          status: row.status,
        },
      },
      publishedAt,
      updatedAt,
    },
  };
}

export function getPostSlug(post: { slug?: string; data: { title: string | { slug?: string } } }) {
  if (typeof post.data.title !== 'string' && post.data.title.slug) {
    return post.data.title.slug;
  }
  return post.slug || '';
}

export async function getPostAuthorName(db: D1Like, post: { data: { authorId?: string } }) {
  const authorId = post.data.authorId;
  if (!authorId) return '系统';
  return getUserDisplayNameById(db, authorId);
}

function readAdvanced(post: {
  data: {
    advanced?: {
      discriminant?: boolean;
      value?: {
        tags?: string[];
      };
    };
  };
}) {
  if (!post.data.advanced?.discriminant) return undefined;
  return post.data.advanced.value;
}

export async function getPostDates(post: {
  data: { publishedAt?: Date; updatedAt?: Date };
}) {
  const publishedAt = post.data.publishedAt || new Date();
  const updatedAt = post.data.updatedAt || publishedAt;
  return { publishedAt, updatedAt };
}

export async function getPublishedPosts(db: D1Like) {
  const now = new Date().toISOString();
  const { results } = await db
    .prepare(
      'SELECT slug, author_id, post_category, title, excerpt, tags_json, status, published_at, updated_at, content FROM posts WHERE status = ? AND (published_at IS NULL OR published_at <= ?) ORDER BY datetime(COALESCE(published_at, updated_at)) DESC'
    )
    .bind('published', now)
    .all<PostRow>();
  return results.map(mapPublicPost);
}

export async function getPublishedPostBySlug(db: D1Like, slug: string) {
  const now = new Date().toISOString();
  const row = await db
    .prepare(
      'SELECT slug, author_id, post_category, title, excerpt, tags_json, status, published_at, updated_at, content FROM posts WHERE slug = ? AND status = ? AND (published_at IS NULL OR published_at <= ?) LIMIT 1'
    )
    .bind(slug, 'published', now)
    .first<PostRow>();
  return row ? mapPublicPost(row) : null;
}

export async function getPublishedPostsByCategory(db: D1Like, category: 'article' | 'report') {
  const posts = await getPublishedPosts(db);
  return posts.filter((post) => (post.data.postCategory || 'article') === category);
}

export function groupByTag(posts: Awaited<ReturnType<typeof getPublishedPosts>>) {
  return posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const tags = readAdvanced(post)?.tags || [];
    for (const tag of tags) {
      acc[tag] ??= [];
      acc[tag].push(post);
    }
    return acc;
  }, {});
}
