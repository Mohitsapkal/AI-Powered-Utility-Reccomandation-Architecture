import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, Sparkles, Wrench } from 'lucide-react';
import { cralyApi } from '@/services/api';
import { Category } from '@/types';

export default async function CategoriesPage() {
  const categories = await cralyApi.getCategories();

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Flame size={22} color="var(--accent-amber)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Collections
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
          AI Tool Categories
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>
          Browse curated directories grouped by functional AI modality and creative industry discipline.
        </p>
      </div>

      {/* Categories Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {categories.map((cat: Category) => (
          <Link
            key={cat.id || cat._id}
            href={`/categories/${cat.id || cat._id}`}
            className="glass-card"
            style={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={20} color="var(--accent-amber)" />
                </div>
                <span className="badge badge-amber">
                  {(cat.toolsCount ?? cat.toolCount ?? cat.tools?.length) ? `${cat.toolsCount ?? cat.toolCount ?? cat.tools?.length} Tools` : 'Curated Tools'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                {cat.name}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {cat.description || 'Curated high-performing models and interfaces for production workflows.'}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                color: 'var(--accent-blue)',
                fontWeight: 600,
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              Browse Category <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
