import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { getPostBySlug } from '../utils/posts';
import 'highlight.js/styles/github-dark.css';
import './PostDetail.css';

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = slug ? getPostBySlug(slug) : null;

  if (!post) {
    return (
      <main className="container post-not-found">
        <p>포스트를 찾을 수 없어요.</p>
        <Link to="/">← 홈으로</Link>
      </main>
    );
  }

  return (
    <main className="container post-detail">
      <button className="post-detail__back" onClick={() => navigate(-1)}>← 뒤로</button>

      <header className="post-detail__header">
        <div className="post-detail__category">{post.category}</div>
        <h1 className="post-detail__title">{post.title}</h1>
        <div className="post-detail__meta">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readingTime}분 읽기</span>
        </div>
        <div className="post-detail__tags">
          {post.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      </header>

      <article className="post-detail__content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSlug]}
        >
          {post.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}
