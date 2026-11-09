'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageSquare,
  Share2,
  Copy,
  Check,
  Eye,
  Play,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { Post } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { isLikedPost, toggleLikePost } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const postId = post.id || post._id || '';
  const isLiked = isLikedPost(postId) || post.isLiked;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLikePost(postId);
    showToast(isLiked ? 'Removed upvote' : 'Upvoted post!');
  };

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.prompt?.content) {
      navigator.clipboard.writeText(post.prompt.content);
      setCopied(true);
      showToast('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
      showToast('Post link copied to clipboard!');
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        height: '100%',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span
            className="badge"
            style={{
              background:
                post.postType === 'prompt'
                  ? 'rgba(139, 92, 246, 0.15)'
                  : post.postType === 'video'
                  ? 'rgba(236, 72, 153, 0.15)'
                  : 'rgba(74, 144, 226, 0.15)',
              color:
                post.postType === 'prompt'
                  ? '#C084FC'
                  : post.postType === 'video'
                  ? '#F472B6'
                  : '#60A5FA',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {post.postType?.toUpperCase() || 'PROMPT'}
          </span>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}
          </span>
        </div>

        {/* Post Title */}
        <Link href={`/posts/${postId}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '10px',
              lineHeight: 1.4,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          >
            {post.title}
          </h3>
        </Link>

        {/* Post Body Snippet */}
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.body}
        </p>

        {/* Media Preview */}
        {post.media?.url && (
          <div
            style={{
              width: '100%',
              height: '220px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: '16px',
              backgroundColor: '#1E2333',
              position: 'relative',
            }}
          >
            <img
              src={post.media.url}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {post.media.type === 'video' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <Play size={20} color="#000000" fill="#000000" style={{ marginLeft: '2px' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Copyable Prompt Box */}
        {post.prompt?.content && (
          <div
            style={{
              backgroundColor: '#0E111B',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              marginBottom: '18px',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '0.75rem',
                color: '#C084FC',
                fontWeight: 600,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={13} /> COPYABLE PROMPT
              </span>
              <button
                onClick={handleCopyPrompt}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  background: copied ? 'rgba(16, 163, 127, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                  color: copied ? '#10B981' : '#C084FC',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: '#E2E8F0',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.prompt.content}
            </p>
          </div>
        )}

        {/* Tag pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {post.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Engagement Stats Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '14px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleLike}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isLiked ? '#EF4444' : 'inherit',
            }}
          >
            <Heart size={16} fill={isLiked ? '#EF4444' : 'none'} />
            <span>{post.likes + (isLiked ? 1 : 0)}</span>
          </button>

          <Link
            href={`/posts/${postId}#comments`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit' }}
          >
            <MessageSquare size={16} />
            <span>{post.commentsCount || 0}</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={16} />
            <span>{post.viewsCount || 120}</span>
          </div>
        </div>

        <button
          onClick={handleShare}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}
          title="Share post"
        >
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
}
