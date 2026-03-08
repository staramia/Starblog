import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': clearSessionCookie(),
    },
  });
};
