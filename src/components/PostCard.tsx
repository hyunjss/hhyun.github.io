import { Link } from 'react-router-dom';
import type { PostMeta } from '../types';
import './PostCard.css';

interface Props {
  post: PostMeta;
}

export default function PostCard({ post }: Props) {
  return (
    <Link to={`/post/${post.slug}`} className="post-card">
      <div className="post-card__category">{post.category}</div>
      <h2 className="post-card__title">{post.title}</h2>
      <p className="post-card__desc">{post.description}</p>
      <div className="post-card__footer">
        <span className="post-card__date">{post.date}</span>
        <span className="post-card__reading">{post.readingTime}분 읽기</span>
      </div>
      <div className="post-card__tags">
        {post.tags.map(tag => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
      </div>
    </Link>
  );
}
