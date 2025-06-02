import { Info, MessageCircle, Users } from "lucide-react";
import ButtonsRow from "./controls/ButtonRow";
import CameraButton from "./controls/CameraButton";
import LeaveButton from "./controls/LeaveButton";
// import MicButton from "./controls/MicButton";
import MicsButton from "./controls/MicsButton";

interface ControlBarProps {
  onLeave: () => void;
  onDrawerOpen: (view: "chat" | "participants" | "info") => void;
}

const ControlBar = ({ onLeave, onDrawerOpen }: ControlBarProps) => {
  return (
    <div className="w-full h-full bottom-0 bg-black/80 py-4 text-white flex justify-between items-center">
      {/* Left: Time + Meeting ID */}
      <div className="flex items-center gap-4 font-medium text-sm pl-4 md:text-xl">
        <span>
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="hidden md:inline">|</span>
        <span className="truncate max-w-[100px] md:max-w-none">
          abc-def-ghi
        </span>
      </div>

      {/* Center: Controls */}
      <div className="flex items-center py-2 gap-4">
        {/* <MicButton /> */}
        <MicsButton />
        <CameraButton />
        <ButtonsRow />
        <LeaveButton onLeave={onLeave} />
      </div>

      {/* Right: Info, Chat, More */}
      <div className="flex items-center gap-6 pr-4">
        <button
          onClick={() => onDrawerOpen("info")}
          className="p-3 rounded-full cursor-pointer  hover:bg-gray-600 transition"
        >
          <Info size={30} />
        </button>
        <button
          onClick={() => onDrawerOpen("chat")}
          className="p-3 rounded-full cursor-pointer  hover:bg-gray-600 transition"
        >
          <MessageCircle size={30} />
        </button>
        <button
          onClick={() => onDrawerOpen("participants")}
          className="p-3 rounded-full cursor-pointer  hover:bg-gray-600 transition"
        >
          <Users size={30} />
        </button>
      </div>
    </div>
  );
};

export default ControlBar;
