'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { BRAND } from '@/config/brand';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#07080C',
        borderTop: '1px solid var(--border-subtle)',
        padding: '70px 0 40px',
        marginTop: '80px',
        position: 'relative',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '50px',
          }}
        >
          {/* Brand Info */}
          <div style={{ maxWidth: '320px' }}>
            <div style={{ marginBottom: '14px' }}>
              <BrandLogo size="md" />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {BRAND.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 10px #10B981',
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Backend API: Connected (v1.0.3)</span>
            </div>
          </div>

          {/* Directory Column */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Explore Directory
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <Link href="/tools" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  All 1,000+ AI Tools
                </Link>
              </li>
              <li>
                <Link href="/tools?trending=true" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Trending Tools This Week
                </Link>
              </li>
              <li>
                <Link href="/categories" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Categorized Collections
                </Link>
              </li>
              <li>
                <Link href="/workflows" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Step-by-Step Workflows
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Community & AI
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <Link href="/posts" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Community Prompt Feed
                </Link>
              </li>
              <li>
                <Link href="/bot" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {BRAND.assistantName} Assistant
                </Link>
              </li>
              <li>
                <Link href="/profile" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Saved Bookmarks & Activity
                </Link>
              </li>
              <li>
                <Link href="/onboarding" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Customize Interests
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Platform & Legal
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a
                  href="https://craly.in/privacy"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                >
                  Privacy Policy <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://craly.in/terms"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                >
                  Terms of Service <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <ShieldCheck size={14} color="#10B981" /> Verified AI Directory
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}
        >
          <div>© 2026 {BRAND.name}. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Built for creators with <Heart size={14} color="#EF4444" fill="#EF4444" /> and precision.
          </div>
        </div>
      </div>
    </footer>
  );
}
