export type D1Like = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T = Record<string, unknown>>() => Promise<T | null>;
      all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
      run: () => Promise<unknown>;
    };
  };
};

export function requireDb(locals: unknown): D1Like {
  const db = (locals as { runtime?: { env?: { DB?: D1Like } } })?.runtime?.env?.DB;
  if (!db) {
    throw new Error('Cloudflare D1 binding `DB` is missing.');
  }
  return db;
}
