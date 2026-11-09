'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Wrench, Layers, Flame, MessageSquare, ArrowRight } from 'lucide-react';
import { SearchResults } from '@/types';
import { cralyApi } from '@/services/api';
import ToolCard from '@/components/ToolCard';
import WorkflowCard from '@/components/WorkflowCard';
import PostCard from '@/components/PostCard';
import { BRAND } from '@/config/brand';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'tools' | 'workflows' | 'posts'>('all');

  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await cralyApi.search(query);
      setResults(res);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResults =
    (results?.tools.length || 0) +
    (results?.workflows.length || 0) +
    (results?.categories.length || 0) +
    (results?.posts.length || 0);

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Search Header Bar */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px' }}>
          Search {BRAND.name} Index
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#121524',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            maxWidth: '720px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Search size={20} color="var(--accent-blue)" />
          <input
            type="text"
            placeholder="Type any keyword, tool name, or prompt topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      {results && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto' }}>
          {[
            { key: 'all', label: `All Matches (${totalResults})` },
            { key: 'tools', label: `Tools (${results.tools.length})` },
            { key: 'workflows', label: `Workflows (${results.workflows.length})` },
            { key: 'posts', label: `Feed Posts (${results.posts.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeTab === tab.key ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.05)',
                color: '#FFFFFF',
                border: activeTab === tab.key ? 'none' : '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Searching AI catalog...
        </div>
      )}

      {/* Results Display */}
      {!isLoading && results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Tools */}
          {(activeTab === 'all' || activeTab === 'tools') && results.tools.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={18} color="var(--accent-blue)" /> Matching AI Tools ({results.tools.length})
              </h2>
              <div className="grid-cards">
                {results.tools.map((tool) => (
                  <ToolCard key={tool.id || tool._id} tool={tool} />
                ))}
              </div>
            </section>
          )}

          {/* Workflows */}
          {(activeTab === 'all' || activeTab === 'workflows') && results.workflows.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--accent-purple)" /> Matching Workflows ({results.workflows.length})
              </h2>
              <div className="grid-cards">
                {results.workflows.map((wf) => (
                  <WorkflowCard key={wf.id || wf._id} workflow={wf} />
                ))}
              </div>
            </section>
          )}

          {/* Posts */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="var(--accent-cyan)" /> Community Posts ({results.posts.length})
              </h2>
              <div className="grid-cards">
                {results.posts.map((post) => (
                  <PostCard key={post.id || post._id} post={post} />
                ))}
              </div>
            </section>
          )}

          {totalResults === 0 && (
            <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No results found for &quot;{query}&quot;. Try a broader search keyword.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading search...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
