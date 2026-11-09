'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Clock, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import { Workflow } from '@/types';
import { cralyApi } from '@/services/api';
import WorkflowCard from '@/components/WorkflowCard';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWorkflows() {
      setIsLoading(true);
      const data = await cralyApi.getWorkflows();
      setWorkflows(data);
      setIsLoading(false);
    }
    loadWorkflows();
  }, []);

  const filteredWorkflows = workflows.filter((wf) => {
    if (selectedDifficulty === 'all') return true;
    return wf.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();
  });

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Layers size={22} color="var(--accent-purple)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Actionable Pipelines
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
          AI Execution Workflows
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px' }}>
          Step-by-step multi-tool journeys. Learn how to combine ChatGPT, Midjourney, Runway, and ElevenLabs into cohesive production pipelines.
        </p>
      </div>

      {/* Difficulty Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '36px',
          flexWrap: 'wrap',
        }}
      >
        {['all', 'beginner', 'intermediate', 'advanced'].map((diff) => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: selectedDifficulty === diff ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
              color: '#FFFFFF',
              border: selectedDifficulty === diff ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {diff === 'all' ? 'All Difficulties' : diff}
          </button>
        ))}
      </div>

      {/* Workflow Cards Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          Loading AI workflows...
        </div>
      ) : (
        <div className="grid-cards">
          {filteredWorkflows.map((wf) => (
            <WorkflowCard key={wf.id || wf._id} workflow={wf} />
          ))}
        </div>
      )}
    </div>
  );
}
