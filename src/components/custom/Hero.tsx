import { generateRoomId } from "@/lib/utils";
import { useSessionStore } from "@/store/sessionStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const Hero = () => {
  const navigate = useNavigate();
  const user = useSessionStore((state) => state.user);
  const [roomCode, setRoomCode] = useState("");

  const handleCreateMeeting = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const newRoomId = generateRoomId();
    navigate(`/meet/${newRoomId}`);
  };

  const handleJoinMeeting = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!roomCode.trim()) return;
    navigate(`/meet/${roomCode.trim()}`);
  };

  return (
    <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left p-5 mt-4 gap-12">
      <h1 className="text-4xl md:text-6xl font-medium">
        Video calls and meetings for everyone
      </h1>
      <h2 className="text-xl sm:text-3xl md:w-3/4">
        Connect, collaborate, and celebrate from anywhere with Google Meet
      </h2>
      <div className="w-full flex flex-col 2xl:flex-row gap-5">
        <Button
          onClick={handleCreateMeeting}
          className="sm:w-60 sm:h-16 sm:text-2xl cursor-pointer"
        >
          New Meeting
        </Button>
        <div className="flex-1 flex flex-col gap-4 md:flex-row">
          <Input
            className="md:h-16 md:text-2xl"
            placeholder="Enter a code or link"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <Button
            onClick={handleJoinMeeting}
            className="sm:w-28 sm:h-16 sm:text-2xl cursor-pointer"
            variant="ghost"
          >
            Join
          </Button>
        </div>
      </div>

      <p className="h-0.5 w-full bg-black"></p>
    </div>
  );
};

export default Hero;
