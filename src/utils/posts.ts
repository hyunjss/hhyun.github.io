import matter from 'gray-matter';
import type { Post, PostMeta } from '../types';

// Vite의 import.meta.glob으로 마크다운 파일을 모두 불러옴
const postFiles = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true });

function calcReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getAllPosts(): PostMeta[] {
  return Object.entries(postFiles)
    .map(([filepath, raw]) => {
      const { data, content } = matter(raw as string);
      const slug = filepath.replace('../posts/', '').replace('.md', '');
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? '',
        category: data.category ?? '기타',
        tags: data.tags ?? [],
        description: data.description ?? '',
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
  const { data, content } = matter(entry[1] as string);
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    category: data.category ?? '기타',
    tags: data.tags ?? [],
    description: data.description ?? '',
    readingTime: calcReadingTime(content),
    content,
  };
}

export function getAllCategories(): string[] {
  const posts = getAllPosts();
  return [...new Set(posts.map((p) => p.category))];
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  return [...new Set(posts.flatMap((p) => p.tags))];
}
