import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../../lib/auth/guard';
import { listUsers } from '../../../lib/auth/store';
import { requireDb } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const db = requireDb(locals);
  const current = await getCurrentUser(request, locals);
  if (!current) {
    return new Response(JSON.stringify({ message: '未登录' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  if (current.role !== 'admin') {
    return new Response(JSON.stringify({ message: '无权限访问' }), { status: 403, headers: { 'content-type': 'application/json' } });
  }

  const users = await listUsers(db);
  return new Response(
    JSON.stringify({
      users: users.map((user) => ({
        id: user.id,
        nickname: user.nickname,
        username: user.username,
        role: user.role,
      })),
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
};
