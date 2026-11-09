'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  Clock,
  ArrowLeft,
  Heart,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Wrench,
  Sparkles,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { Workflow, WorkflowStep } from '@/types';
import { cralyApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLikedWorkflow, toggleLikeWorkflow } = useAuth();
  const { showToast } = useToast();

  const wfId = params.id as string;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [copiedStepIndex, setCopiedStepIndex] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await cralyApi.getWorkflowDetail(wfId);
      setWorkflow(data);
      setIsLoading(false);
    }
    load();
  }, [wfId]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading workflow pipeline...
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Workflow not found</h2>
        <Link href="/workflows" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Workflows
        </Link>
      </div>
    );
  }

  const isLiked = isLikedWorkflow(wfId) || workflow.isLiked;

  const handleLike = () => {
    toggleLikeWorkflow(wfId);
    showToast(isLiked ? 'Removed from saved workflows' : 'Saved workflow to your profile!');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Workflow URL copied to clipboard!');
    }
  };

  const handleCopyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedStepIndex(idx);
    showToast('Prompt copied to clipboard!');
    setTimeout(() => setCopiedStepIndex(null), 2000);
  };

  const toggleStepCompletion = (idx: number) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(completedSteps.filter((s) => s !== idx));
    } else {
      setCompletedSteps([...completedSteps, idx]);
      showToast(`Step ${idx + 1} marked as complete!`, 'info');
    }
  };

  const progressPercent = Math.round(
    (completedSteps.length / (workflow.journey?.length || workflow.steps || 1)) * 100
  );

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
        <ArrowLeft size={16} /> Back to Workflows
      </button>

      {/* Main Hero Overview Card */}
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="badge badge-brand">{workflow.difficulty || 'Beginner'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Clock size={14} /> {workflow.duration || '20 mins'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                • {workflow.steps || workflow.journey?.length} Steps
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
              {workflow.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '780px' }}>
              {workflow.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              {isLiked ? 'Saved' : 'Save Workflow'}
            </button>

            <button onClick={handleShare} className="btn btn-secondary" style={{ padding: '10px 14px' }}>
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pipeline Execution Progress</span>
            <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{progressPercent}% Complete</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#0D0F18', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'var(--gradient-brand)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Steps Timeline Journey */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} color="var(--accent-purple)" />
          Step-by-Step Execution Journey
        </h2>

        {workflow.journey?.map((step: WorkflowStep, idx: number) => {
          const isDone = completedSteps.includes(idx);

          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '32px',
                border: isDone ? '1px solid rgba(16, 163, 127, 0.4)' : '1px solid var(--border-subtle)',
                backgroundColor: isDone ? '#111822' : '#141827',
              }}
            >
              {/* Step Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: isDone ? '#10A37F' : 'rgba(139, 92, 246, 0.2)',
                      color: isDone ? '#FFFFFF' : 'var(--accent-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      border: isDone ? 'none' : '1px solid rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    {isDone ? <Check size={20} /> : idx + 1}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>{step.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Step {idx + 1} of {workflow.journey.length}</div>
                  </div>
                </div>

                <button
                  onClick={() => toggleStepCompletion(idx)}
                  className="btn btn-secondary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    color: isDone ? '#10A37F' : 'inherit',
                  }}
                >
                  <CheckCircle2 size={16} /> {isDone ? 'Completed' : 'Mark as Done'}
                </button>
              </div>

              {/* Step Description */}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {step.description}
              </p>

              {/* Prompt Snippet Box */}
              {step.prompt && (
                <div
                  style={{
                    backgroundColor: '#0A0C14',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#C084FC', fontWeight: 700 }}>
                      <Terminal size={14} /> TESTED PROMPT TO USE IN THIS STEP
                    </span>
                    <button
                      onClick={() => handleCopyPrompt(step.prompt!, idx)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        backgroundColor: copiedStepIndex === idx ? 'rgba(16, 163, 127, 0.25)' : 'rgba(139, 92, 246, 0.2)',
                        color: copiedStepIndex === idx ? '#10B981' : '#C084FC',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {copiedStepIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                      {copiedStepIndex === idx ? 'Copied Prompt!' : 'Copy Prompt'}
                    </button>
                  </div>
                  <pre
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: '#E2E8F0',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                    }}
                  >
                    {step.prompt}
                  </pre>
                </div>
              )}

              {/* Attached Tool Link */}
              {step.toolId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <Wrench size={14} color="var(--accent-blue)" />
                  <span>Recommended AI Tool for this step:</span>
                  <Link
                    href={`/tools/${typeof step.toolId === 'object' ? step.toolId.id || step.toolId._id : step.toolId}`}
                    style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    {typeof step.toolId === 'object' ? step.toolId.name : 'Open Tool'}
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
