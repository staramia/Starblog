import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../../lib/auth/guard';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const user = await getCurrentUser(request, locals);
  if (!user) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
      },
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }
  );
};
