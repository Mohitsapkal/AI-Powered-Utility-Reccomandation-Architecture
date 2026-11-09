'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, Clock, ArrowRight, Heart, CheckCircle2 } from 'lucide-react';
import { Workflow } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface WorkflowCardProps {
  workflow: Workflow;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  const { isLikedWorkflow, toggleLikeWorkflow } = useAuth();
  const { showToast } = useToast();

  const wfId = workflow.id || workflow._id || '';
  const isLiked = isLikedWorkflow(wfId) || workflow.isLiked;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLikeWorkflow(wfId);
    showToast(isLiked ? 'Removed from saved workflows' : 'Added workflow to saved journeys!');
  };

  const getDifficultyBadge = (diff?: string) => {
    const d = (diff || 'Beginner').toLowerCase();
    if (d.includes('adv')) {
      return { class: 'badge-amber', label: 'Advanced' };
    }
    if (d.includes('inter')) {
      return { class: 'badge-brand', label: 'Intermediate' };
    }
    return { class: 'badge-emerald', label: 'Beginner' };
  };

  const diffBadge = getDifficultyBadge(workflow.difficulty);

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      whileTap={{ scale: 0.99 }}
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px',
        height: '100%',
      }}
    >
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`badge ${diffBadge.class}`}>{diffBadge.label}</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              <Clock size={13} /> {workflow.duration || '15 mins'}
            </span>
          </div>

          <button
            onClick={handleLike}
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: isLiked ? '#EF4444' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
            title="Save workflow"
          >
            <Heart size={16} fill={isLiked ? '#EF4444' : 'none'} />
          </button>
        </div>

        {/* Title */}
        <Link href={`/workflows/${wfId}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '8px',
              lineHeight: 1.4,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          >
            {workflow.name}
          </h3>
        </Link>

        {/* Description */}
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            lineHeight: 1.55,
            marginBottom: '18px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {workflow.description}
        </p>

        {/* Journey Step Teasers */}
        {workflow.journey && workflow.journey.length > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '12px',
              marginBottom: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {workflow.journey.slice(0, 2).map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(74, 144, 226, 0.2)',
                    color: 'var(--accent-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.title}</span>
              </div>
            ))}
            {workflow.journey.length > 2 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '26px' }}>
                +{workflow.journey.length - 2} more steps
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Layers size={15} color="var(--accent-purple)" />
          <span>{workflow.steps || workflow.journey?.length || 3} Step Pipeline</span>
        </div>

        <Link
          href={`/workflows/${wfId}`}
          className="btn btn-accent"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          View Pipeline <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}
