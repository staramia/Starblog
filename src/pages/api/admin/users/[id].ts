import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../../../lib/auth/guard';
import { deleteUserById, findUserById, updateUserRoleById } from '../../../../lib/auth/store';
import { requireDb } from '../../../../lib/db';

export const prerender = false;

export const DELETE: APIRoute = async ({ request, params, locals }) => {
  const db = requireDb(locals);
  const current = await getCurrentUser(request, locals);
  if (!current) {
    return new Response(JSON.stringify({ message: '未登录' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  if (current.role !== 'admin') {
    return new Response(JSON.stringify({ message: '无权限访问' }), { status: 403, headers: { 'content-type': 'application/json' } });
  }

  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ message: '缺少用户 ID' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  if (id === current.id) {
    return new Response(JSON.stringify({ message: '不能注销当前管理员账号' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const target = await findUserById(db, id);
  if (!target) {
    return new Response(JSON.stringify({ message: '用户不存在' }), { status: 404, headers: { 'content-type': 'application/json' } });
  }

  await deleteUserById(db, id);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  const db = requireDb(locals);
  const current = await getCurrentUser(request, locals);
  if (!current) {
    return new Response(JSON.stringify({ message: '未登录' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  if (current.role !== 'admin') {
    return new Response(JSON.stringify({ message: '无权限访问' }), { status: 403, headers: { 'content-type': 'application/json' } });
  }

  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ message: '缺少用户 ID' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const target = await findUserById(db, id);
  if (!target) {
    return new Response(JSON.stringify({ message: '用户不存在' }), { status: 404, headers: { 'content-type': 'application/json' } });
  }

  if (target.role === 'admin') {
    return new Response(JSON.stringify({ message: '不能修改管理员角色' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const body = await request.json();
  const role = body.role === 'bot' ? 'bot' : 'author';
  await updateUserRoleById(db, id, role);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
};
