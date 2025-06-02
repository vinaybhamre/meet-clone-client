import { ChatMessage } from "@/types";
import { create } from "zustand";
import { useSessionStore } from "./sessionStore";

interface ChatStore {
  messages: ChatMessage[];

  addMessage: (message: ChatMessage) => void;

  setMessages: (messages: ChatMessage[]) => void;

  getMessagesForView: (receiverId: string | null) => ChatMessage[];
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  setMessages: (messages) => {
    set({ messages });
  },

  getMessagesForView: (receiverId) => {
    const myId = useSessionStore.getState().user?.id;
    if (!myId) return [];

    return get().messages.filter((msg) => {
      if (receiverId === null) {
        return msg.receiverId === null;
      } else {
        return (
          (msg.senderId === myId && msg.receiverId === receiverId) ||
          (msg.senderId === receiverId && msg.receiverId === myId)
        );
      }
    });
  },
}));
