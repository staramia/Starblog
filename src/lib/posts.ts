import { getCollection } from 'astro:content';

export async function getPublishedPosts() {
  const now = new Date();
  const posts = await getCollection('posts', ({ data }) => {
    if (data.status !== 'published') return false;
    if (!data.publishedAt) return false;
    return data.publishedAt <= now;
  });

  return posts.sort((a, b) => {
    const aTime = a.data.publishedAt?.getTime() ?? 0;
    const bTime = b.data.publishedAt?.getTime() ?? 0;
    return bTime - aTime;
  });
}

export function groupByCategory(posts: Awaited<ReturnType<typeof getPublishedPosts>>) {
  return posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const key = post.data.category;
    acc[key] ??= [];
    acc[key].push(post);
    return acc;
  }, {});
}

export function groupByTag(posts: Awaited<ReturnType<typeof getPublishedPosts>>) {
  return posts.reduce<Record<string, typeof posts>>((acc, post) => {
    for (const tag of post.data.tags) {
      acc[tag] ??= [];
      acc[tag].push(post);
    }
    return acc;
  }, {});
}
