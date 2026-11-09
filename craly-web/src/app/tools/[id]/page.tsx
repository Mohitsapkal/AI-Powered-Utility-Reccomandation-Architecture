'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Wrench,
  ExternalLink,
  Heart,
  Share2,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Layers,
  Flame,
  Globe,
  ArrowLeftRight,
} from 'lucide-react';
import { Tool } from '@/types';
import { cralyApi, getFaviconUrl } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCompare } from '@/context/CompareContext';
import ToolCard from '@/components/ToolCard';

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLikedTool, toggleLikeTool } = useAuth();
  const { isToolSelected, toggleTool } = useCompare();
  const { showToast } = useToast();

  const toolId = params.id as string;
  const isCompared = isToolSelected(toolId);
  const [tool, setTool] = useState<Tool | null>(null);
  const [relatedTools, setRelatedTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTool() {
      setIsLoading(true);
      const data = await cralyApi.getToolDetail(toolId);
      setTool(data);

      if (data?.relatedTools && data.relatedTools.length > 0) {
        setRelatedTools(data.relatedTools);
      } else if (data?.category) {
        const catParam = typeof data.category === 'object' ? (data.category as any).name || (data.category as any)._id : data.category;
        const catTools = await cralyApi.getTools({ category: catParam });
        const filtered = catTools.filter((t: Tool) => (t.id || t._id) !== toolId);
        if (filtered.length > 0) {
          setRelatedTools(filtered.slice(0, 3));
        } else {
          const generalTools = await cralyApi.getTools({ limit: 4 });
          setRelatedTools(generalTools.filter((t: Tool) => (t.id || t._id) !== toolId).slice(0, 3));
        }
      } else {
        const generalTools = await cralyApi.getTools({ limit: 4 });
        setRelatedTools(generalTools.filter((t: Tool) => (t.id || t._id) !== toolId).slice(0, 3));
      }
      setIsLoading(false);
    }
    loadTool();
  }, [toolId]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading tool specifications...
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Tool not found</h2>
        <Link href="/tools" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Directory
        </Link>
      </div>
    );
  }

  const isLiked = isLikedTool(toolId) || tool.isLiked;
  const logo = tool.logoUrl || tool.logo || getFaviconUrl(tool.url || tool.websiteUrl);
  const targetUrl = tool.url || tool.websiteUrl;

  const handleLike = () => {
    toggleLikeTool(toolId);
    showToast(isLiked ? 'Removed from saved tools' : 'Saved to your profile bookmarks!');
  };

  const handleCompare = () => {
    if (tool) {
      toggleTool(tool);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Tool link copied to clipboard!');
    }
  };

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
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {/* Main Hero Card */}
      <div
        className="glass-card"
        style={{
          padding: '40px',
          marginBottom: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '18px',
                backgroundColor: '#1E2333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
            >
              {logo ? (
                <img src={logo} alt={tool.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              ) : (
                <Wrench size={34} color="var(--accent-blue)" />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFFFFF' }}>{tool.name}</h1>
                <span className="badge badge-brand">{tool.pricing || 'Freemium'}</span>
                {tool.isTrending && (
                  <span
                    className="badge"
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                  >
                    <Flame size={12} /> TRENDING
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span>
                  {typeof tool.category === 'object' && tool.category !== null
                    ? (tool.category as any).name || 'Artificial Intelligence'
                    : tool.category || 'Artificial Intelligence'}
                </span>
                <span>•</span>
                <span>{(tool.likesCount || 0) + (isLiked ? 1 : 0)} community upvotes</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCompare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isCompared ? 'rgba(238, 116, 51, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                color: isCompared ? '#EE7433' : '#FFFFFF',
                border: isCompared ? '1px solid rgba(238, 116, 51, 0.5)' : '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeftRight size={16} />
              {isCompared ? 'In Compare Dock' : 'Compare Tool'}
            </button>

            <button
              onClick={handleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isLiked ? '#EF4444' : '#FFFFFF',
                border: isLiked ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              <Heart size={16} fill={isLiked ? '#EF4444' : 'none'} />
              {isLiked ? 'Saved' : 'Save Tool'}
            </button>

            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{ padding: '10px 14px' }}
              title="Share"
            >
              <Share2 size={16} />
            </button>

            {targetUrl && (
              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ padding: '10px 22px' }}
              >
                Launch Website <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Short description */}
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '820px' }}>
          {tool.shortDescription}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tool.tags?.map((tag) => (
            <span key={tag} className="tag-pill" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Long Description & Features */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          marginBottom: '60px',
        }}
      >
        {/* Left: Detailed Overview */}
        <div
          className="glass-card"
          style={{
            padding: '32px',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent-blue)" /> Tool Overview
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {tool.longDescription ||
              `${tool.name} is designed to streamline modern generative AI workflows. It empowers users to automate repetitive tasks, improve creativity, and scale production through state-of-the-art machine learning models.`}
          </div>

          {targetUrl && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Official Domain:</div>
              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--accent-blue)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                <Globe size={16} /> {targetUrl}
              </a>
            </div>
          )}
        </div>

        {/* Right: Key Features & Use Cases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Features */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
              Core Capabilities
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(() => {
                const featureList = Array.isArray(tool.features)
                  ? tool.features
                  : tool.features && typeof tool.features === 'object'
                  ? Object.keys(tool.features)
                  : [];

                if (featureList.length > 0) {
                  return featureList.map((feat) => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={18} color="#10B981" />
                      <span style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500 }}>{feat}</span>
                    </div>
                  ));
                }

                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={18} color="#10B981" />
                      <span style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500 }}>High-precision model inferencing</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={18} color="#10B981" />
                      <span style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500 }}>API integration & developer support</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={18} color="#10B981" />
                      <span style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500 }}>Exportable assets & collaborative workspaces</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Use Cases */}
          {tool.useCases && tool.useCases.length > 0 && (
            <div className="glass-card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
                Primary Use Cases
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {tool.useCases.map((useCase) => (
                  <span
                    key={useCase}
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(74, 144, 226, 0.1)',
                      border: '1px solid rgba(74, 144, 226, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      color: 'var(--accent-blue)',
                      fontWeight: 500,
                    }}
                  >
                    ✓ {useCase}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Tools in same category */}
      {relatedTools.length > 0 && (
        <section>
          <div className="section-title-wrap">
            <div>
              <h2 className="section-title">Similar AI Tools</h2>
              <p className="section-subtitle">Other popular tools in the {tool.category || 'AI'} space</p>
            </div>
          </div>
          <div className="grid-cards">
            {relatedTools.map((rel) => (
              <ToolCard key={rel.id || rel._id} tool={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
