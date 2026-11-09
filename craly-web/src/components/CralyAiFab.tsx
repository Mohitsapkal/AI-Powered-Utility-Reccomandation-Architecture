'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  Plus,
  History,
  Trash2,
  ExternalLink,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { ChatMessage, ChatSession } from '@/types';
import { generateAiResponse } from '@/services/gemini';
import { useToast } from '@/context/ToastContext';
import { useCompare } from '@/context/CompareContext';
import { usePathname } from 'next/navigation';
import { BRAND } from '@/config/brand';
import GenerativeUiRenderer from './chat/GenerativeUiRenderer';
import {
  loadAllSessions,
  getActiveSession,
  saveActiveSessionMessages,
  createNewSession,
  deleteSession,
  setActiveSessionId,
  clearAllSessions,
} from '@/services/chatStorage';

export default function CralyAiFab() {
  const { showToast } = useToast();
  const { selectedCount } = useCompare();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);

  // Sessions and messages
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Input states
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; base64: string; type: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize active session from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const all = loadAllSessions();
      setSessions(all);
      const active = getActiveSession();
      setCurrentSessionId(active.id);
      setMessages(active.messages || []);
    }

    const handleLogout = () => {
      const fresh = clearAllSessions();
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
      setMessages(fresh.messages || []);
      setIsOpen(false);
    };
    window.addEventListener('aura:logout', handleLogout);
    return () => window.removeEventListener('aura:logout', handleLogout);
  }, []);

  // Save session messages to localStorage whenever messages update (only if user interacted)
  useEffect(() => {
    if (currentSessionId && messages.length > 0 && messages.some((m) => m.role === 'user')) {
      saveActiveSessionMessages(currentSessionId, messages);
      setSessions(loadAllSessions());
    }
  }, [messages, currentSessionId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isGenerating]);

  // Voice recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak your prompt now.', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('Image size should be less than 4MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImagePreview({
        url: URL.createObjectURL(file),
        base64,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || input;
    if ((!content.trim() && !imagePreview) || isGenerating) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: content.trim(),
      base64Data: imagePreview?.base64,
      mediaType: imagePreview?.type,
      mediaUrl: imagePreview?.url,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setImagePreview(null);
    setIsGenerating(true);

    try {
      const reply = await generateAiResponse(newHistory);
      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'model',
        text: reply,
        timestamp: Date.now(),
      };
      setMessages([...newHistory, botMsg]);
    } catch {
      showToast('Failed to receive response from AI.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Session switching & creation
  const handleNewChat = () => {
    const fresh = createNewSession();
    setCurrentSessionId(fresh.id);
    setMessages(fresh.messages || []);
    setSessions(loadAllSessions());
    showToast('Started new conversation');
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setActiveSessionId(session.id);
    setMessages(session.messages || []);
    setShowHistorySidebar(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const updated = deleteSession(sessionId);
    setSessions(updated);
    if (currentSessionId === sessionId) {
      const active = getActiveSession();
      setCurrentSessionId(active.id);
      setMessages(active.messages || []);
    }
    showToast('Conversation deleted');
  };

  // Hide floating FAB on /bot since user is already in the dedicated full workspace
  if (pathname === '/bot') {
    return null;
  }

  const isDockVisible = selectedCount > 0 && pathname !== '/compare';

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="craly-fab"
          style={{
            bottom: isDockVisible ? '96px' : '28px',
            right: '28px',
            color: '#FFFFFF',
            backgroundColor: '#121524',
            border: '1px solid rgba(250, 58, 82, 0.45)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 24px rgba(250, 58, 82, 0.3)',
            animation: 'pulseGlow 3s infinite ease-in-out',
            transition: 'bottom 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease',
          }}
          title={`Open ${BRAND.assistantName}`}
        >
          <div className="craly-fab-avatar" style={{ overflow: 'hidden', padding: '3px' }}>
            <img src={BRAND.logoIcon} alt={BRAND.assistantName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span className="craly-fab-label" style={{ color: '#FFFFFF', fontWeight: 700 }}>
            {BRAND.assistantName}
          </span>
        </button>
      )}

      {/* Chat Window: Drawer or Fullscreen */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            ...(isFullScreen
              ? {
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  borderRadius: 0,
                  zIndex: 99999,
                }
              : {
                  bottom: '24px',
                  right: '24px',
                  width: '450px',
                  maxWidth: 'calc(100vw - 32px)',
                  height: '660px',
                  maxHeight: 'calc(100vh - 48px)',
                  borderRadius: 'var(--radius-lg)',
                  zIndex: 9999,
                }),
            backgroundColor: '#0F121E',
            border: isFullScreen ? 'none' : '1px solid rgba(250, 58, 82, 0.35)',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(250, 58, 82, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.25s ease-in-out',
          }}
          className="slide-up"
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#141829',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 2px 10px ${BRAND.colors.glow}`,
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '2px',
                }}
              >
                <img src={BRAND.logoIcon} alt={BRAND.assistantName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF' }}>{BRAND.assistantName}</span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: BRAND.colors.primary,
                      backgroundColor: 'rgba(238, 116, 51, 0.15)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Gen-UI
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  Online &bull; Local Storage Synced
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* History Toggle */}
              <button
                type="button"
                onClick={() => setShowHistorySidebar((prev) => !prev)}
                className="btn-icon"
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: showHistorySidebar ? 'rgba(238, 116, 51, 0.2)' : 'transparent',
                  color: showHistorySidebar ? BRAND.colors.primary : 'var(--text-muted)',
                }}
                title="Chat History"
              >
                <History size={15} />
              </button>

              {/* New Chat Button */}
              <button
                type="button"
                onClick={handleNewChat}
                className="btn-icon"
                style={{ width: '30px', height: '30px', color: 'var(--text-muted)' }}
                title="New Chat Session"
              >
                <Plus size={15} />
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setIsFullScreen((prev) => !prev)}
                className="btn-icon"
                style={{ width: '30px', height: '30px', color: 'var(--text-muted)' }}
                title={isFullScreen ? 'Exit Full Screen' : 'Expand to Full Screen'}
              >
                {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              {/* Open in Dedicated Page */}
              <Link
                href="/bot"
                className="btn-icon"
                style={{ width: '30px', height: '30px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Open Dedicated Full Page (/bot)"
              >
                <ExternalLink size={14} />
              </Link>

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-icon"
                style={{ width: '30px', height: '30px', color: 'var(--text-muted)' }}
                title="Close Assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Area with optional Sessions History Drawer */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
            {/* History Sidebar */}
            {showHistorySidebar && (
              <div
                style={{
                  width: isFullScreen ? '280px' : '220px',
                  backgroundColor: '#0A0C14',
                  borderRight: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Chat History
                  </span>
                  <button
                    type="button"
                    onClick={handleNewChat}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: BRAND.colors.primary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={12} /> New
                  </button>
                </div>

                <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {sessions.map((s) => {
                    const isActive = s.id === currentSessionId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSession(s)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isActive ? 'rgba(238, 116, 51, 0.15)' : 'transparent',
                          border: isActive ? `1px solid ${BRAND.colors.primary}` : '1px solid transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#FFFFFF' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.title}
                          </div>
                          {s.messagePreview && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {s.messagePreview}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, s.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            opacity: 0.6,
                          }}
                          title="Delete Session"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat Messages Feed */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: isFullScreen ? '24px 32px' : '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxWidth: isFullScreen ? '1000px' : '100%',
                margin: isFullScreen ? '0 auto' : undefined,
                width: isFullScreen ? '100%' : undefined,
              }}
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: isUser ? '85%' : '94%',
                        padding: isUser ? '12px 16px' : '16px 20px',
                        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        backgroundColor: isUser ? BRAND.colors.primary : '#141828',
                        background: isUser ? BRAND.colors.gradient : '#141828',
                        color: '#FFFFFF',
                        border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: isUser
                          ? `0 4px 16px ${BRAND.colors.glow}`
                          : '0 4px 20px rgba(0, 0, 0, 0.4)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {/* Attached Image Preview */}
                      {msg.mediaUrl && (
                        <div style={{ marginBottom: '10px', borderRadius: '8px', overflow: 'hidden', maxHeight: '180px' }}>
                          <img src={msg.mediaUrl} alt="Attached input" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'cover' }} />
                        </div>
                      )}

                      {/* Generative UI Renderer for Bot Responses, simple text for User */}
                      {isUser ? (
                        <div style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>{msg.text}</div>
                      ) : (
                        <GenerativeUiRenderer content={msg.text} onSendPrompt={handleSendMessage} />
                      )}
                    </div>

                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}

              {isGenerating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#141828', borderRadius: '14px', width: 'fit-content', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Sparkles size={16} color={BRAND.colors.primary} className="spin" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Generating interactive recommendations...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Footer Input Form */}
          <div
            style={{
              padding: isFullScreen ? '16px 32px 24px' : '12px 16px',
              backgroundColor: '#121524',
              borderTop: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}
          >
            {/* Image Preview Thumbnail */}
            {imagePreview && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#1B1F33',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <img src={imagePreview.url} alt="upload preview" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />
                <span style={{ fontSize: '0.75rem', color: '#FFFFFF' }}>Image attached</span>
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#080A12',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 10px',
                maxWidth: isFullScreen ? '1000px' : '100%',
                margin: isFullScreen ? '0 auto' : undefined,
              }}
            >
              {/* Image Input Trigger */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-icon"
                style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }}
                title="Attach Image"
              >
                <ImageIcon size={16} />
              </button>

              {/* Voice Recognition Trigger */}
              <button
                type="button"
                onClick={toggleListening}
                className="btn-icon"
                style={{
                  width: '32px',
                  height: '32px',
                  color: isListening ? '#EF4444' : 'var(--text-muted)',
                  backgroundColor: isListening ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                }}
                title={isListening ? 'Stop Listening' : 'Voice Input'}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                placeholder={isListening ? 'Listening...' : 'Ask about AI tools, compare specs, or build workflows...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isGenerating || (!input.trim() && !imagePreview)}
                className="btn btn-primary"
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  opacity: isGenerating || (!input.trim() && !imagePreview) ? 0.5 : 1,
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
