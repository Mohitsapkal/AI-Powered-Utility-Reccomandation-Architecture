'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Tool } from '@/types';
import { cralyApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';

interface CompareContextType {
  selectedTools: Tool[];
  selectedCount: number;
  maxTools: number;
  addTool: (tool: Tool) => boolean;
  removeTool: (toolId: string) => void;
  toggleTool: (tool: Tool) => void;
  isToolSelected: (toolId: string) => boolean;
  clearCompare: () => void;
  loadToolsByIds: (ids: string[]) => Promise<void>;
}

const MAX_COMPARE_TOOLS = 4;
const STORAGE_KEY = 'aura_compare_tool_ids';

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const { showToast } = useToast();

  // Helper to persist IDs
  const persistIds = (tools: Tool[]) => {
    if (typeof window === 'undefined') return;
    const ids = tools.map((t) => t.id || t._id || '').filter(Boolean);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  };

  // Hydrate tools by IDs from backend
  const loadToolsByIds = useCallback(async (ids: string[]) => {
    const validIds = Array.from(new Set(ids.filter(Boolean))).slice(0, MAX_COMPARE_TOOLS);
    if (validIds.length === 0) return;

    try {
      const toolPromises = validIds.map(async (id) => {
        const detail = await cralyApi.getToolDetail(id);
        if (detail) return detail;
        const list = await cralyApi.getTools({ limit: 100 });
        return list.find((t) => (t.id || t._id) === id) || null;
      });

      const resolved = await Promise.all(toolPromises);
      const nonNull = resolved.filter((t): t is Tool => t !== null);
      if (nonNull.length > 0) {
        setSelectedTools(nonNull);
        persistIds(nonNull);
      }
    } catch (err) {
      console.warn('Failed to hydrate comparison tools:', err);
    }
  }, []);

  // Initial load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        if (Array.isArray(ids) && ids.length > 0) {
          loadToolsByIds(ids);
        }
      }
    } catch {}

    const handleLogout = () => {
      setSelectedTools([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    };
    window.addEventListener('aura:logout', handleLogout);
    return () => window.removeEventListener('aura:logout', handleLogout);
  }, [loadToolsByIds]);

  const isToolSelected = useCallback(
    (toolId: string) => {
      return selectedTools.some((t) => (t.id || t._id) === toolId);
    },
    [selectedTools]
  );

  const addTool = useCallback(
    (tool: Tool): boolean => {
      const toolId = tool.id || tool._id || '';
      if (!toolId) return false;

      if (isToolSelected(toolId)) {
        showToast(`${tool.name} is already in comparison tray.`);
        return false;
      }

      if (selectedTools.length >= MAX_COMPARE_TOOLS) {
        showToast(`You can compare up to ${MAX_COMPARE_TOOLS} tools at once. Remove one to add ${tool.name}.`, 'info');
        return false;
      }

      const next = [...selectedTools, tool];
      setSelectedTools(next);
      persistIds(next);
      showToast(`Added ${tool.name} to comparison!`);
      return true;
    },
    [selectedTools, isToolSelected, showToast]
  );

  const removeTool = useCallback(
    (toolId: string) => {
      const toolToRemove = selectedTools.find((t) => (t.id || t._id) !== toolId);
      const next = selectedTools.filter((t) => (t.id || t._id) !== toolId);
      setSelectedTools(next);
      persistIds(next);
      if (toolToRemove) {
        showToast(`Removed from comparison.`);
      }
    },
    [selectedTools, showToast]
  );

  const toggleTool = useCallback(
    (tool: Tool) => {
      const toolId = tool.id || tool._id || '';
      if (isToolSelected(toolId)) {
        removeTool(toolId);
      } else {
        addTool(tool);
      }
    },
    [isToolSelected, addTool, removeTool]
  );

  const clearCompare = useCallback(() => {
    setSelectedTools([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    showToast('Comparison tray cleared.');
  }, [showToast]);

  return (
    <CompareContext.Provider
      value={{
        selectedTools,
        selectedCount: selectedTools.length,
        maxTools: MAX_COMPARE_TOOLS,
        addTool,
        removeTool,
        toggleTool,
        isToolSelected,
        clearCompare,
        loadToolsByIds,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
