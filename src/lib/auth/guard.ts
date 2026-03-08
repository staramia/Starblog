import { findUserById } from './store';
import { getSessionFromRequest } from './session';
import { requireDb } from '../db';

export async function getCurrentUser(req: Request, locals: unknown) {
  const session = getSessionFromRequest(req);
  if (!session) return null;
  const db = requireDb(locals);
  return findUserById(db, session.sub);
}
