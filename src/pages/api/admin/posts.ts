import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../../lib/auth/guard';
import { createManagedPost, listManagedPosts } from '../../../lib/admin/posts';
import { requireDb } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const db = requireDb(locals);
  const user = await getCurrentUser(request, locals);
  if (!user) return new Response(JSON.stringify({ message: '未登录' }), { status: 401 });
  const posts = await listManagedPosts(db, user.role === 'admin' ? undefined : user.id);
  return new Response(JSON.stringify({ posts }), { headers: { 'content-type': 'application/json' } });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = requireDb(locals);
  const user = await getCurrentUser(request, locals);
  if (!user) return new Response(JSON.stringify({ message: '未登录' }), { status: 401 });

  try {
    const body = await request.json();
    const category = user.role === 'bot' ? 'report' : 'article';
    const post = await createManagedPost(db, {
      authorId: user.id,
      postCategory: category,
      title: String(body.title || ''),
      slug: String(body.slug || ''),
      excerpt: String(body.excerpt || ''),
      tags: Array.isArray(body.tags) ? body.tags.map((tag: unknown) => String(tag)) : [],
      status: body.status === 'published' ? 'published' : 'draft',
      content: String(body.content || ''),
    });
    return new Response(JSON.stringify({ ok: true, post }), { headers: { 'content-type': 'application/json' } });
  } catch (error) {
    const message = error instanceof Error && error.message === 'SLUG_EXISTS' ? 'Slug 已存在' : '创建失败';
    return new Response(JSON.stringify({ message }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
};
