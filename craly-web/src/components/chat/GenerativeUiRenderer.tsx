'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  ArrowRight,
  ArrowLeftRight,
  Check,
  Copy,
  Star,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
  Workflow as WorkflowIcon,
  Code2,
} from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { useToast } from '@/context/ToastContext';
import { BRAND } from '@/config/brand';
import { getFaviconUrl } from '@/services/api';

interface GenerativeUiRendererProps {
  content: string;
  onSendPrompt?: (prompt: string) => void;
}

interface ParsedBlock {
  type: 'text' | 'gen-ui-tool' | 'gen-ui-compare' | 'gen-ui-workflow' | 'gen-ui-chips' | 'code';
  payload?: any;
  rawText?: string;
  language?: string;
}

export default function GenerativeUiRenderer({
  content,
  onSendPrompt,
}: GenerativeUiRendererProps) {
  const { toggleTool, isToolSelected } = useCompare();
  const { showToast } = useToast();
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Parse markdown content and extract gen-ui blocks
  const parseContent = (text: string): ParsedBlock[] => {
    const blocks: ParsedBlock[] = [];
    // Match code fences: ``` followed by any language tag up to newline, and then content up to closing ```
    const codeBlockRegex = /```([^\r\n`]*)\r?\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      const precedingText = text.substring(lastIndex, matchIndex);
      if (precedingText.trim()) {
        blocks.push({ type: 'text', rawText: precedingText });
      }

      let lang = (match[1] || '').trim().toLowerCase();
      let code = match[2].trim();

      // If code starts with :subtag (e.g. :tool-recommendation or :compare or :workflow)
      if (code.startsWith(':')) {
        const firstLineEnd = code.indexOf('\n');
        if (firstLineEnd !== -1) {
          const subTag = code.substring(1, firstLineEnd).trim().toLowerCase();
          lang = lang ? `${lang}:${subTag}` : subTag;
          code = code.substring(firstLineEnd).trim();
        } else {
          const subTag = code.substring(1).trim().toLowerCase();
          lang = lang ? `${lang}:${subTag}` : subTag;
          code = '';
        }
      }

      // Check if this is a Generative UI block or a JSON block intended as Generative UI
      const isGenUiTag =
        lang.includes('gen-ui') ||
        lang.includes('tool-recommendation') ||
        lang.includes('tools') ||
        lang.includes('compare') ||
        lang.includes('workflow') ||
        lang.includes('action-chips') ||
        lang.includes('chips');

      let parsedPayload: any = null;
      if (isGenUiTag || lang === 'json' || lang === '') {
        const jsonStartIndex = code.search(/[{\[]/);
        if (jsonStartIndex !== -1) {
          const potentialJson = code.substring(jsonStartIndex);
          try {
            parsedPayload = JSON.parse(potentialJson);
          } catch {
            // Attempt clean-up for trailing commas if any
            try {
              const cleaned = potentialJson.replace(/,\s*([}\]])/g, '$1');
              parsedPayload = JSON.parse(cleaned);
            } catch {}
          }
        }
      }

      if (parsedPayload) {
        if (
          lang.includes('tool') ||
          (parsedPayload.tools && Array.isArray(parsedPayload.tools))
        ) {
          blocks.push({ type: 'gen-ui-tool', payload: parsedPayload });
        } else if (
          lang.includes('compare') ||
          (parsedPayload.tools && parsedPayload.title && parsedPayload.title.toLowerCase().includes('vs'))
        ) {
          blocks.push({ type: 'gen-ui-compare', payload: parsedPayload });
        } else if (
          lang.includes('workflow') ||
          (parsedPayload.steps && Array.isArray(parsedPayload.steps))
        ) {
          blocks.push({ type: 'gen-ui-workflow', payload: parsedPayload });
        } else if (
          lang.includes('chip') ||
          lang.includes('action') ||
          (parsedPayload.chips && Array.isArray(parsedPayload.chips))
        ) {
          blocks.push({ type: 'gen-ui-chips', payload: parsedPayload });
        } else {
          blocks.push({ type: 'code', rawText: code, language: lang });
        }
      } else {
        blocks.push({ type: 'code', rawText: code, language: lang });
      }

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex);
      if (remaining.trim()) {
        blocks.push({ type: 'text', rawText: remaining });
      }
    }

    if (blocks.length === 0 && text.trim()) {
      blocks.push({ type: 'text', rawText: text });
    }

    return blocks;
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    showToast('Code copied to clipboard!');
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const blocks = parseContent(content);

  // Render markdown inline formatting (bold, italic, links, lists)
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return (
      <div style={{ lineHeight: 1.6, fontSize: '0.92rem' }}>
        {lines.map((line, idx) => {
          // Headers
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '14px 0 6px' }}>
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '16px 0 8px' }}>
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h2 key={idx} style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '18px 0 10px' }}>
                {line.replace('# ', '')}
              </h2>
            );
          }

          // Bullet list item
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const itemText = line.substring(2);
            return (
              <div key={idx} style={{ display: 'flex', gap: '8px', margin: '3px 0 3px 6px' }}>
                <span style={{ color: BRAND.colors.primary, fontWeight: 700 }}>•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }} />
              </div>
            );
          }

          // Numbered list
          const numMatch = line.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} style={{ display: 'flex', gap: '8px', margin: '4px 0 4px 6px' }}>
                <span style={{ color: BRAND.colors.primary, fontWeight: 700, minWidth: '18px' }}>
                  {numMatch[1]}.
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(numMatch[2]) }} />
              </div>
            );
          }

          if (!line.trim()) {
            return <div key={idx} style={{ height: '8px' }} />;
          }

          return (
            <p
              key={idx}
              style={{ margin: '0 0 6px', color: 'var(--text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
            />
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FFFFFF; font-weight: 700;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color: #E2E8F0;">$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em; color: #EE7433;">$1</code>');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {blocks.map((block, idx) => {
        // Standard Text Block
        if (block.type === 'text') {
          return <div key={idx}>{renderFormattedText(block.rawText || '')}</div>;
        }

        // Code Block
        if (block.type === 'code') {
          const isCopied = copiedCodeIndex === idx;
          return (
            <div
              key={idx}
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#080A10',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                margin: '8px 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 14px',
                  backgroundColor: '#0E111C',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code2 size={13} color="var(--accent-orange)" />
                  <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{block.language || 'code'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(block.rawText || '', idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isCopied ? '#10B981' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                  }}
                >
                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre
                style={{
                  padding: '14px',
                  margin: 0,
                  overflowX: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  color: '#E2E8F0',
                }}
              >
                <code>{block.rawText}</code>
              </pre>
            </div>
          );
        }

        // Generative UI: Tool Recommendation Card Widget
        if (block.type === 'gen-ui-tool') {
          const tools = block.payload?.tools || [block.payload];
          return (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
                margin: '10px 0',
              }}
            >
              {tools.map((item: any, toolIdx: number) => {
                const toolId = item.id || item._id || item.name?.toLowerCase().replace(/\s+/g, '_');
                const isCompared = isToolSelected(toolId);
                const favicon = getFaviconUrl(item.websiteUrl || item.url);

                return (
                  <div
                    key={toolIdx}
                    className="glass-card"
                    style={{
                      padding: '16px',
                      backgroundColor: '#121626',
                      border: isCompared
                        ? `1px solid ${BRAND.colors.primary}`
                        : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative',
                      boxShadow: isCompared ? `0 0 16px ${BRAND.colors.glow}` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: '#1A1E30',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {favicon ? (
                          <img
                            src={favicon}
                            alt={item.name}
                            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Sparkles size={20} color={BRAND.colors.primary} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4
                            style={{
                              fontSize: '0.98rem',
                              fontWeight: 700,
                              color: '#FFFFFF',
                              margin: 0,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.name}
                          </h4>
                          {item.rating && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', color: '#FBBF24' }}>
                              <Star size={11} fill="#FBBF24" />
                              <span>{item.rating}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                          {item.category && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--accent-orange)',
                                backgroundColor: 'rgba(238, 116, 51, 0.12)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              {item.category}
                            </span>
                          )}
                          {item.pricing && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: '#10B981',
                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              {item.pricing}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.tagline && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {item.tagline}
                      </p>
                    )}

                    {item.features && Array.isArray(item.features) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {item.features.slice(0, 3).map((feat: string, fIdx: number) => (
                          <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#CBD5E1' }}>
                            <CheckCircle2 size={12} color="#10B981" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <Link
                        href={`/tools/${toolId}`}
                        className="btn btn-outline"
                        style={{ flex: 1, padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
                      >
                        Specs <ArrowRight size={12} />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          toggleTool({
                            id: toolId,
                            name: item.name,
                            category: item.category || 'AI Tool',
                            pricing: item.pricing || 'Freemium',
                            url: item.websiteUrl || item.url || '',
                            shortDescription: item.tagline || '',
                            tags: item.features || [],
                          })
                        }
                        className={isCompared ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
                      >
                        <ArrowLeftRight size={12} />
                        <span>{isCompared ? 'In Compare' : 'Compare'}</span>
                      </button>

                      {item.websiteUrl && (
                        <a
                          href={item.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                          title="Visit Official Website"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // Generative UI: Side-by-Side Compare Widget
        if (block.type === 'gen-ui-compare') {
          const compData = block.payload;
          const tools = compData.tools || [];
          const toolIds = tools.map((t: any) => t.id || t.name?.toLowerCase().replace(/\s+/g, '_')).filter(Boolean);

          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                margin: '12px 0',
                padding: '18px',
                backgroundColor: '#0F1220',
                border: '1px solid rgba(250, 58, 82, 0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowLeftRight size={18} color="var(--accent-orange)" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    {compData.title || 'Side-by-Side Comparison Matrix'}
                  </h4>
                </div>
                {toolIds.length >= 2 && (
                  <Link
                    href={`/compare?ids=${toolIds.join(',')}`}
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    Open Full Matrix <ExternalLink size={11} />
                  </Link>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>Attribute</th>
                      {tools.map((t: any, tIdx: number) => (
                        <th key={tIdx} style={{ textAlign: 'left', padding: '8px 10px', color: '#FFFFFF', fontWeight: 700 }}>
                          {t.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>Pricing</td>
                      {tools.map((t: any, tIdx: number) => (
                        <td key={tIdx} style={{ padding: '8px 10px', color: '#10B981', fontWeight: 600 }}>
                          {t.pricing || 'Freemium'}
                        </td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>Category</td>
                      {tools.map((t: any, tIdx: number) => (
                        <td key={tIdx} style={{ padding: '8px 10px', color: '#CBD5E1' }}>
                          {t.category || 'AI'}
                        </td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>Best For</td>
                      {tools.map((t: any, tIdx: number) => (
                        <td key={tIdx} style={{ padding: '8px 10px', color: '#FFFFFF' }}>
                          {t.bestFor || 'General use'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        // Generative UI: Interactive Step-by-Step Workflow Stepper
        if (block.type === 'gen-ui-workflow') {
          const wf = block.payload;
          const steps = wf.steps || [];

          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                margin: '12px 0',
                padding: '18px',
                backgroundColor: '#0E111C',
                border: '1px solid rgba(238, 116, 51, 0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <WorkflowIcon size={18} color="var(--accent-orange)" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  {wf.title || 'Dynamic Automation Workflow'}
                </h4>
              </div>

              {wf.description && (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                  {wf.description}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                {steps.map((st: any, sIdx: number) => (
                  <div
                    key={sIdx}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: BRAND.colors.gradient,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {st.step || sIdx + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>{st.title}</span>
                        {st.duration && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: '#1A1E2E', padding: '2px 6px', borderRadius: '4px' }}>
                            {st.duration}
                          </span>
                        )}
                      </div>

                      {st.tool && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Utilizes:</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', fontWeight: 600 }}>{st.tool}</span>
                        </div>
                      )}

                      {st.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.35 }}>
                          {st.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Generative UI: Action Suggestion Chips
        if (block.type === 'gen-ui-chips') {
          const chips: string[] = block.payload?.chips || block.payload || [];
          const heading = block.payload?.heading;

          return (
            <div key={idx} style={{ margin: '10px 0 4px' }}>
              {heading && (
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {heading}
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {chips.map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => onSendPrompt?.(chip)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(238, 116, 51, 0.08)',
                      border: '1px solid rgba(238, 116, 51, 0.3)',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(238, 116, 51, 0.2)';
                      e.currentTarget.style.borderColor = BRAND.colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(238, 116, 51, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(238, 116, 51, 0.3)';
                    }}
                  >
                    <span>{chip}</span>
                    <ChevronRight size={12} color="var(--accent-orange)" />
                  </button>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
