"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AppState {
  apiKey: string;
  isSettingsOpen: boolean;
  chatHistory: ChatMessage[];
  currentGeneratedCode: string;
  codeHistory: string[];
  historyIndex: number;
  isGenerating: boolean;
  setApiKey: (key: string) => void;
  setIsSettingsOpen: (open: boolean) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChatHistory: () => void;
  setCurrentGeneratedCode: (code: string) => void;
  setIsGenerating: (generating: boolean) => void;
  undoCode: () => void;
  redoCode: () => void;
}

const STORAGE_KEY = "stitch-app-storage";

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      apiKey: "",
      isSettingsOpen: false,
      chatHistory: [],
      currentGeneratedCode: "",
      codeHistory: [""],
      historyIndex: 0,
      isGenerating: false,

      setApiKey: (key) => set({ apiKey: key }),

      setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),

      setIsGenerating: (generating) => set({ isGenerating: generating }),

      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),

      clearChatHistory: () => set({ chatHistory: [] }),

      setCurrentGeneratedCode: (code) => set((state) => {
        if (code === state.currentGeneratedCode || !code.trim()) return state;
        
        const newHistory = state.codeHistory.slice(0, state.historyIndex + 1);
        newHistory.push(code);
        
        return {
          currentGeneratedCode: code,
          codeHistory: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }),

      undoCode: () => set((state) => {
        if (state.historyIndex <= 0) return state;
        const newIndex = state.historyIndex - 1;
        return {
          historyIndex: newIndex,
          currentGeneratedCode: state.codeHistory[newIndex],
        };
      }),

      redoCode: () => set((state) => {
        if (state.historyIndex >= state.codeHistory.length - 1) return state;
        const newIndex = state.historyIndex + 1;
        return {
          historyIndex: newIndex,
          currentGeneratedCode: state.codeHistory[newIndex],
        };
      }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ 
        apiKey: state.apiKey,
        codeHistory: state.codeHistory,
        historyIndex: state.historyIndex,
      }),
    }
  )
);