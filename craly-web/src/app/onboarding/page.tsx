'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { BRAND } from '@/config/brand';

const AVAILABLE_INTERESTS = [
  'Image & Design',
  'Coding & Development',
  'Productivity & Writing',
  'Video Generation',
  'Audio & Music',
  'Marketing & SEO',
  '3D Models & Gaming',
  'Autonomous Agents',
  'Data Science & Analytics',
  'Research & Summarization',
];

const REFERRAL_SOURCES = [
  'Product Hunt',
  'Twitter / X',
  'YouTube',
  'Friend or Colleague',
  'Reddit',
  'LinkedIn',
  'Google Search',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [selectedSource, setSelectedSource] = useState<string>(user?.heardFrom || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInterests.length === 0) {
      showToast('Please select at least one interest area.', 'error');
      return;
    }

    setIsSubmitting(true);
    await updateProfile({
      interests: selectedInterests,
      heardFrom: selectedSource,
    });
    setIsSubmitting(false);

    showToast('Your recommendations have been customized!');
    router.push('/');
  };

  return (
    <div className="container" style={{ padding: '60px 24px 100px', maxWidth: '780px' }}>
      <div
        className="glass-card slide-up"
        style={{
          padding: '48px 40px',
          backgroundColor: '#121524',
          border: '1px solid rgba(74, 144, 226, 0.35)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'var(--gradient-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(74, 144, 226, 0.4)',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={28} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
            Personalize Your AI Experience
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
            Select the domains you work in so we can tailor tool recommendations, top prompts, and workflow journeys to your stack.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Interests Section */}
          <div style={{ marginBottom: '36px' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>
              What areas of Artificial Intelligence interest you most?
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isSelected ? 'var(--gradient-brand)' : 'rgba(255, 255, 255, 0.05)',
                      color: '#FFFFFF',
                      border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected && <Check size={14} />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Referral Source Section */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>
              How did you hear about {BRAND.name}? (Optional)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {REFERRAL_SOURCES.map((source) => {
                const isSelected = selectedSource === source;
                return (
                  <button
                    type="button"
                    key={source}
                    onClick={() => setSelectedSource(isSelected ? '' : source)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'rgba(250, 58, 82, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? 'var(--brand-pink)' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--brand-pink)' : '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {source}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: '14px 40px', fontSize: '1rem', width: '100%', maxWidth: '340px' }}
            >
              {isSubmitting ? 'Saving Focus...' : `Continue to ${BRAND.name}`} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
