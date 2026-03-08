export type UserRole = 'author' | 'bot' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
  nickname: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

export interface SessionPayload {
  sub: string;
  username: string;
  role: UserRole;
  exp: number;
}
