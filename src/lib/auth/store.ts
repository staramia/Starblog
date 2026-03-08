import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { AuthUser, UserRole } from './types';

const dataDir = path.join(process.cwd(), '.data');
const usersFile = path.join(dataDir, 'users.json');

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(usersFile);
  } catch {
    await fs.writeFile(usersFile, '[]', 'utf-8');
  }
}

async function readUsers(): Promise<AuthUser[]> {
  await ensureStore();
  const raw = await fs.readFile(usersFile, 'utf-8');
  const parsed = JSON.parse(raw) as Array<Partial<AuthUser> & { email?: string }>;
  return parsed.map((user) => {
    const fallbackName = user.email ? user.email.split('@')[0] : 'user';
    const username = (user.username || fallbackName || '').toLowerCase();
    return {
      id: String(user.id || randomBytes(8).toString('hex')),
      username,
      nickname: String(user.nickname || username || '创作者'),
      role: (user.role as UserRole) || 'author',
      passwordHash: String(user.passwordHash || ''),
      createdAt: String(user.createdAt || new Date().toISOString()),
    };
  });
}

async function writeUsers(users: AuthUser[]) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8');
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

export async function findUserByUsername(username: string) {
  const users = await readUsers();
  return users.find((user) => user.username.toLowerCase() === username.toLowerCase());
}

export async function findUserById(id: string) {
  const users = await readUsers();
  return users.find((user) => user.id === id);
}

export async function getUserDisplayNameById(id: string) {
  const user = await findUserById(id);
  if (!user) return '系统';
  return user.nickname || user.username || '系统';
}

export async function listUsers() {
  return readUsers();
}

export async function deleteUserById(id: string) {
  const users = await readUsers();
  const next = users.filter((user) => user.id !== id);
  await writeUsers(next);
}

export async function updateUserRoleById(id: string, role: UserRole) {
  const users = await readUsers();
  const next = users.map((user) => {
    if (user.id !== id) return user;
    return { ...user, role };
  });
  await writeUsers(next);
}

export async function createUser(params: {
  username: string;
  nickname: string;
  password: string;
  role?: UserRole;
}) {
  const users = await readUsers();
  const exists = users.some((user) => user.username.toLowerCase() === params.username.toLowerCase());
  if (exists) throw new Error('EMAIL_EXISTS');

  const user: AuthUser = {
    id: randomBytes(12).toString('hex'),
    username: params.username.trim().toLowerCase(),
    nickname: params.nickname.trim() || params.username.trim().toLowerCase(),
    role: params.role || 'author',
    passwordHash: hashPassword(params.password),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return user;
}
