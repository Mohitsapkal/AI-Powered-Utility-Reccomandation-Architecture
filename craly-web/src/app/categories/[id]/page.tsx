'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, ArrowLeft, Wrench, Sparkles } from 'lucide-react';
import { Category, Tool } from '@/types';
import { cralyApi } from '@/services/api';
import ToolCard from '@/components/ToolCard';

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const catId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategory() {
      setIsLoading(true);
      const [catData, toolData] = await Promise.all([
        cralyApi.getCategoryDetail(catId),
        cralyApi.getCategoryTools(catId),
      ]);
      setCategory(catData);
      setTools(toolData);
      setIsLoading(false);
    }
    loadCategory();
  }, [catId]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading category collection...
      </div>
    );
  }

  const title = category?.name || 'Category Collection';

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
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
        <ArrowLeft size={16} /> Back to Categories
      </button>

      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '40px',
          marginBottom: '40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Flame size={20} color="var(--accent-amber)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Category Spotlight
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
          {title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '720px' }}>
          {category?.description || 'Browse tools and applications verified under this discipline.'}
        </p>
      </div>

      {/* Tools List */}
      <div style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Found <strong style={{ color: '#FFFFFF' }}>{tools.length}</strong> AI tools in this category
      </div>

      {tools.length > 0 ? (
        <div className="grid-cards">
          {tools.map((tool) => (
            <ToolCard key={tool.id || tool._id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No tools listed under this category yet.</p>
        </div>
      )}
    </div>
  );
}
