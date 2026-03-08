import { getCollection } from 'astro:content';
import fs from 'node:fs/promises';
import path from 'node:path';

export function getPostSlug(post: {
  slug?: string;
  id?: string;
  data: { title: string | { slug?: string } };
}) {
  if (typeof post.data.title !== 'string' && post.data.title.slug) {
    return post.data.title.slug;
  }
  if (post.slug) return post.slug;
  const id = post.id || '';
  const filename = id.split('/').pop() || id;
  return filename.replace(/\.(md|mdoc)$/i, '');
}

async function getUserMap() {
  try {
    const file = path.join(process.cwd(), '.data', 'users.json');
    const raw = await fs.readFile(file, 'utf-8');
    const users = JSON.parse(raw) as Array<{ id: string; nickname?: string; username?: string }>;
    return new Map(users.map((user) => [user.id, user.nickname || user.username || '系统']));
  } catch {
    return new Map<string, string>();
  }
}

export async function getPostAuthorName(post: { data: { authorId?: string } }) {
  const authorId = post.data.authorId;
  if (!authorId) return '系统';
  const map = await getUserMap();
  return map.get(authorId) || '系统';
}

function readAdvanced(post: {
  data: {
    advanced?: {
      discriminant?: boolean;
      value?: {
        tags?: string[];
        status?: 'draft' | 'published';
      };
    };
  };
}) {
  if (!post.data.advanced?.discriminant) return undefined;
  return post.data.advanced.value;
}

function getPublishedDate(post: { data: { publishedAt?: Date }; filePath?: string; id?: string }) {
  if (post.data.publishedAt) return post.data.publishedAt;
  return undefined;
}

async function getPostStat(post: { filePath?: string; id?: string }) {
  const candidates: string[] = [];
  if (post.filePath) candidates.push(post.filePath);
  if (post.id) candidates.push(path.join(process.cwd(), 'src/content/posts', post.id));

  for (const filePath of candidates) {
    try {
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
      return await fs.stat(absolutePath);
    } catch {
      continue;
    }
  }

  return undefined;
}

async function getPublishedTimestamp(post: { data: { publishedAt?: Date }; filePath?: string; id?: string }) {
  const directDate = getPublishedDate(post);
  if (directDate) return directDate.getTime();
  const stat = await getPostStat(post);
  if (stat) return stat.birthtimeMs || stat.mtimeMs;
  return 0;
}

export async function getPostDates(post: {
  data: { publishedAt?: Date; updatedAt?: Date };
  filePath?: string;
  id?: string;
}) {
  const stat = await getPostStat(post);
  const publishedAt = post.data.publishedAt || (stat ? new Date(stat.birthtimeMs || stat.mtimeMs) : new Date());
  const updatedAt = post.data.updatedAt || (stat ? new Date(stat.mtimeMs) : publishedAt);
  return { publishedAt, updatedAt };
}

export async function getPublishedPosts() {
  const now = new Date();
  const posts = await getCollection('posts', ({ data }) => {
    const status = data.advanced?.discriminant ? data.advanced.value?.status : 'published';
    if (status === 'draft') return false;
    if (!data.publishedAt) return true;
    return data.publishedAt <= now;
  });

  const postsWithTimestamp = await Promise.all(
    posts.map(async (post) => ({
      post,
      timestamp: await getPublishedTimestamp(post),
    }))
  );

  postsWithTimestamp.sort((a, b) => b.timestamp - a.timestamp);
  return postsWithTimestamp.map((item) => item.post);
}

export async function getPublishedPostsByCategory(category: 'article' | 'report') {
  const posts = await getPublishedPosts();
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
