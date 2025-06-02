import { Participant } from "@/store/callStore";
import { MicOff } from "lucide-react"; // Using lucide for consistent icons
import { useEffect, useRef } from "react";

interface LocalVideoProps {
  participant: Participant;
}

const LocalVideo = ({ participant }: LocalVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideo =
    participant.stream &&
    participant.stream.getVideoTracks().some((track) => track.enabled);

  // console.log("hasVideo: ", hasVideo);

  useEffect(() => {
    const videoEl = videoRef.current;

    if (videoEl && participant.stream) {
      videoEl.srcObject = participant.stream;
    } else if (videoEl) {
      videoEl.srcObject = null;
    }
  }, [participant.stream]); // ✅ removed `hasVideo` dependency

  console.log("HasVideo: ", hasVideo);

  console.log("Stream tracks:", participant.stream?.getVideoTracks());
  console.log("Video element ref:", videoRef.current);

  if (!hasVideo) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-800 text-white text-3xl font-bold relative">
        <div className=" p-4 rounded bg-gray-600">
          {participant.name.charAt(0).toUpperCase()}
        </div>
        {!participant.micOn && (
          <MicOff className="absolute bottom-2 left-2 text-red-500 w-6 h-6" />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain rounded-lg"
      />
      {!participant.micOn && (
        <MicOff className="absolute bottom-2 left-2 text-red-500 w-6 h-6" />
      )}
    </div>
  );
};

export default LocalVideo;
