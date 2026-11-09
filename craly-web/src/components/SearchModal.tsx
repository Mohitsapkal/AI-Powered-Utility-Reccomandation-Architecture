'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Wrench, Layers, Flame, MessageSquare, ArrowRight, History } from 'lucide-react';
import { cralyApi, getFaviconUrl } from '@/services/api';
import { SearchResults } from '@/types';
import { BRAND } from '@/config/brand';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('craly_search_history');
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch {}
      }
    }

    const handleLogout = () => {
      setHistory([]);
      setQuery('');
      setResults(null);
    };
    window.addEventListener('aura:logout', handleLogout);
    return () => window.removeEventListener('aura:logout', handleLogout);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await cralyApi.search(query);
      setResults(res);
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const saveHistory = (q: string) => {
    if (!q.trim()) return;
    const updated = [q.trim(), ...history.filter((item) => item !== q.trim())].slice(0, 6);
    setHistory(updated);
    localStorage.setItem('craly_search_history', JSON.stringify(updated));
  };

  const handleSelectHistory = (term: string) => {
    setQuery(term);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('craly_search_history');
  };

  const handleNavigate = (url: string) => {
    saveHistory(query);
    onClose();
    router.push(url);
  };

  if (!isOpen) return null;

  const hasResults =
    results &&
    (results.tools.length > 0 ||
      results.workflows.length > 0 ||
      results.categories.length > 0 ||
      results.posts.length > 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 20px 20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card slide-up"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#121522',
          border: '1px solid rgba(250, 58, 82, 0.35)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Search size={22} color="var(--brand-pink)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search AI tools, workflows, prompts, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: '#FFFFFF',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ color: 'var(--text-muted)', padding: '4px' }}
            >
              <X size={18} />
            </button>
          )}
          <span
            style={{
              padding: '2px 8px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Content Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '24px',
                  border: '2px solid rgba(250, 58, 82, 0.2)',
                  borderTopColor: 'var(--brand-pink)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '10px',
                }}
              />
              <div>Searching {BRAND.name} index...</div>
            </div>
          )}

          {/* Recent Search History (when query is empty) */}
          {!query && history.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Recent Searches
                </span>
                <button
                  onClick={handleClearHistory}
                  style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Clear all
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {history.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectHistory(term)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <History size={13} color="var(--accent-blue)" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {!isLoading && query && !hasResults && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>No matches found for &quot;{query}&quot;</p>
              <p style={{ fontSize: '0.85rem' }}>Try searching by category (e.g. &quot;video&quot; or &quot;coding&quot;) or tool name.</p>
            </div>
          )}

          {/* Results grouped */}
          {!isLoading && results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Tools Group */}
              {results.tools.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wrench size={14} color="var(--accent-blue)" /> AI Tools ({results.tools.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {results.tools.slice(0, 5).map((tool) => {
                      const logo = tool.logoUrl || getFaviconUrl(tool.url || tool.websiteUrl);
                      return (
                        <div
                          key={tool.id || tool._id}
                          onClick={() => handleNavigate(`/tools/${tool.id || tool._id}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            border: '1px solid transparent',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.3)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                background: '#1E2333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                              }}
                            >
                              {logo ? (
                                <img src={logo} alt={tool.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                              ) : (
                                <Wrench size={16} color="var(--accent-blue)" />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFFFFF' }}>{tool.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tool.category || 'AI Tool'}</div>
                            </div>
                          </div>
                          <span className="badge badge-brand">{tool.pricing || 'Free'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Workflows Group */}
              {results.workflows.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} color="var(--accent-purple)" /> Workflows ({results.workflows.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {results.workflows.slice(0, 3).map((wf) => (
                      <div
                        key={wf.id || wf._id}
                        onClick={() => handleNavigate(`/workflows/${wf.id || wf._id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFFFFF' }}>{wf.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {wf.steps} Steps • {wf.duration}
                          </div>
                        </div>
                        <ArrowRight size={16} color="var(--text-muted)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Group */}
              {results.categories.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={14} color="var(--accent-amber)" /> Categories ({results.categories.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {results.categories.map((cat) => (
                      <div
                        key={cat.id || cat._id}
                        onClick={() => handleNavigate(`/categories/${cat.id || cat._id}`)}
                        style={{
                          padding: '8px 14px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
