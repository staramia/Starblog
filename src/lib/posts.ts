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

function readAdvanced(post: {
  data: {
    advanced?: {
      discriminant?: boolean;
      value?: {
        category?: string;
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

export function groupByCategory(posts: Awaited<ReturnType<typeof getPublishedPosts>>) {
  return posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const key = readAdvanced(post)?.category || '未分类';
    acc[key] ??= [];
    acc[key].push(post);
    return acc;
  }, {});
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
