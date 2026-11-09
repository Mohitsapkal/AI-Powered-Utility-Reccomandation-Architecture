'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wrench, Filter, Search, Flame, Sparkles } from 'lucide-react';
import { Tool, Category } from '@/types';
import { cralyApi } from '@/services/api';
import ToolCard from '@/components/ToolCard';

function ToolsContent() {
  const searchParams = useSearchParams();
  const initialTrending = searchParams.get('trending') === 'true';

  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [onlyTrending, setOnlyTrending] = useState<boolean>(initialTrending);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [toolList, catList] = await Promise.all([
        cralyApi.getTools({ trending: onlyTrending ? true : undefined }),
        cralyApi.getCategories(),
      ]);
      setTools(toolList);
      setCategories(catList);
      setIsLoading(false);
    }
    loadData();
  }, [onlyTrending]);

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      !searchQuery ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const catName = typeof tool.category === 'object' && tool.category !== null ? (tool.category as any).name : tool.category;
    const matchesCategory =
      selectedCategory === 'all' ||
      catName?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesPricing =
      selectedPricing === 'all' ||
      tool.pricing?.toLowerCase() === selectedPricing.toLowerCase() ||
      tool.pricingModel?.toLowerCase() === selectedPricing.toLowerCase();

    return matchesSearch && matchesCategory && matchesPricing;
  });

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Wrench size={22} color="var(--accent-blue)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            AI Tools Directory
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
          Explore 400+ Verified AI Tools
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>
          Filter by capability, pricing model, and domain. Every tool is categorized with direct access links and community ratings.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#0D0F18',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
          }}
        >
          <Search size={18} color="var(--accent-blue)" />
          <input
            type="text"
            placeholder="Search by tool name, tag (e.g. #Voice, #Coding), or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                backgroundColor: '#1E2335',
                color: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id || cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Pricing Filter */}
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '10px' }}>
              Pricing:
            </span>
            <select
              value={selectedPricing}
              onChange={(e) => setSelectedPricing(e.target.value)}
              style={{
                backgroundColor: '#1E2335',
                color: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Pricing</option>
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Trending Toggle */}
          <button
            onClick={() => setOnlyTrending(!onlyTrending)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: onlyTrending ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: onlyTrending ? '#EF4444' : 'var(--text-secondary)',
              border: onlyTrending ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <Flame size={14} /> Trending Only
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Showing <strong style={{ color: '#FFFFFF' }}>{filteredTools.length}</strong> AI tools
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          Loading AI tools directory...
        </div>
      ) : filteredTools.length > 0 ? (
        <div className="grid-cards">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id || tool._id} tool={tool} />
          ))}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <Wrench size={40} color="var(--accent-blue)" style={{ marginBottom: '14px' }} />
          <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '8px' }}>No tools matched your criteria</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Try clearing your filters or search keywords.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedPricing('all');
              setOnlyTrending(false);
            }}
            className="btn btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading AI tools directory...
        </div>
      }
    >
      <ToolsContent />
    </Suspense>
  );
}
