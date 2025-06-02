import { Participant } from "@/store/callStore";
import { MicOff } from "lucide-react";
import { useEffect, useRef } from "react";
import RemoteAudioRenderer from "../controls/RemoteAudioRenderer";

interface RemoteVideoProps {
  participant: Participant;
}

const RemoteVideo = ({ participant }: RemoteVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const hasVideoTrack = participant.stream
    ?.getVideoTracks()
    .some((track) => track.enabled);

  const showVideo = participant.cameraOn && hasVideoTrack;

  return (
    <div className="relative w-full h-full">
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-800 text-white text-3xl font-bold rounded-lg">
          <div className=" p-4 px-6 rounded-full bg-red-600">
            {participant.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Mic and camera status overlay */}
      <div className="absolute bottom-2 left-2 flex gap-2 z-10">
        {!participant.micOn && (
          <div className="bg-black/70 p-2 rounded-full">
            <MicOff className="text-white w-6 h-6" />
          </div>
        )}
      </div>

      {/* Audio rendering for remote user */}
      {participant.id !== "local" && participant.stream && (
        <RemoteAudioRenderer stream={participant.stream} />
      )}
    </div>
  );
};

export default RemoteVideo;
