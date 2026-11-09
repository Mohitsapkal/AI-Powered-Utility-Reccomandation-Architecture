'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  Terminal,
  Layers,
  Wrench,
  X,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  History,
  MessageSquare,
  Search,
} from 'lucide-react';
import { ChatMessage, ChatSession } from '@/types';
import { generateAiResponse } from '@/services/gemini';
import { useToast } from '@/context/ToastContext';
import { BRAND } from '@/config/brand';
import GenerativeUiRenderer from '@/components/chat/GenerativeUiRenderer';
import {
  loadAllSessions,
  getActiveSession,
  saveActiveSessionMessages,
  createNewSession,
  deleteSession,
  setActiveSessionId,
  clearAllSessions,
} from '@/services/chatStorage';

export default function CralyAiPage() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; base64: string; type: string } | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Load sessions from local storage
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
    };
    window.addEventListener('aura:logout', handleLogout);
    return () => window.removeEventListener('aura:logout', handleLogout);
  }, []);

  // Save active session messages to local storage (only if user interacted)
  useEffect(() => {
    if (currentSessionId && messages.length > 0 && messages.some((m) => m.role === 'user')) {
      saveActiveSessionMessages(currentSessionId, messages);
      setSessions(loadAllSessions());
    }
  }, [messages, currentSessionId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Fullscreen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      pageContainerRef.current?.requestFullscreen().catch(() => {
        setIsFullScreen((prev) => !prev);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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
      showToast('Speech recognition not supported in this browser.', 'error');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak your prompt now.', 'info');
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${text}` : text));
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('Image size should be under 4MB', 'error');
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
      showToast('Error communicating with AI engine.', 'error');
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
    setShowMobileSidebar(false);
    showToast('New conversation initialized');
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setActiveSessionId(session.id);
    setMessages(session.messages || []);
    setShowMobileSidebar(false);
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
    showToast('Session removed');
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      ref={pageContainerRef}
      style={{
        display: 'flex',
        height: isFullScreen ? '100vh' : 'calc(100vh - 80px)',
        backgroundColor: '#090B12',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar: Chat History List */}
      <div
        style={{
          width: '300px',
          backgroundColor: '#0E111C',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
        className="hide-scrollbar"
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="var(--accent-orange)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF' }}>Chat History</span>
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
          >
            <Plus size={14} /> New Chat
          </button>
        </div>

        {/* Search Filter */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#07090F',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '0.8rem',
              }}
            />
          </div>
        </div>

        {/* Sessions List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }} className="hide-scrollbar">
          {filteredSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No conversations found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredSessions.map((session) => {
                const isActive = session.id === currentSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isActive ? 'rgba(238, 116, 51, 0.15)' : 'transparent',
                      border: isActive ? `1px solid ${BRAND.colors.primary}` : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {session.title}
                      </div>
                      {session.messagePreview && (
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '2px',
                          }}
                        >
                          {session.messagePreview}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        opacity: 0.6,
                      }}
                      title="Delete Conversation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{sessions.length} local sessions</span>
          <span style={{ color: '#10B981' }}>● Storage Active</span>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0B0D18', overflow: 'hidden' }}>
        {/* Canvas Toolbar */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#111422',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
                boxShadow: `0 2px 10px ${BRAND.colors.glow}`,
                padding: '3px',
              }}
            >
              <img src={BRAND.logoIcon} alt={BRAND.assistantName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  {BRAND.assistantName} Workspace
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: BRAND.colors.primary,
                    backgroundColor: 'rgba(238, 116, 51, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Generative UI Active
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Interactive tool cards &bull; live comparisons &bull; workflow generation
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleNewChat}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            >
              <Plus size={14} /> New Session
            </button>

            <button
              type="button"
              onClick={toggleFullScreen}
              className="btn-icon"
              style={{ width: '34px', height: '34px', color: 'var(--text-muted)' }}
              title={isFullScreen ? 'Exit Full Screen' : 'Toggle Full Screen'}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '1080px',
            margin: '0 auto',
            width: '100%',
          }}
          className="hide-scrollbar"
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
                    maxWidth: isUser ? '85%' : '96%',
                    padding: isUser ? '14px 18px' : '20px 24px',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: isUser ? BRAND.colors.primary : '#131627',
                    background: isUser ? BRAND.colors.gradient : '#131627',
                    color: '#FFFFFF',
                    border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isUser
                      ? `0 4px 16px ${BRAND.colors.glow}`
                      : '0 6px 24px rgba(0, 0, 0, 0.4)',
                    wordBreak: 'break-word',
                  }}
                >
                  {/* Attached Image Preview */}
                  {msg.mediaUrl && (
                    <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', maxHeight: '240px' }}>
                      <img src={msg.mediaUrl} alt="Attached input" style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Generative UI Renderer for Bot Responses, simple text for User */}
                  {isUser ? (
                    <div style={{ fontSize: '0.94rem', lineHeight: 1.5 }}>{msg.text}</div>
                  ) : (
                    <GenerativeUiRenderer content={msg.text} onSendPrompt={handleSendMessage} />
                  )}
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 6px' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 20px',
                backgroundColor: '#131627',
                borderRadius: '16px',
                width: 'fit-content',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Sparkles size={18} color={BRAND.colors.primary} className="spin" />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Synthesizing response and building dynamic UI components...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '16px 32px 24px',
            backgroundColor: '#0F121F',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Image preview thumbnail */}
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
                maxWidth: '1080px',
                margin: '0 auto 8px',
              }}
            >
              <img src={imagePreview.url} alt="upload preview" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />
              <span style={{ fontSize: '0.78rem', color: '#FFFFFF' }}>Image attached</span>
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
              gap: '10px',
              backgroundColor: '#070910',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px 14px',
              maxWidth: '1080px',
              margin: '0 auto',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            }}
          >
            {/* Image Upload Input */}
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
              style={{ width: '36px', height: '36px', color: 'var(--text-muted)' }}
              title="Attach Image"
            >
              <ImageIcon size={18} />
            </button>

            {/* Voice Input */}
            <button
              type="button"
              onClick={toggleListening}
              className="btn-icon"
              style={{
                width: '36px',
                height: '36px',
                color: isListening ? '#EF4444' : 'var(--text-muted)',
                backgroundColor: isListening ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              }}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder={isListening ? 'Listening... Speak now' : 'Ask about AI tools, compare benchmarks, or generate dynamic workflows...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '0.94rem',
              }}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isGenerating || (!input.trim() && !imagePreview)}
              className="btn btn-primary"
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                opacity: isGenerating || (!input.trim() && !imagePreview) ? 0.5 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
