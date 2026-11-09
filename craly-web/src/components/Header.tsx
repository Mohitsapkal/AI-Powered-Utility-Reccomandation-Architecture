'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  Layers,
  Wrench,
  Compass,
  MessageSquare,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Flame,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';
import { useToast } from '@/context/ToastContext';
import SearchModal from './SearchModal';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import { BRAND } from '@/config/brand';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { selectedCount } = useCompare();
  const { showToast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on page change
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Discover', href: '/', icon: Compass },
    { name: 'AI Tools', href: '/tools', icon: Wrench },
    { name: 'Workflows', href: '/workflows', icon: Layers },
    { name: 'Community', href: '/posts', icon: MessageSquare },
    { name: 'Categories', href: '/categories', icon: Flame },
    { name: 'Compare', href: '/compare', icon: ArrowLeftRight, badge: selectedCount > 0 ? selectedCount : undefined },
  ];

  return (
    <>
      <header
        className="fixed-navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5000,
          width: '100%',
          backgroundColor: isScrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: isScrolled
            ? '1px solid var(--nav-border-scrolled)'
            : '1px solid var(--nav-border)',
          boxShadow: isScrolled
            ? '0 10px 30px -10px rgba(0, 0, 0, 0.4), 0 0 15px rgba(250, 58, 82, 0.08)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="header-inner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '74px',
            padding: '0 28px',
            width: '100%',
            gap: '16px',
          }}
        >
          {/* Logo on far left */}
          <div style={{ flexShrink: 0 }}>
            <BrandLogo size="md" />
          </div>

          {/* Desktop Navigation Links - Centered */}
          <nav className="desktop-nav">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    backgroundColor: isActive ? 'rgba(238, 116, 51, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(238, 116, 51, 0.35)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={16} color={isActive ? BRAND.colors.primary : 'currentColor'} />
                  {link.name}
                  {link.badge !== undefined && (
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: BRAND.colors.gradient,
                        color: '#FFFFFF',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Search, User Profile, Mobile Menu Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="header-search-btn"
              title="Search AI Tools, Workflows & Prompts (⌘K)"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={15} color="var(--accent-orange)" />
                <span className="header-search-text">Search tools, prompts...</span>
              </span>
              <kbd className="header-search-kbd" style={{ padding: '2px 6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle Button (Dark / Light) */}
            <ThemeToggle />

            {/* User Profile Pill or Sign In Button */}
            {user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 10px 4px 4px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <img
                    src={user.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={user.displayName || 'User'}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                  <span
                    className="header-user-name"
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.displayName?.split(' ')[0] || 'Profile'}
                  </span>
                  <ChevronDown size={14} color="#CBD5E1" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="slide-up"
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: 0,
                      width: '230px',
                      background: '#121524',
                      border: '1px solid rgba(250, 58, 82, 0.35)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75)',
                      padding: '8px',
                      zIndex: 6000,
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>{user.displayName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px', wordBreak: 'break-all' }}>{user.email}</div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <User size={15} color="var(--accent-orange)" />
                      My Profile & Activity
                    </Link>

                    <Link
                      href="/onboarding"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Sparkles size={15} color="var(--accent-orange)" />
                      Manage Interests
                    </Link>

                    <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '6px 0' }} />

                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        setIsUserMenuOpen(false);
                        showToast('Signed out successfully. All local data cleared.', 'info');
                        router.push('/');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#F87171',
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="mobile-nav-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div
            className="slide-up"
            style={{
              padding: '16px 24px 24px',
              background: 'rgba(13, 15, 24, 0.92)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderBottom: '1px solid rgba(250, 58, 82, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              maxHeight: 'calc(100vh - 74px)',
              overflowY: 'auto',
            }}
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    background: isActive ? 'rgba(238, 116, 51, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isActive ? '1px solid rgba(238, 116, 51, 0.4)' : '1px solid transparent',
                  }}
                >
                  <Icon size={18} color={isActive ? BRAND.colors.primary : '#94A3B8'} />
                  <span>{link.name}</span>
                  {link.badge !== undefined && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: BRAND.colors.gradient,
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        marginLeft: 'auto',
                      }}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                marginTop: '4px',
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Theme Appearance
              </span>
              <ThemeToggle size="sm" />
            </div>

            {user && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '8px', paddingTop: '12px' }}>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileNavOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  <User size={16} color="var(--accent-orange)" />
                  Profile ({user.displayName?.split(' ')[0]})
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
