import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../../../lib/auth/guard';
import { deleteManagedPost, getManagedPost, updateManagedPost } from '../../../../lib/admin/posts';
import { requireDb } from '../../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ request, params, locals }) => {
  const db = requireDb(locals);
  const user = await getCurrentUser(request, locals);
  if (!user) return new Response(JSON.stringify({ message: '未登录' }), { status: 401 });
  const slug = params.slug;
  if (!slug) return new Response(JSON.stringify({ message: '缺少 slug' }), { status: 400 });

  try {
    const post = await getManagedPost(db, slug);
    if (user.role !== 'admin' && post.authorId !== user.id) {
      return new Response(JSON.stringify({ message: '无权限访问该文章' }), { status: 403 });
    }
    return new Response(JSON.stringify({ post }), { headers: { 'content-type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ message: '文章不存在' }), { status: 404 });
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  const db = requireDb(locals);
  const user = await getCurrentUser(request, locals);
  if (!user) return new Response(JSON.stringify({ message: '未登录' }), { status: 401 });
  const slug = params.slug;
  if (!slug) return new Response(JSON.stringify({ message: '缺少 slug' }), { status: 400 });

  try {
    const existing = await getManagedPost(db, slug);
    if (user.role !== 'admin' && existing.authorId !== user.id) {
      return new Response(JSON.stringify({ message: '无权限编辑该文章' }), { status: 403 });
    }

    const body = await request.json();
    const category = user.role === 'bot' ? 'report' : 'article';
    const post = await updateManagedPost(db, slug, {
      postCategory: category,
      title: String(body.title || ''),
      excerpt: String(body.excerpt || ''),
      tags: Array.isArray(body.tags) ? body.tags.map((tag: unknown) => String(tag)) : [],
      status: body.status === 'published' ? 'published' : 'draft',
      content: String(body.content || ''),
    });
    return new Response(JSON.stringify({ ok: true, post }), { headers: { 'content-type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ message: '更新失败' }), { status: 400 });
  }
};

export const DELETE: APIRoute = async ({ request, params, locals }) => {
  const db = requireDb(locals);
  const user = await getCurrentUser(request, locals);
  if (!user) return new Response(JSON.stringify({ message: '未登录' }), { status: 401 });
  const slug = params.slug;
  if (!slug) return new Response(JSON.stringify({ message: '缺少 slug' }), { status: 400 });

  try {
    const existing = await getManagedPost(db, slug);
    if (user.role !== 'admin' && existing.authorId !== user.id) {
      return new Response(JSON.stringify({ message: '无权限删除该文章' }), { status: 403 });
    }
  } catch {
    return new Response(JSON.stringify({ message: '文章不存在' }), { status: 404 });
  }

  await deleteManagedPost(db, slug);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
