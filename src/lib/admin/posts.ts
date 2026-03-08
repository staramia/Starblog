import fs from 'node:fs/promises';
import path from 'node:path';

const postsDir = path.join(process.cwd(), 'src/content/posts');

export interface ManagedPost {
  slug: string;
  authorId: string;
  postCategory: 'article' | 'report';
  title: string;
  excerpt: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
  updatedAt?: string;
  content: string;
}

function stripQuotes(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function extractLine(frontmatter: string, pattern: RegExp) {
  const match = frontmatter.match(pattern);
  return match ? stripQuotes(match[1]) : '';
}

function parsePostFile(content: string, slug: string): ManagedPost {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const frontmatter = match?.[1] ?? '';
  const body = match?.[2] ?? '';

  const tagsRaw = extractLine(frontmatter, /^\s{4}tags:\s*\[(.*)\]$/m);
  const tags = tagsRaw
    ? tagsRaw
        .split(',')
        .map((tag) => stripQuotes(tag))
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  return {
    slug,
    authorId: extractLine(frontmatter, /^authorId:\s*(.*)$/m),
    postCategory: (extractLine(frontmatter, /^postCategory:\s*(.*)$/m) as 'article' | 'report') || 'article',
    title: extractLine(frontmatter, /^title:\s*(.*)$/m) || slug,
    excerpt: extractLine(frontmatter, /^\s{4}excerpt:\s*(.*)$/m),
    tags,
    status: (extractLine(frontmatter, /^\s{4}status:\s*(.*)$/m) as 'draft' | 'published') || 'draft',
    publishedAt: extractLine(frontmatter, /^publishedAt:\s*(.*)$/m) || undefined,
    updatedAt: extractLine(frontmatter, /^updatedAt:\s*(.*)$/m) || undefined,
    content: body,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function toFrontmatter(post: ManagedPost) {
  const tags = post.tags.map((tag) => `"${tag.replace(/"/g, '')}"`).join(', ');
  const lines = [
    '---',
    `authorId: "${post.authorId}"`,
    `postCategory: "${post.postCategory}"`,
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    post.publishedAt ? `publishedAt: "${post.publishedAt}"` : '',
    `updatedAt: "${post.updatedAt || new Date().toISOString()}"`,
    'advanced:',
    '  discriminant: true',
    '  value:',
    `    excerpt: "${(post.excerpt || '').replace(/"/g, '\\"')}"`,
    `    tags: [${tags}]`,
    `    status: "${post.status}"`,
    '---',
    '',
    post.content || '',
    '',
  ].filter((line) => line !== '');
  return lines.join('\n');
}

function postFilePath(slug: string) {
  return path.join(postsDir, `${slug}.mdoc`);
}

export async function listManagedPosts(authorId?: string) {
  await fs.mkdir(postsDir, { recursive: true });
  const entries = await fs.readdir(postsDir);
  const files = entries.filter((name) => name.endsWith('.mdoc') || name.endsWith('.md'));
  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.(md|mdoc)$/i, '');
      const absolutePath = path.join(postsDir, file);
      const raw = await fs.readFile(absolutePath, 'utf-8');
      const post = parsePostFile(raw, slug);
      const stat = await fs.stat(absolutePath);
      return {
        ...post,
        updatedAt: post.updatedAt || stat.mtime.toISOString(),
      };
    })
  );

  posts.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  if (!authorId) return posts;
  return posts.filter((post) => post.authorId && post.authorId === authorId);
}

export async function getManagedPost(slug: string) {
  const filePath = postFilePath(slug);
  const raw = await fs.readFile(filePath, 'utf-8');
  return parsePostFile(raw, slug);
}

export async function createManagedPost(input: Partial<ManagedPost>) {
  const slug = slugify(input.slug || input.title || `post-${Date.now()}`);
  const filePath = postFilePath(slug);

  try {
    await fs.access(filePath);
    throw new Error('SLUG_EXISTS');
  } catch {
    // proceed when file does not exist
  }

  const now = new Date().toISOString();
  const status: 'draft' | 'published' = input.status === 'published' ? 'published' : 'draft';
  const post: ManagedPost = {
    slug,
    authorId: String(input.authorId || ''),
    postCategory: (input.postCategory as 'article' | 'report') || 'article',
    title: input.title || slug,
    excerpt: input.excerpt || '',
    tags: input.tags || [],
    status,
    publishedAt: status === 'published' ? now : undefined,
    updatedAt: now,
    content: input.content || '',
  };

  await fs.writeFile(filePath, toFrontmatter(post), 'utf-8');
  return post;
}

export async function updateManagedPost(slug: string, input: Partial<ManagedPost>) {
  const current = await getManagedPost(slug);
  const now = new Date().toISOString();
  const status: 'draft' | 'published' = input.status === 'published' ? 'published' : 'draft';

  const merged: ManagedPost = {
    ...current,
    ...input,
    slug,
    authorId: current.authorId,
    postCategory: current.postCategory,
    status,
    updatedAt: now,
    publishedAt: current.publishedAt || (status === 'published' ? now : undefined),
    tags: input.tags || current.tags,
  };

  await fs.writeFile(postFilePath(slug), toFrontmatter(merged), 'utf-8');
  return merged;
}

export async function deleteManagedPost(slug: string) {
  await fs.rm(postFilePath(slug), { force: true });
}
