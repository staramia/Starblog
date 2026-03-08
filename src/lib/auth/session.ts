import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SessionPayload, UserRole } from './types';

const COOKIE_NAME = 'sb_session';
const EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production and must be at least 32 characters long.');
  }
  return 'dev-only-secret-change-me';
}

function base64url(value: string) {
  return Buffer.from(value).toString('base64url');
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

export function createSessionToken(payload: Omit<SessionPayload, 'exp'>) {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + EXPIRES_IN_SECONDS,
  };
  const encoded = base64url(JSON.stringify(full));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookie(raw: string | null, name: string) {
  if (!raw) return null;
  const parts = raw.split(';').map((part) => part.trim());
  const key = `${name}=`;
  const pair = parts.find((part) => part.startsWith(key));
  return pair ? decodeURIComponent(pair.slice(key.length)) : null;
}

export function getSessionFromRequest(req: Request) {
  const token = parseCookie(req.headers.get('cookie'), COOKIE_NAME);
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookie(token: string) {
  const maxAge = EXPIRES_IN_SECONDS;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function requireRole(role: UserRole, current: UserRole) {
  const rank: Record<UserRole, number> = { author: 1, bot: 1, admin: 3 };
  return rank[current] >= rank[role];
}
