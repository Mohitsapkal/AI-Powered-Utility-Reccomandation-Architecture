'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Wrench, Flame, ArrowLeftRight } from 'lucide-react';
import { Tool } from '@/types';
import { getFaviconUrl } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCompare } from '@/context/CompareContext';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const { isLikedTool, toggleLikeTool } = useAuth();
  const { isToolSelected, toggleTool } = useCompare();
  const { showToast } = useToast();

  const toolId = tool.id || tool._id || '';
  const isLiked = isLikedTool(toolId) || tool.isLiked;
  const isCompared = isToolSelected(toolId);
  const logo = tool.logoUrl || tool.logo || getFaviconUrl(tool.url || tool.websiteUrl);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLikeTool(toolId);
    showToast(isLiked ? 'Removed from saved tools' : 'Saved to your profile bookmarks!');
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTool(tool);
  };

  const handleVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      whileTap={{ scale: 0.99 }}
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '22px',
        height: '100%',
        border: isCompared ? '1px solid rgba(238, 116, 51, 0.5)' : undefined,
        boxShadow: isCompared ? '0 8px 24px rgba(238, 116, 51, 0.15)' : undefined,
      }}
    >
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
          <Link
            href={`/tools/${toolId}`}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#1E2333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {logo ? (
                <img
                  src={logo}
                  alt={tool.name}
                  style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                  onError={(e) => {
                    // Fallback to placeholder if icon fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Wrench size={22} color="var(--accent-blue)" />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>{tool.name}</h3>
                {tool.isTrending && (
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#F87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '2px 6px',
                      fontSize: '0.65rem',
                    }}
                  >
                    <Flame size={10} /> HOT
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {typeof tool.category === 'object' && tool.category !== null
                  ? (tool.category as any).name || 'AI Tool'
                  : tool.category || 'Artificial Intelligence'}
              </span>
            </div>
          </Link>

          {/* Top Card Actions: Compare & Like */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleCompare}
              style={{
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: isCompared ? 'rgba(238, 116, 51, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                color: isCompared ? '#EE7433' : 'var(--text-muted)',
                border: isCompared ? '1px solid rgba(238, 116, 51, 0.4)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              title={isCompared ? 'Remove from comparison tray' : 'Add to compare tray'}
            >
              <ArrowLeftRight size={15} />
            </button>

            <button
              onClick={handleLike}
              style={{
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isLiked ? '#EF4444' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              title={isLiked ? 'Unlike' : 'Save tool'}
            >
              <Heart size={16} fill={isLiked ? '#EF4444' : 'none'} />
            </button>
          </div>
        </div>

        {/* Short Description */}
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            lineHeight: 1.55,
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {tool.shortDescription || tool.description || 'Explore next-generation AI workflows with this tool.'}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
          {tool.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '14px',
          marginTop: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className={`badge ${
              tool.pricing?.toLowerCase() === 'free'
                ? 'badge-emerald'
                : tool.pricing?.toLowerCase() === 'paid'
                ? 'badge-amber'
                : 'badge-brand'
            }`}
          >
            {tool.pricing || tool.pricingModel || 'Freemium'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {(tool.likesCount || tool.popularity || 0) + (isLiked ? 1 : 0)} likes
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {tool.url && (
            <a
              href={tool.url || tool.websiteUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleVisit}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              title="Visit official website"
            >
              Visit <ExternalLink size={12} />
            </a>
          )}
          <Link
            href={`/tools/${toolId}`}
            className="btn btn-accent"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
