// components/RemoteAudioRenderer.tsx
import { useCallStore } from "@/store/callStore";
import { useEffect, useRef } from "react";

interface RemoteAudioRendererProps {
  stream: MediaStream;
}

const RemoteAudioRenderer = ({ stream }: RemoteAudioRendererProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const selectedSpeakerId = useCallStore((s) => s.selectedSpeakerId);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (audioRef.current && selectedSpeakerId) {
      const audio = audioRef.current as HTMLAudioElement & {
        setSinkId?: (sinkId: string) => Promise<void>;
      };

      if (typeof audio.setSinkId === "function") {
        audio.setSinkId(selectedSpeakerId).catch((err) => {
          console.warn("Failed to set audio output device:", err);
        });
      } else {
        console.warn("setSinkId is not supported in this browser.");
      }
    }
  }, [selectedSpeakerId]);

  return <audio ref={audioRef} autoPlay playsInline />;
};

export default RemoteAudioRenderer;
