'use client';

import React from 'react';
import Link from 'next/link';
import { BRAND } from '@/config/brand';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  isLink?: boolean;
  customIcon?: string;
  customName?: string;
  customTagline?: string;
  style?: React.CSSProperties;
}

export default function BrandLogo({
  size = 'md',
  showText = true,
  showTagline = true,
  isLink = true,
  customIcon,
  customName,
  customTagline,
  style,
}: BrandLogoProps) {
  const iconSrc = customIcon || BRAND.logoIcon;
  const brandName = customName || BRAND.name;
  const brandTagline = customTagline || BRAND.tagline;

  const sizeMap = {
    sm: { icon: 30, text: '1.15rem', tagline: '0.55rem', gap: 8 },
    md: { icon: 40, text: '1.38rem', tagline: '0.62rem', gap: 11 },
    lg: { icon: 54, text: '1.85rem', tagline: '0.75rem', gap: 14 },
    xl: { icon: 72, text: '2.5rem', tagline: '0.9rem', gap: 18 },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${currentSize.gap}px`,
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Brand Icon Image */}
      <div
        style={{
          width: `${currentSize.icon}px`,
          height: `${currentSize.icon}px`,
          borderRadius: `${Math.round(currentSize.icon * 0.28)}px`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 18px ${BRAND.colors.glow}`,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        className="brand-logo-icon"
      >
        <img
          src={iconSrc}
          alt={`${brandName} Logo`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            // Fallback to gradient box with first letter if image is missing
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.style.background = BRAND.colors.gradient;
              target.parentElement.innerHTML = `<span style="font-weight:900;color:#fff;font-size:${currentSize.icon * 0.5}px;">${brandName.charAt(0)}</span>`;
            }
          }}
        />
      </div>

      {/* Brand Text & Tagline */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span
            style={{
              fontSize: currentSize.text,
              fontWeight: 800,
              letterSpacing: '1px',
              color: '#FFFFFF',
              fontFamily: 'var(--font-main)',
            }}
          >
            {brandName}
          </span>
          {showTagline && (
            <span
              style={{
                fontSize: currentSize.tagline,
                fontWeight: 700,
                letterSpacing: '2px',
                color: 'var(--accent-coral)',
                textTransform: 'uppercase',
                marginTop: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              {brandTagline}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (isLink) {
    return (
      <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex' }}>
        {content}
      </Link>
    );
  }

  return content;
}
