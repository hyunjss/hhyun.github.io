import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllPosts, getAllCategories, getPostBySlug } from '../utils/posts';
import type { PostMeta, Post } from '../types';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import './BlogLayout.css';

const CATEGORY_ICONS: Record<string, string> = {
  '전체': '📋',
  'JavaScript': '🟨',
  'TypeScript': '🔷',
  'React': '⚛️',
  'FE': '🖥️',
  'CS': '🧠',
  '운영체제': '⚙️',
  '네트워크': '🌐',
  '자료구조': '🗂️',
  '알고리즘': '🔍',
  '기타': '📝',
};

function getCategoryIcon(cat: string) {
  return CATEGORY_ICONS[cat] ?? '📁';
}

export default function BlogLayout() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const allPosts = getAllPosts();
  const categories = ['전체', ...getAllCategories()];

  const [activeCategory, setActiveCategory] = useState('전체');
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (slug) {
      const post = getPostBySlug(slug);
      if (post) {
        setActivePost(post);
        setActiveCategory(post.category);
      }
    }
  }, [slug]);

  const filteredPosts: PostMeta[] = activeCategory === '전체'
    ? allPosts
    : allPosts.filter(p => p.category === activeCategory);

  function handleSelectPost(post: PostMeta) {
    const full = getPostBySlug(post.slug);
    setActivePost(full);
    navigate(`/post/${post.slug}`);
  }

  function handleSelectCategory(cat: string) {
    setActiveCategory(cat);
    setActivePost(null);
    navigate('/');
  }

  return (
    <div className="blog-layout">
      {/* 왼쪽: 카테고리 사이드바 */}
      <aside className="blog-sidebar">
        <div className="blog-sidebar__header">
          <span className="blog-sidebar__title">hhyun.dev</span>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            aria-label="테마 전환"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <nav className="blog-sidebar__nav">
          {categories.map(cat => (
            <button
              key={cat}
              className={`sidebar-item${activeCategory === cat && !activePost ? ' active' : ''}`}
              onClick={() => handleSelectCategory(cat)}
            >
              <span className="sidebar-item__icon">{getCategoryIcon(cat)}</span>
              <span className="sidebar-item__label">{cat}</span>
              <span className="sidebar-item__count">
                {cat === '전체' ? allPosts.length : allPosts.filter(p => p.category === cat).length}
              </span>
            </button>
          ))}
        </nav>
        <div className="blog-sidebar__footer">
          <button
            className={`sidebar-item${activePost === null && false ? ' active' : ''}`}
            onClick={() => navigate('/about')}
          >
            <span className="sidebar-item__icon">👤</span>
            <span className="sidebar-item__label">소개</span>
          </button>
        </div>
      </aside>

      {/* 가운데: 포스트 목록 */}
      <section className="blog-list">
        <div className="blog-list__header">
          <h2>{activeCategory}</h2>
          <span className="blog-list__count">{filteredPosts.length}개</span>
        </div>
        <div className="blog-list__items">
          {filteredPosts.length > 0 ? filteredPosts.map(post => (
            <button
              key={post.slug}
              className={`post-item${activePost?.slug === post.slug ? ' active' : ''}`}
              onClick={() => handleSelectPost(post)}
            >
              <div className="post-item__title">{post.title}</div>
              <div className="post-item__date">{post.date}</div>
              <div className="post-item__desc">{post.description}</div>
              <div className="post-item__tags">
                {post.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="post-tag">#{tag}</span>
                ))}
              </div>
            </button>
          )) : (
            <p className="blog-list__empty">포스트가 없습니다.</p>
          )}
        </div>
      </section>

      {/* 오른쪽: 포스트 내용 */}
      <main className="blog-content">
        {activePost ? (
          <div className="blog-content__inner">
            <header className="blog-content__header">
              <div className="blog-content__category">{activePost.category}</div>
              <h1 className="blog-content__title">{activePost.title}</h1>
              <div className="blog-content__meta">
                <span>{activePost.date}</span>
                <span>·</span>
                <span>{activePost.readingTime}분 읽기</span>
              </div>
              <div className="blog-content__tags">
                {activePost.tags.map(tag => (
                  <span key={tag} className="post-tag post-tag--lg">#{tag}</span>
                ))}
              </div>
            </header>
            <article className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeSlug]}
              >
                {activePost.content}
              </ReactMarkdown>
            </article>
          </div>
        ) : (
          <div className="blog-content__empty">
            <div className="blog-content__empty-icon">📝</div>
            <p>포스트를 선택해주세요</p>
          </div>
        )}
      </main>
    </div>
  );
}
