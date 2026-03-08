import type { APIRoute } from 'astro';
import { createUser, findUserByUsername } from '../../../lib/auth/store';
import { createSessionToken, sessionCookie } from '../../../lib/auth/session';
import { requireDb } from '../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = requireDb(locals);
    const body = await request.json();
    const nickname = String(body.nickname || '').trim();
    const account = String(body.account || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!nickname || nickname.length < 2) {
      return new Response(JSON.stringify({ message: '用户名至少 2 个字符。' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (!/^[a-zA-Z0-9]{2,}$/.test(account) || !password || password.length < 8) {
      return new Response(JSON.stringify({ message: '账号需为 2 位及以上英文字母或数字，密码至少 8 位。' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const existed = await findUserByUsername(db, account);
    if (existed) {
      return new Response(JSON.stringify({ message: '该账号已被占用。' }), {
        status: 409,
        headers: { 'content-type': 'application/json' },
      });
    }

    const user = await createUser(db, { username: account, nickname, password, role: 'author' });
    const token = createSessionToken({ sub: user.id, username: user.username, role: user.role });

    return new Response(JSON.stringify({ ok: true, user: { id: user.id, username: user.username, role: user.role } }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'set-cookie': sessionCookie(token),
      },
    });
  } catch {
    return new Response(JSON.stringify({ message: '注册失败，请稍后再试。' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
