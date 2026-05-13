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
  setApiKey: (key: string) => void;
  setIsSettingsOpen: (open: boolean) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChatHistory: () => void;
  setCurrentGeneratedCode: (code: string) => void;
}

const STORAGE_KEY = "stitch-app-storage";

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      apiKey: "",
      isSettingsOpen: false,
      chatHistory: [],
      currentGeneratedCode: "",

      setApiKey: (key) => set({ apiKey: key }),

      setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),

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

      setCurrentGeneratedCode: (code) => set({ currentGeneratedCode: code }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
);