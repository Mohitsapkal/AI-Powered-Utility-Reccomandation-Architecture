'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Flame, Filter, Sparkles, Terminal, Video, FileText } from 'lucide-react';
import { Post } from '@/types';
import { cralyApi } from '@/services/api';
import PostCard from '@/components/PostCard';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      const data = await cralyApi.getPosts(1, 20, selectedType === 'all' ? undefined : selectedType);
      setPosts(data);
      setIsLoading(false);
    }
    loadPosts();
  }, [selectedType]);

  const postTypes = [
    { label: 'All Feed', value: 'all', icon: Sparkles },
    { label: 'Prompts', value: 'prompt', icon: Terminal },
    { label: 'Tool Showcases', value: 'tool', icon: Flame },
    { label: 'Video Demos', value: 'video', icon: Video },
    { label: 'Articles', value: 'article', icon: FileText },
  ];

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Title */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <MessageSquare size={22} color="var(--accent-blue)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Creator Feed
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
          Community Prompts & Showcases
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>
          Real test runs, high-performing prompts, and generative case studies posted by AI creators and engineers.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '36px', overflowX: 'auto', paddingBottom: '6px' }}>
        {postTypes.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedType === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isActive ? 'var(--gradient-brand)' : 'rgba(255, 255, 255, 0.05)',
                color: '#FFFFFF',
                border: isActive ? 'none' : '1px solid var(--border-subtle)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          Loading community feed...
        </div>
      ) : (
        <div className="grid-cards">
          {posts.map((post) => (
            <PostCard key={post.id || post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
