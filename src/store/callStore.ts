import { Socket } from "socket.io-client";
import { create } from "zustand";

export interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  micOn: boolean;
  cameraOn: boolean;
}

interface CallState {
  participants: Participant[];

  socket: Socket | null;

  setSocket: (socket: Socket) => void;

  addParticipant: (participant: Participant) => void;

  removeParticipant: (id: string) => void;

  updateParticipantStream: (id: string, stream: MediaStream) => void;

  toggleMic: (id: string, micOn: boolean) => void;

  toggleCamera: (id: string, cameraOn: boolean) => void;

  selectedSpeakerId: string;

  setSelectedSpeaker: (deviceId: string) => void;

  clearParticipants: () => void;

  updateMediaState: (
    id: string,
    media: Partial<Pick<Participant, "micOn" | "cameraOn" | "stream">>,
  ) => void;
}

export const useCallStore = create<CallState>((set) => ({
  socket: null,

  setSocket: (socket) => set({ socket }),

  selectedSpeakerId: "",

  setSelectedSpeaker: (deviceId) => set({ selectedSpeakerId: deviceId }),

  participants: [],

  addParticipant: (participant) =>
    set((state) => ({ participants: [...state.participants, participant] })),

  removeParticipant: (id) =>
    set((state) => ({
      participants: state.participants.filter(
        (participant) => participant.id !== id,
      ),
    })),

  updateParticipantStream: (id, newStream) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, stream: newStream } : p,
      ),
    }));
  },

  toggleMic: (id, micOn) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, micOn } : p,
      ),
    })),

  toggleCamera: (id, on) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, cameraOn: on } : p,
      ),
    })),

  clearParticipants: () => set(() => ({ participants: [] })),

  updateMediaState: (
    id,
    media: Partial<Pick<Participant, "micOn" | "cameraOn" | "stream">>,
  ) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...media } : p,
      ),
    })),
}));
