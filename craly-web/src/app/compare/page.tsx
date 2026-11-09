'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftRight,
  Plus,
  X,
  ExternalLink,
  Check,
  Minus,
  Sparkles,
  Share2,
  Trash2,
  Search,
  Wrench,
  Flame,
  Heart,
  ArrowRight,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { Tool, Category } from '@/types';
import { cralyApi, getFaviconUrl } from '@/services/api';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { BRAND } from '@/config/brand';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedTools, addTool, removeTool, clearCompare, loadToolsByIds, maxTools } = useCompare();
  const { isLikedTool, toggleLikeTool } = useAuth();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [quickPairLoading, setQuickPairLoading] = useState(false);

  // Sync URL query params if present, e.g. /compare?ids=aiva,adcreative_ai
  useEffect(() => {
    const urlIds = searchParams.get('ids');
    if (urlIds) {
      const ids = urlIds.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) {
        loadToolsByIds(ids);
      }
    }
  }, [searchParams, loadToolsByIds]);

  // Keep URL query in sync when selectedTools change
  useEffect(() => {
    if (selectedTools.length > 0) {
      const ids = selectedTools.map((t) => t.id || t._id).join(',');
      const currentParam = searchParams.get('ids');
      if (currentParam !== ids) {
        router.replace(`/compare?ids=${ids}`, { scroll: false });
      }
    } else {
      if (searchParams.get('ids')) {
        router.replace('/compare', { scroll: false });
      }
    }
  }, [selectedTools, router, searchParams]);

  // Load available live tools from backend for the Add Tool modal & Quick suggestions
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [toolsData, catData] = await Promise.all([
          cralyApi.getTools({ limit: 60 }),
          cralyApi.getCategories(1, 20),
        ]);
        setAvailableTools(toolsData);
        setCategories(catData);
      } catch (err) {
        console.warn('Could not load tool catalog for comparison:', err);
      }
    }
    loadCatalog();
  }, []);

  // Filter available tools inside the modal
  const filteredModalTools = useMemo(() => {
    const selectedIds = new Set(selectedTools.map((t) => t.id || t._id));
    return availableTools.filter((t) => {
      const id = t.id || t._id;
      if (selectedIds.has(id)) return false;

      const matchesSearch =
        !modalSearch ||
        t.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
        t.shortDescription?.toLowerCase().includes(modalSearch.toLowerCase()) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(modalSearch.toLowerCase()));

      const catName = typeof t.category === 'object' && t.category !== null ? (t.category as any).name : t.category;
      const matchesCategory =
        selectedCatFilter === 'all' ||
        catName?.toLowerCase() === selectedCatFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [availableTools, selectedTools, modalSearch, selectedCatFilter]);

  // Handle Share comparison link
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Comparison link copied to clipboard!');
    }
  };

  // Quick compare pair selection
  const handleSelectPair = async (toolA: Tool, toolB: Tool) => {
    setQuickPairLoading(true);
    clearCompare();
    addTool(toolA);
    addTool(toolB);
    setQuickPairLoading(false);
    showToast(`Comparing ${toolA.name} and ${toolB.name}!`);
  };

  // Extract all unique feature keys across selected tools
  const featureKeys = useMemo(() => {
    const keys = new Set<string>();
    selectedTools.forEach((tool) => {
      if (tool.features && typeof tool.features === 'object') {
        Object.keys(tool.features).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [selectedTools]);

  return (
    <div className="container" style={{ padding: '40px 24px 100px' }}>
      {/* ==================== PAGE HEADER ==================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
          marginBottom: '36px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #EE7433 0%, #FA3A52 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <ArrowLeftRight size={16} />
            </div>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#EE7433',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Side-by-Side Matrix
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
            Compare AI Tools
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', lineHeight: 1.6 }}>
            Benchmark capabilities, pricing models, verified features, and specialized use cases side-by-side to make the right architectural choice.
          </p>
        </div>

        {/* Global Compare Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {selectedTools.length > 0 && (
            <>
              <button
                onClick={() => setHighlightDifferences(!highlightDifferences)}
                className="btn btn-secondary"
                style={{
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                  borderColor: highlightDifferences ? 'rgba(238, 116, 51, 0.6)' : undefined,
                  color: highlightDifferences ? '#EE7433' : 'var(--text-secondary)',
                  backgroundColor: highlightDifferences ? 'rgba(238, 116, 51, 0.12)' : undefined,
                }}
              >
                <SlidersHorizontal size={14} />
                {highlightDifferences ? 'Highlighting Differences' : 'Highlight Differences'}
              </button>

              <button
                onClick={handleShare}
                className="btn btn-secondary"
                style={{ padding: '9px 14px', fontSize: '0.85rem' }}
                title="Share comparison link"
              >
                <Share2 size={15} /> Share
              </button>

              <button
                onClick={clearCompare}
                className="btn btn-secondary"
                style={{ padding: '9px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}
                title="Clear all tools"
              >
                <Trash2 size={15} /> Clear All
              </button>
            </>
          )}

          {selectedTools.length < maxTools && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <Plus size={16} /> Add Tool ({selectedTools.length}/{maxTools})
            </button>
          )}
        </div>
      </div>

      {/* ==================== STATE: LESS THAN 2 TOOLS SELECTED ==================== */}
      {selectedTools.length < 2 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Main Empty / Prompt Banner */}
          <div
            className="glass-card"
            style={{
              padding: '60px 32px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(22, 26, 42, 0.85) 0%, rgba(14, 17, 28, 0.85) 100%)',
              border: '1px solid rgba(238, 116, 51, 0.3)',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(238, 116, 51, 0.14)',
                border: '1px solid rgba(238, 116, 51, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#EE7433',
              }}
            >
              <ArrowLeftRight size={30} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
              {selectedTools.length === 0
                ? 'Select At Least Two Tools to Compare'
                : `1 Tool Selected (${selectedTools[0].name}) — Add One More`}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.6 }}>
              {selectedTools.length === 0
                ? 'Browse the directory or search from 400+ verified AI tools to evaluate pricing models, features, use cases, and technical trade-offs side-by-side.'
                : 'Click "+ Add Tool" or pick a suggested alternative below to unlock the comprehensive side-by-side comparison matrix.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem' }}
              >
                <Plus size={16} /> Browse & Select Tool
              </button>
              <Link href="/tools" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                <Wrench size={16} /> Explore AI Directory
              </Link>
            </div>
          </div>

          {/* Quick Comparison Suggestions from Actual Backend Data */}
          {availableTools.length >= 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={18} color="var(--accent-purple)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Popular Comparisons to Try
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                }}
              >
                {[
                  [availableTools[0], availableTools[1]],
                  availableTools.length > 3 ? [availableTools[2], availableTools[3]] : null,
                  availableTools.length > 5 ? [availableTools[4], availableTools[5]] : null,
                ]
                  .filter((pair): pair is [Tool, Tool] => pair !== null && Boolean(pair[0]) && Boolean(pair[1]))
                  .map(([toolA, toolB], idx) => {
                    const logoA = toolA.logoUrl || toolA.logo || getFaviconUrl(toolA.url);
                    const logoB = toolB.logoUrl || toolB.logo || getFaviconUrl(toolB.url);

                    return (
                      <div
                        key={idx}
                        className="glass-card"
                        style={{
                          padding: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: '#1E2333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                              }}
                            >
                              {logoA ? (
                                <img src={logoA} alt={toolA.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                              ) : (
                                <Wrench size={16} />
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', margin: '0 6px' }}>
                              vs
                            </span>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: '#1E2333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                              }}
                            >
                              {logoB ? (
                                <img src={logoB} alt={toolB.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                              ) : (
                                <Wrench size={16} />
                              )}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                              {toolA.name} vs {toolB.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {toolA.pricing || 'Freemium'} • {toolB.pricing || 'Freemium'}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectPair(toolA, toolB)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Compare <ArrowRight size={13} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== STATE: 2 OR MORE TOOLS COMPARISON MATRIX ==================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Intelligent Comparative Overview Banner */}
          <div
            className="glass-card"
            style={{
              padding: '24px 30px',
              background: 'linear-gradient(135deg, rgba(238, 116, 51, 0.14) 0%, rgba(250, 58, 82, 0.08) 100%)',
              border: '1px solid rgba(238, 116, 51, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #EE7433 0%, #FA3A52 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Comparing {selectedTools.length} AI Solutions
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedTools.map((t) => t.name).join(' • ')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-brand">
                {selectedTools.length} of {maxTools} slots used
              </span>
              {selectedTools.length < maxTools && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Plus size={13} /> Add another
                </button>
              )}
            </div>
          </div>

          {/* Side-by-Side Comparison Grid Table */}
          <div
            style={{
              overflowX: 'auto',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#0F121E',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: `${selectedTools.length * 280 + 180}px`,
              }}
            >
              {/* Table Column Headers (Sticky Tools) */}
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#141828' }}>
                  <th
                    style={{
                      width: '200px',
                      padding: '24px 20px',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      verticalAlign: 'bottom',
                    }}
                  >
                    Tool Specifications
                  </th>

                  {selectedTools.map((tool) => {
                    const toolId = tool.id || tool._id || '';
                    const logo = tool.logoUrl || tool.logo || getFaviconUrl(tool.url || tool.websiteUrl);
                    const isLiked = isLikedTool(toolId);

                    return (
                      <th
                        key={toolId}
                        style={{
                          padding: '24px 20px',
                          textAlign: 'left',
                          verticalAlign: 'top',
                          borderLeft: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '12px',
                                  backgroundColor: '#1E2333',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                              >
                                {logo ? (
                                  <img src={logo} alt={tool.name} style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                                ) : (
                                  <Wrench size={20} color="var(--accent-blue)" />
                                )}
                              </div>
                              <div>
                                <Link
                                  href={`/tools/${toolId}`}
                                  style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    textDecoration: 'none',
                                    display: 'block',
                                  }}
                                >
                                  {tool.name}
                                </Link>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {typeof tool.category === 'object' && tool.category !== null
                                    ? (tool.category as any).name || 'AI Tool'
                                    : tool.category || 'AI Tool'}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => removeTool(toolId)}
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              title={`Remove ${tool.name}`}
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="badge badge-brand">{tool.pricing || 'Freemium'}</span>
                            {tool.isTrending && (
                              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
                                <Flame size={11} /> Trending
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link
                              href={`/tools/${toolId}`}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }}
                            >
                              Details
                            </Link>
                            {tool.url && (
                              <a
                                href={tool.url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-primary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                title="Visit official website"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => toggleLikeTool(toolId)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: isLiked ? '#EF4444' : 'var(--text-muted)',
                                cursor: 'pointer',
                              }}
                              title={isLiked ? 'Saved' : 'Save tool'}
                            >
                              <Heart size={14} fill={isLiked ? '#EF4444' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body Content Rows */}
              <tbody>
                {/* 1. Pricing Model */}
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: highlightDifferences ? 'rgba(238, 116, 51, 0.04)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Pricing Structure
                  </td>
                  {selectedTools.map((t) => (
                    <td key={t.id || t._id} style={{ padding: '16px 20px', borderLeft: '1px solid var(--border-subtle)' }}>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.85rem',
                          padding: '4px 10px',
                          backgroundColor:
                            t.pricing?.toLowerCase() === 'free'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : t.pricing?.toLowerCase() === 'paid'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(238, 116, 51, 0.15)',
                          color:
                            t.pricing?.toLowerCase() === 'free'
                              ? '#10B981'
                              : t.pricing?.toLowerCase() === 'paid'
                              ? '#F87171'
                              : '#EE7433',
                        }}
                      >
                        {t.pricing || t.pricingModel || 'Freemium'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 2. Primary Category */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Primary Category
                  </td>
                  {selectedTools.map((t) => {
                    const catName = typeof t.category === 'object' && t.category !== null ? (t.category as any).name : t.category;
                    return (
                      <td key={t.id || t._id} style={{ padding: '16px 20px', borderLeft: '1px solid var(--border-subtle)', color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                        {catName || 'AI Tool'}
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Community Likes */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Community Upvotes
                  </td>
                  {selectedTools.map((t) => (
                    <td key={t.id || t._id} style={{ padding: '16px 20px', borderLeft: '1px solid var(--border-subtle)', color: '#FFFFFF', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Heart size={14} color="#EF4444" fill="#EF4444" />
                        <span style={{ fontWeight: 700 }}>{t.likesCount || 0}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 4. Short Description */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Summary
                  </td>
                  {selectedTools.map((t) => (
                    <td key={t.id || t._id} style={{ padding: '16px 20px', borderLeft: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {t.shortDescription || t.description || 'No summary available.'}
                    </td>
                  ))}
                </tr>

                {/* 5. In-Depth Description */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Full Capability Overview
                  </td>
                  {selectedTools.map((t) => (
                    <td key={t.id || t._id} style={{ padding: '16px 20px', borderLeft: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      {t.longDescription || t.shortDescription || 'Verified AI model or tool.'}
                    </td>
                  ))}
                </tr>

                {/* 6. Ideal Use Cases */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Target Use Cases
                  </td>
                  {selectedTools.map((t) => (
                    <td key={t.id || t._id} style={{ padding: '16px 20px', borderLeft: '1px solid var(--border-subtle)', verticalAlign: 'top' }}>
                      {t.useCases && t.useCases.length > 0 ? (
                        <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {t.useCases.map((uc, i) => (
                            <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                              {uc}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>General creative & technical tasks</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 7. Tags / Modalities */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Specializations & Tags
                  </td>
                  {selectedTools.map((t) => (
                    <td key={t.id || t._id} style={{ padding: '16px 20px', borderLeft: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {t.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="tag-pill"
                            style={{
                              fontSize: '0.75rem',
                              padding: '3px 8px',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 8. Verified Features (Dynamic Matrix if features object present) */}
                {featureKeys.length > 0 &&
                  featureKeys.map((key) => (
                    <tr key={key} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {key}
                      </td>
                      {selectedTools.map((t) => {
                        const hasFeature = t.features && t.features[key];
                        return (
                          <td
                            key={t.id || t._id}
                            style={{
                              padding: '14px 20px',
                              borderLeft: '1px solid var(--border-subtle)',
                              textAlign: 'center',
                            }}
                          >
                            {hasFeature ? (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#10B981',
                                }}
                              >
                                <Check size={14} />
                              </div>
                            ) : (
                              <Minus size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                {/* 9. Official Website Link Row */}
                <tr>
                  <td style={{ padding: '20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Website & Access
                  </td>
                  {selectedTools.map((t) => (
                    <td key={t.id || t._id} style={{ padding: '20px', borderLeft: '1px solid var(--border-subtle)' }}>
                      {t.url ? (
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          Visit {t.name} <ExternalLink size={14} />
                        </a>
                      ) : (
                        <Link
                          href={`/tools/${t.id || t._id}`}
                          className="btn btn-secondary"
                          style={{ width: '100%', padding: '10px 16px', fontSize: '0.85rem', textAlign: 'center' }}
                        >
                          View Tool Details
                        </Link>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== ADD TOOL MODAL ==================== */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(10px)',
            zIndex: 6000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="glass-card slide-up"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '28px',
              backgroundColor: '#121524',
              border: '1px solid rgba(238, 116, 51, 0.4)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
                  Select Tool to Compare
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Pick from verified AI tools currently in the catalog ({selectedTools.length}/{maxTools} slots used)
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search and Category Filter */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 14px',
                  minWidth: '220px',
                }}
              >
                <Search size={16} color="var(--accent-blue)" />
                <input
                  type="text"
                  placeholder="Search tool by name, tag, capability..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    width: '100%',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                  autoFocus
                />
              </div>

              {categories.length > 0 && (
                <select
                  value={selectedCatFilter}
                  onChange={(e) => setSelectedCatFilter(e.target.value)}
                  style={{
                    backgroundColor: '#1E2333',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id || c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Results List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingRight: '6px',
              }}
            >
              {filteredModalTools.length > 0 ? (
                filteredModalTools.map((tool) => {
                  const toolId = tool.id || tool._id || '';
                  const logo = tool.logoUrl || tool.logo || getFaviconUrl(tool.url || tool.websiteUrl);

                  return (
                    <div
                      key={toolId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        gap: '14px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: '#1E2333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {logo ? (
                            <img src={logo} alt={tool.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                          ) : (
                            <Wrench size={16} />
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>{tool.name}</span>
                            <span className="badge badge-brand" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                              {tool.pricing || 'Freemium'}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              lineHeight: 1.4,
                              maxWidth: '380px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {tool.shortDescription || tool.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const added = addTool(tool);
                          if (added) {
                            setIsAddModalOpen(false);
                          }
                        }}
                        className="btn btn-primary"
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Plus size={13} /> Select
                      </button>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No tools found matching &quot;{modalSearch}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading comparison specifications...
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
