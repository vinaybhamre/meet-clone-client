import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
}

interface SessionStore {
  user: User | null;
  roomId: string | null;

  setUser: (user: User | null) => void;
  setRoomId: (roomId: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  roomId: null,

  setUser: (user) => set({ user }),
  setRoomId: (roomId) => set({ roomId }),

  clearSession: () => set({ user: null, roomId: null }),
}));
