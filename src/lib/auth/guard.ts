import { findUserById } from './store';
import { getSessionFromRequest } from './session';

export async function getCurrentUser(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) return null;
  return findUserById(session.sub);
}
