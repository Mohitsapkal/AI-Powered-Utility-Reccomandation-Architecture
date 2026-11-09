import { ChatMessage, ChatSession } from '@/types';
import { BRAND } from '@/config/brand';

const SESSIONS_STORAGE_KEY = 'aura_chat_sessions_v2';
const ACTIVE_SESSION_KEY = 'aura_active_chat_session_id';

function generateWelcomeMessage(): ChatMessage {
  return {
    id: 'welcome_' + Date.now(),
    role: 'model',
    text: `${BRAND.assistantGreeting}\n\nI can help you explore verified AI tools, compare benchmarks, build step-by-step automated workflows, and generate dynamic UI widgets. How can I assist you today?`,
    timestamp: Date.now(),
  };
}

export function generateSessionTitle(firstUserMessage: string): string {
  const clean = firstUserMessage.trim().replace(/^([#*>-]|\d+\.)\s*/, '');
  if (!clean) return 'New AI Conversation';
  const words = clean.split(/\s+/).slice(0, 5).join(' ');
  return words.length > 36 ? words.slice(0, 36) + '...' : words;
}

export function makeDefaultTransientSession(title = 'Exploring AI Utilities'): ChatSession {
  const welcomeMsg = generateWelcomeMessage();
  return {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messagePreview: welcomeMsg.text.slice(0, 60),
    messages: [welcomeMsg],
  };
}

export function loadAllSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Migration fallback from older keys
    const legacyCraly = localStorage.getItem('craly_web_chat_history');
    const legacyAura = localStorage.getItem('aura_web_chat_history');
    const legacyRaw = legacyAura || legacyCraly;

    if (legacyRaw) {
      try {
        const legacyMsgs: ChatMessage[] = JSON.parse(legacyRaw);
        if (Array.isArray(legacyMsgs) && legacyMsgs.length > 0) {
          const firstUser = legacyMsgs.find((m) => m.role === 'user');
          const title = firstUser ? generateSessionTitle(firstUser.text) : 'Previous Conversation';
          const migratedSession: ChatSession = {
            id: 'session_' + Date.now(),
            title,
            createdAt: legacyMsgs[0]?.timestamp || Date.now(),
            updatedAt: legacyMsgs[legacyMsgs.length - 1]?.timestamp || Date.now(),
            messagePreview: legacyMsgs[legacyMsgs.length - 1]?.text?.slice(0, 80),
            messages: legacyMsgs,
          };
          saveAllSessions([migratedSession]);
          setActiveSessionId(migratedSession.id);
          return [migratedSession];
        }
      } catch {}
    }

    // Default first session in memory only (DO NOT persist to localStorage until user interacts)
    return [makeDefaultTransientSession('Exploring AI Utilities')];
  } catch (err) {
    console.warn('[ChatStorage] Error loading sessions:', err);
    return [makeDefaultTransientSession('Exploring AI Utilities')];
  }
}

export function saveAllSessions(sessions: ChatSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn('[ChatStorage] Failed to persist chat sessions:', err);
  }
}

export function getActiveSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_SESSION_KEY);
}

export function setActiveSessionId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_SESSION_KEY, id);
}

export function getActiveSession(): ChatSession {
  const sessions = loadAllSessions();
  const activeId = getActiveSessionId();
  if (activeId) {
    const found = sessions.find((s) => s.id === activeId);
    if (found) return found;
  }

  if (sessions.length > 0) {
    return sessions[0];
  }

  return makeDefaultTransientSession('Exploring AI Utilities');
}

export function createNewSession(title?: string): ChatSession {
  const session = makeDefaultTransientSession(title || 'New Conversation');

  if (typeof window !== 'undefined') {
    const sessions = loadAllSessions();
    const updated = [session, ...sessions.filter((s) => s.id !== session.id)];
    saveAllSessions(updated);
    setActiveSessionId(session.id);
  }

  return session;
}

export function saveActiveSessionMessages(
  sessionId: string,
  messages: ChatMessage[],
  customTitle?: string
): void {
  if (typeof window === 'undefined') return;

  // IMPORTANT: Do NOT save to localStorage if there are no user messages!
  // This keeps localStorage 100% clean and empty upon logout or before any user chat interaction.
  const hasUserInteraction = messages.some((m) => m.role === 'user');
  if (!hasUserInteraction) {
    return;
  }

  const sessions = loadAllSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);

  const lastMsg = messages[messages.length - 1];
  const firstUser = messages.find((m) => m.role === 'user');

  let title = customTitle;
  if (!title && index >= 0) {
    title = sessions[index].title;
    if ((title === 'New Conversation' || title === 'Exploring AI Utilities') && firstUser) {
      title = generateSessionTitle(firstUser.text);
    }
  }

  const updatedSession: ChatSession = {
    id: sessionId,
    title: title || 'AI Conversation',
    createdAt: index >= 0 ? sessions[index].createdAt : Date.now(),
    updatedAt: Date.now(),
    messagePreview: lastMsg?.text?.slice(0, 80) || '',
    messages,
  };

  let updatedList: ChatSession[];
  if (index >= 0) {
    updatedList = [...sessions];
    updatedList[index] = updatedSession;
    // Move most recently updated session to top
    updatedList.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
  } else {
    updatedList = [updatedSession, ...sessions];
  }

  saveAllSessions(updatedList);
  setActiveSessionId(sessionId);
}

export function deleteSession(sessionId: string): ChatSession[] {
  if (typeof window === 'undefined') return [];
  const sessions = loadAllSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);

  if (filtered.length === 0) {
    const fresh = createNewSession('New Chat');
    saveAllSessions([fresh]);
    setActiveSessionId(fresh.id);
    return [fresh];
  }

  saveAllSessions(filtered);
  const activeId = getActiveSessionId();
  if (activeId === sessionId) {
    setActiveSessionId(filtered[0].id);
  }

  return filtered;
}

export function renameSession(sessionId: string, newTitle: string): ChatSession[] {
  if (typeof window === 'undefined') return [];
  const sessions = loadAllSessions();
  const updated = sessions.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim() } : s));
  saveAllSessions(updated);
  return updated;
}

export function clearAllSessions(): ChatSession {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SESSIONS_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      localStorage.removeItem('craly_web_chat_history');
      localStorage.removeItem('aura_web_chat_history');
    } catch {}
  }
  return makeDefaultTransientSession('Exploring AI Utilities');
}
