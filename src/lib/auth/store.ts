import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { D1Like } from '../db';
import type { AuthUser, UserRole } from './types';

type UserRow = {
  id: string;
  username: string;
  nickname: string;
  role: UserRole;
  password_hash: string;
  created_at: string;
};

function mapUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    role: row.role,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, 'hex');
  if (candidate.length !== original.length) return false;
  return timingSafeEqual(candidate, original);
}

export async function findUserByUsername(db: D1Like, username: string) {
  const normalized = username.trim().toLowerCase();
  const row = await db
    .prepare('SELECT id, username, nickname, role, password_hash, created_at FROM users WHERE username = ? LIMIT 1')
    .bind(normalized)
    .first<UserRow>();
  return row ? mapUser(row) : undefined;
}

export async function findUserById(db: D1Like, id: string) {
  const row = await db
    .prepare('SELECT id, username, nickname, role, password_hash, created_at FROM users WHERE id = ? LIMIT 1')
    .bind(id)
    .first<UserRow>();
  return row ? mapUser(row) : undefined;
}

export async function getUserDisplayNameById(db: D1Like, id: string) {
  const user = await findUserById(db, id);
  if (!user) return '系统';
  return user.nickname || user.username || '系统';
}

export async function listUsers(db: D1Like) {
  const { results } = await db
    .prepare('SELECT id, username, nickname, role, password_hash, created_at FROM users ORDER BY datetime(created_at) DESC')
    .bind()
    .all<UserRow>();
  return results.map(mapUser);
}

export async function deleteUserById(db: D1Like, id: string) {
  await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
}

export async function updateUserRoleById(db: D1Like, id: string, role: UserRole) {
  await db.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, id).run();
}

export async function createUser(
  db: D1Like,
  params: {
    username: string;
    nickname: string;
    password: string;
    role?: UserRole;
  }
) {
  const normalized = params.username.trim().toLowerCase();
  const exists = await findUserByUsername(db, normalized);
  if (exists) throw new Error('EMAIL_EXISTS');

  const user: AuthUser = {
    id: randomBytes(12).toString('hex'),
    username: normalized,
    nickname: params.nickname.trim() || normalized,
    role: params.role || 'author',
    passwordHash: hashPassword(params.password),
    createdAt: new Date().toISOString(),
  };

  await db
    .prepare('INSERT INTO users (id, username, nickname, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(user.id, user.username, user.nickname, user.role, user.passwordHash, user.createdAt)
    .run();
  return user;
}
