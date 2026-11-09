'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeftRight, X, ArrowRight, Wrench, Plus, Sparkles } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { getFaviconUrl } from '@/services/api';

export default function CompareDock() {
  const { selectedTools, selectedCount, maxTools, removeTool, clearCompare } = useCompare();
  const pathname = usePathname();

  // If no tools or currently on the full compare page, hide dock to avoid clutter
  if (selectedCount === 0 || pathname === '/compare') {
    return null;
  }

  const canCompare = selectedCount >= 2;

  return (
    <aside
      aria-label="Tool Comparison Bar"
      className="slide-up"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 4800,
        width: 'auto',
        maxWidth: '92vw',
      }}
    >
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 20px',
          backgroundColor: 'rgba(16, 19, 32, 0.95)',
          border: '1px solid rgba(238, 116, 51, 0.45)',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(238, 116, 51, 0.2)',
          backdropFilter: 'blur(16px)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Left Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EE7433 0%, #FA3A52 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <ArrowLeftRight size={14} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
              Compare
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#CBD5E1',
                marginLeft: '6px',
                fontWeight: 700,
              }}
            >
              {selectedCount}/{maxTools}
            </span>
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        {/* Selected Tool Avatars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {selectedTools.map((tool) => {
            const toolId = tool.id || tool._id || '';
            const logo = tool.logoUrl || tool.logo || getFaviconUrl(tool.url || tool.websiteUrl);

            return (
              <div
                key={toolId}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px 4px 6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#1E2333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt={tool.name}
                      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Wrench size={12} color="var(--accent-orange)" />
                  )}
                </div>

                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    maxWidth: '95px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tool.name}
                </span>

                <button
                  type="button"
                  onClick={() => removeTool(toolId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: 'none',
                  }}
                  title={`Remove ${tool.name}`}
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}

          {selectedCount < maxTools && (
            <Link
              href="/tools"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px dashed rgba(238, 116, 51, 0.7)',
                backgroundColor: 'rgba(238, 116, 51, 0.1)',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Plus size={12} color="var(--accent-orange)" /> Add tool
            </Link>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={clearCompare}
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#CBD5E1',
              padding: '6px 10px',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
            }}
          >
            Clear
          </button>

          {canCompare ? (
            <Link
              href="/compare"
              className="btn btn-primary"
              style={{
                padding: '8px 18px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
              }}
            >
              Compare ({selectedCount}) <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              href="/tools"
              className="btn btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
                color: '#EE7433',
                borderColor: 'rgba(238, 116, 51, 0.4)',
              }}
            >
              + Add 1 more to compare
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
