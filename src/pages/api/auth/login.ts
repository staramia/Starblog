import type { APIRoute } from 'astro';
import { findUserByUsername, verifyPassword } from '../../../lib/auth/store';
import { createSessionToken, sessionCookie } from '../../../lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const account = String(body.account || '').trim().toLowerCase();
    const password = String(body.password || '');

    const user = await findUserByUsername(account);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return new Response(JSON.stringify({ message: '用户名或密码错误。' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    const token = createSessionToken({ sub: user.id, username: user.username, role: user.role });
    return new Response(JSON.stringify({ ok: true, user: { id: user.id, username: user.username, role: user.role } }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'set-cookie': sessionCookie(token),
      },
    });
  } catch {
    return new Response(JSON.stringify({ message: '登录失败，请稍后再试。' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
