import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Layers,
  Wrench,
  Search,
  CheckCircle,
  Zap,
  TrendingUp,
  Award,
} from 'lucide-react';
import { cralyApi } from '@/services/api';
import ToolCard from '@/components/ToolCard';
import WorkflowCard from '@/components/WorkflowCard';
import PostCard from '@/components/PostCard';
import GsapHero from '@/components/animations/GsapHero';
import { MotionFadeIn } from '@/components/animations/MotionReveal';
import { BRAND } from '@/config/brand';

export default async function HomePage() {
  const homeData = await cralyApi.getHomeData();

  return (
    <div>
      {/* ==================== HERO SECTION ==================== */}
      <section
        style={{
          position: 'relative',
          padding: '80px 0 60px',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% -10%, rgba(250, 58, 82, 0.18) 0%, transparent 70%)',
        }}
      >
        <GsapHero>
          <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {/* Badge */}
            <div className="gsap-hero-item" style={{ display: 'inline-flex', marginBottom: '20px' }}>
              <span
                className="badge"
                style={{
                  background: 'rgba(250, 58, 82, 0.12)',
                  color: '#FF7B90',
                  border: '1px solid rgba(250, 58, 82, 0.35)',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                }}
              >
                <Sparkles size={14} /> {BRAND.tagline} PLATFORM
              </span>
            </div>

            {/* Heading */}
            <h1
              className="gsap-hero-item"
              style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
                fontWeight: 800,
                letterSpacing: '-1.5px',
                lineHeight: 1.15,
                maxWidth: '920px',
                margin: '0 auto 24px',
                color: 'var(--text-primary)',
              }}
            >
              Discover, Benchmark & Master <br />
              <span className="text-gradient">Artificial Intelligence</span>
            </h1>

            <p
              className="gsap-hero-item"
              style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                color: 'var(--text-secondary)',
                maxWidth: '680px',
                margin: '0 auto 36px',
                lineHeight: 1.6,
              }}
            >
              Explore 400+ curated AI tools, execute guided multi-step creative pipelines, and copy tested prompts designed for creators, builders, and developers.
            </p>

            {/* CTAs */}
            <div className="gsap-hero-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '50px' }}>
              <Link href="/tools" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Explore All AI Tools <ArrowRight size={18} />
              </Link>
              <Link href="/workflows" className="btn btn-secondary" style={{ padding: '14px 26px', fontSize: '1rem' }}>
                <Layers size={18} color="var(--accent-purple)" /> Browse AI Workflows
              </Link>
            </div>

            {/* Key Metrics Strip */}
            <div
              className="gsap-hero-item"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '32px',
                padding: '16px 36px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                backdropFilter: 'blur(12px)',
                flexWrap: 'wrap',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="var(--accent-blue)" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>400+</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Tools</span>
              </div>
              <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="var(--accent-purple)" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>40+</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Actionable Workflows</span>
              </div>
              <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="#10B981" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>35+</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Curated Categories</span>
              </div>
            </div>
          </div>
        </GsapHero>
      </section>

      {/* ==================== FEATURED HERO BANNER ==================== */}
      {homeData.banners && homeData.banners.length > 0 && (
        <MotionFadeIn className="container" style={{ marginBottom: '60px' }}>
          <div
            className="glass-card"
            style={{
              padding: '36px 42px',
              background: 'linear-gradient(135deg, rgba(32, 67, 116, 0.35) 0%, rgba(139, 92, 246, 0.2) 100%)',
              border: '1px solid rgba(74, 144, 226, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'inline-flex', marginBottom: '10px' }}>
                <span className="badge badge-brand">{homeData.banners[0].badge || 'COMMUNITY SPOTLIGHT'}</span>
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {homeData.banners[0].title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {homeData.banners[0].subtitle}
              </p>
            </div>
            <Link
              href={homeData.banners[0].linkUrl || '/tools'}
              className="btn btn-primary"
              style={{ padding: '12px 24px' }}
            >
              {homeData.banners[0].buttonText || 'Discover Now'} <ArrowRight size={16} />
            </Link>
          </div>
        </MotionFadeIn>
      )}

      {/* ==================== PERSONALIZED TOOLS ==================== */}
      {homeData.personalized?.tools && homeData.personalized.tools.length > 0 && (
        <MotionFadeIn className="container section">
          <div className="section-title-wrap">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Sparkles size={20} color="var(--accent-purple)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Tailored For You
                </span>
              </div>
              <h2 className="section-title">Recommended AI Tools</h2>
              <p className="section-subtitle">Intelligently selected based on your profile focus & creator interests</p>
            </div>
            <Link href="/onboarding" className="view-all-link">
              Tune Interests <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-cards">
            {homeData.personalized.tools.slice(0, 3).map((tool) => (
              <ToolCard key={tool.id || tool._id} tool={tool} />
            ))}
          </div>
        </MotionFadeIn>
      )}

      {/* ==================== TRENDING TOOLS ==================== */}
      <MotionFadeIn className="container section">
        <div className="section-title-wrap">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Flame size={20} color="#EF4444" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Viral & Surging
              </span>
            </div>
            <h2 className="section-title">Trending AI Tools</h2>
            <p className="section-subtitle">Fastest-growing AI utilities with the highest community engagement</p>
          </div>
          <Link href="/tools?trending=true" className="view-all-link">
            See All Trending <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cards">
          {homeData.trendingTools.map((tool) => (
            <ToolCard key={tool.id || tool._id} tool={tool} />
          ))}
        </div>
      </MotionFadeIn>

      {/* ==================== WORKFLOWS SHOWCASE ==================== */}
      <MotionFadeIn className="container section">
        <div className="section-title-wrap">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Layers size={20} color="var(--accent-blue)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Automated Pipelines
              </span>
            </div>
            <h2 className="section-title">Step-by-Step AI Workflows</h2>
            <p className="section-subtitle">Multi-tool step journeys to create videos, rank articles, and build apps</p>
          </div>
          <Link href="/workflows" className="view-all-link">
            View All Pipelines <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cards">
          {homeData.topWorkflows.map((workflow) => (
            <WorkflowCard key={workflow.id || workflow._id} workflow={workflow} />
          ))}
        </div>
      </MotionFadeIn>

      {/* ==================== CATEGORIES EXPLORER ==================== */}
      <MotionFadeIn className="container section">
        <div className="section-title-wrap">
          <div>
            <h2 className="section-title">Browse By Category</h2>
            <p className="section-subtitle">Explore tools by capability, modality, and technical application</p>
          </div>
          <Link href="/categories" className="view-all-link">
            All Categories <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {homeData.topCategories.map((cat) => (
            <Link
              key={cat.id || cat._id}
              href={`/categories/${cat.id || cat._id}`}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</h3>
                  <span className="badge badge-brand">
                    {(cat.toolsCount ?? cat.toolCount ?? cat.tools?.length) ? `${cat.toolsCount ?? cat.toolCount ?? cat.tools?.length} Tools` : 'Curated'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {cat.description || 'Top-tier curated models and interfaces.'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 600, marginTop: '14px' }}>
                Explore Collection <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </MotionFadeIn>

      {/* ==================== ALL TOP TOOLS ==================== */}
      <MotionFadeIn className="container section">
        <div className="section-title-wrap">
          <div>
            <h2 className="section-title">Top Rated Tools</h2>
            <p className="section-subtitle">Industry standard models and platforms rated highest by creators</p>
          </div>
          <Link href="/tools" className="view-all-link">
            Directory Catalog <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cards">
          {homeData.topTools.slice(0, 6).map((tool) => (
            <ToolCard key={tool.id || tool._id} tool={tool} />
          ))}
        </div>
      </MotionFadeIn>

      {/* ==================== SPONSORED PROMOTION CALLOUT ==================== */}
      {homeData.promotions && homeData.promotions.length > 0 && (
        <MotionFadeIn className="container" style={{ margin: '40px auto 60px' }}>
          <div
            className="glass-card"
            style={{
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '10px' }}>
                SPONSORED BY {homeData.promotions[0].sponsoredBy?.toUpperCase() || 'CRALY LABS'}
              </span>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {homeData.promotions[0].title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {homeData.promotions[0].description}
              </p>
            </div>
            <Link href="/posts" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              {homeData.promotions[0].ctaText || 'Join Community'}
            </Link>
          </div>
        </MotionFadeIn>
      )}
    </div>
  );
}
