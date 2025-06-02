import LocalVideo from "@/components/custom/videos/LocalVideo";
import { useCallStore } from "@/store/callStore";
import RemoteVideo from "./RemoteVideo";

const VideoGrid = () => {
  const participants = useCallStore((state) => state.participants);

  return (
    <div
      className="
        grid 
        gap-4 
        w-full 
        h-full 
        grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))]
      "
    >
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="bg-black rounded-xl h-full overflow-hidden flex items-center justify-center relative w-full aspect-video"
        >
          {participant.id === "local" ? (
            <LocalVideo participant={participant} />
          ) : (
            <RemoteVideo participant={participant} />
          )}
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
