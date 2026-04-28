import type { Post, PostMeta } from '../types';

const postFiles = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true });

// gray-matter 없이 브라우저에서 동작하는 frontmatter 파서
function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const yamlStr = match[1];
  const content = match[2];
  const data: Record<string, unknown> = {};

  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value: unknown = line.slice(colonIdx + 1).trim();

    // 배열 파싱 ["a", "b"] or [a, b]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''));
    } else if (typeof value === 'string') {
      // 따옴표 제거
      value = (value as string).replace(/^["']|["']$/g, '');
    }
    data[key] = value;
  }

  return { data, content };
}

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

export function getAllPosts(): PostMeta[] {
  return Object.entries(postFiles)
    .map(([filepath, raw]) => {
      const { data, content } = parseFrontmatter(raw as string);
      const slug = filepath.replace('../posts/', '').replace('.md', '');
      return {
        slug,
        title: (data.title as string) ?? slug,
        date: (data.date as string) ?? '',
        category: (data.category as string) ?? '기타',
        tags: (data.tags as string[]) ?? [],
        description: (data.description as string) ?? '',
        readingTime: calcReadingTime(content),
      } as PostMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const entry = Object.entries(postFiles).find(([filepath]) =>
    filepath.includes(`/${slug}.md`)
  );
  if (!entry) return null;
  const { data, content } = parseFrontmatter(entry[1] as string);
  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? '',
    category: (data.category as string) ?? '기타',
    tags: (data.tags as string[]) ?? [],
    description: (data.description as string) ?? '',
    readingTime: calcReadingTime(content),
    content,
  };
}

export function getAllCategories(): string[] {
  return [...new Set(getAllPosts().map((p) => p.category))];
}

export function getAllTags(): string[] {
  return [...new Set(getAllPosts().flatMap((p) => p.tags))];
}
