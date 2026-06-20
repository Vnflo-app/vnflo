import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  reasoning_details?: any; // Added this field to support reasoning mode
}

interface AIChatState {
  messages: ChatMessage[];
  isGenerating: boolean;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setIsGenerating: (loading: boolean) => void;
  clearChat: () => void;
}

export const useAIChatStore = create<AIChatState>((set) => ({
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I am your AI Diagram Assistant. I can help you build new diagrams, edit nodes, change colors, shapes, and layout structure. Tell me what you'd like to do!",
      timestamp: Date.now()
    }
  ],
  isGenerating: false,
  addMessage: (msg) => set((s) => ({
    messages: [...s.messages, { ...msg, id: crypto.randomUUID(), timestamp: Date.now() }]
  })),
  setMessages: (messages) => set({ messages }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  clearChat: () => set({
    messages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Hi there! I am your AI Diagram Assistant. I can help you build new diagrams, edit nodes, change colors, shapes, and layout structure. Tell me what you'd like to do!",
        timestamp: Date.now()
      }
    ]
  }),
}));