'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface GsapHeroProps {
  children: React.ReactNode;
}

export default function GsapHero({ children }: GsapHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered reveal of hero elements
      gsap.fromTo(
        '.gsap-hero-item',
        {
          opacity: 0,
          y: 28,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );

      // Smooth floating ambient glow orbs
      gsap.to('.gsap-glow-1', {
        x: 35,
        y: -25,
        scale: 1.1,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.gsap-glow-2', {
        x: -30,
        y: 20,
        scale: 1.08,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* GSAP animated ambient glowing backdrops */}
      <div
        className="gsap-glow-1"
        style={{
          position: 'absolute',
          top: '-10%',
          left: '30%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(238, 116, 51, 0.18) 0%, rgba(250, 58, 82, 0.08) 50%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        className="gsap-glow-2"
        style={{
          position: 'absolute',
          top: '20%',
          right: '20%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250, 58, 82, 0.15) 0%, rgba(207, 47, 57, 0.05) 50%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

