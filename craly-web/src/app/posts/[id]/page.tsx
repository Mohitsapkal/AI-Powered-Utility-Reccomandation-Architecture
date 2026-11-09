'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  ArrowLeft,
  Heart,
  Share2,
  Copy,
  Check,
  Terminal,
  Eye,
  Play,
  Sparkles,
} from 'lucide-react';
import { Post } from '@/types';
import { cralyApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import CommentThread from '@/components/CommentThread';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLikedPost, toggleLikePost } = useAuth();
  const { showToast } = useToast();

  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      setIsLoading(true);
      const data = await cralyApi.getPostDetail(postId);
      setPost(data);
      setIsLoading(false);
    }
    loadPost();
  }, [postId]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading post discussion...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Post not found</h2>
        <Link href="/posts" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Feed
        </Link>
      </div>
    );
  }

  const isLiked = isLikedPost(postId) || post.isLiked;

  const handleLike = () => {
    toggleLikePost(postId);
    showToast(isLiked ? 'Removed upvote' : 'Upvoted post!');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Post link copied to clipboard!');
    }
  };

  const handleCopyPrompt = () => {
    if (post.prompt?.content) {
      navigator.clipboard.writeText(post.prompt.content);
      setCopied(true);
      showToast('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px', maxWidth: '880px' }}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          marginBottom: '28px',
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={16} /> Back to Community Feed
      </button>

      {/* Main Post Article */}
      <article
        className="glass-card"
        style={{
          padding: '40px',
          marginBottom: '40px',
        }}
      >
        {/* Category & Time Meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span className="badge badge-brand">{post.postType?.toUpperCase() || 'PROMPT'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={14} /> {post.viewsCount || 240} views
            </span>
            <span>•</span>
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}</span>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '18px', lineHeight: 1.3 }}>
          {post.title}
        </h1>

        {/* Media */}
        {post.media?.url && (
          <div
            style={{
              width: '100%',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: '24px',
              backgroundColor: '#1E2333',
              position: 'relative',
            }}
          >
            <img
              src={post.media.url}
              alt={post.title}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Body Text */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '28px', whiteSpace: 'pre-line' }}>
          {post.body}
        </p>

        {/* Tested Prompt Block */}
        {post.prompt?.content && (
          <div
            style={{
              backgroundColor: '#0A0C14',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#C084FC', fontWeight: 700 }}>
                <Terminal size={16} /> READY-TO-USE PROMPT
              </span>
              <button
                onClick={handleCopyPrompt}
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied Prompt!' : 'Copy Prompt'}
              </button>
            </div>
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                color: '#F8FAFC',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}
            >
              {post.prompt.content}
            </pre>
          </div>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
          {post.tags?.map((tag) => (
            <span key={tag} className="tag-pill" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Bottom Actions Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '20px',
          }}
        >
          <button
            onClick={handleLike}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: isLiked ? '#EF4444' : '#FFFFFF',
              border: isLiked ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <Heart size={16} fill={isLiked ? '#EF4444' : 'none'} />
            <span>{post.likes + (isLiked ? 1 : 0)} Upvotes</span>
          </button>

          <button onClick={handleShare} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Share2 size={16} /> Share Post
          </button>
        </div>
      </article>

      {/* Embedded Threaded Nested Comments */}
      <CommentThread postId={postId} />
    </div>
  );
}
