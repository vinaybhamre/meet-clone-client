import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCallStore } from "@/store/callStore";
import { useSessionStore } from "@/store/sessionStore";
import {
  AudioLines,
  Check,
  ChevronDown,
  Mic,
  MicOff,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

const MicsButton = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>("");

  const user = useSessionStore((state) => state.user);

  const socket = useCallStore((state) => state.socket);

  // Popover open states
  const [micPopoverOpen, setMicPopoverOpen] = useState(false);
  const [speakerPopoverOpen, setSpeakerPopoverOpen] = useState(false);

  const participants = useCallStore((state) => state.participants);
  const toggleMicStore = useCallStore((state) => state.toggleMic);
  const localParticipant = participants.find((p) => p.id === user?.id);
  const isMicOn = localParticipant?.micOn ?? true;
  const audioTrack = localParticipant?.stream?.getAudioTracks()[0];

  const setSelectedSpeaker = useCallStore((s) => s.setSelectedSpeaker);
  const selectedSpeaker = useCallStore((s) => s.selectedSpeakerId);

  // Fetch devices and set defaults
  useEffect(() => {
    const getDevices = async () => {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(mediaDevices);
      if (!selectedMic) {
        const defaultMic = mediaDevices.find((d) => d.kind === "audioinput");
        if (defaultMic) setSelectedMic(defaultMic.deviceId);
      }
      if (!selectedSpeaker) {
        const defaultSpeaker = mediaDevices.find(
          (d) => d.kind === "audiooutput",
        );
        if (defaultSpeaker) setSelectedSpeaker(defaultSpeaker.deviceId);
      }
    };
    getDevices();
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!audioTrack || !isMicOn) return;
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(
      new MediaStream([audioTrack]),
    );
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    const interval = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setIsSpeaking(avg > 30); // Lowered threshold
    }, 200);

    return () => {
      clearInterval(interval);
      audioContext.close();
    };
  }, [audioTrack, isMicOn]);

  const handleMicChange = async (deviceId: string) => {
    if (!user?.id) return;
    setSelectedMic(deviceId);
    setMicPopoverOpen(false);

    try {
      // Get a new stream from selected mic
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false,
      });

      const newAudioTrack = newStream.getAudioTracks()[0];
      if (!newAudioTrack) return;

      // replace the audio track in your local participant's stream
      if (localParticipant?.stream) {
        // Remove old audio track
        const oldTracks = localParticipant.stream.getAudioTracks();

        oldTracks.forEach((track) => {
          localParticipant.stream?.removeTrack(track);
          track.stop();
        });

        // add new audio track
        localParticipant.stream.addTrack(newAudioTrack);

        // update the stream in the store
        useCallStore
          .getState()
          .updateParticipantStream(user?.id, localParticipant.stream);
      }
    } catch (err) {
      console.error("Failed to switch microphone: ", err);
    }
  };

  const handleSpeakerChange = (deviceId: string) => {
    setSelectedSpeaker(deviceId);
    setSpeakerPopoverOpen(false);
  };

  const toggleMic = () => {
    if (!user?.id) return;
    if (audioTrack) {
      const newState = !audioTrack.enabled;
      audioTrack.enabled = newState;
      toggleMicStore(user?.id, newState);
      setIsSpeaking(false);

      socket?.emit("update-media-state", {
        userId: user?.id,
        micOn: newState,
        cameraOn: localParticipant?.cameraOn ?? false,
      });
    }
  };

  // Helper to get device label
  const getDeviceLabel = (id: string, kind: "audioinput" | "audiooutput") =>
    devices.find((d) => d.deviceId === id && d.kind === kind)?.label ||
    (kind === "audioinput" ? "Default Microphone" : "Default Speaker");

  return (
    <div
      className={`flex items-center bg-gray-700 cursor-pointer transition-all duration-200 ${
        isMicOn
          ? "rounded-full border-gray-700"
          : "rounded-md bg-rose-900 border-red-400"
      }`}
    >
      {/* Dropdown for device selection */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="px-3 rounded-full transition-colors flex items-center"
            aria-label="Select audio devices"
          >
            {isSpeaking ? (
              <AudioLines className="text-green-600" />
            ) : (
              <ChevronDown className="text-white" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className=" p-4 flex flex-col xl:flex-row gap-4">
          {/* Microphone select-like trigger */}
          <Popover open={micPopoverOpen} onOpenChange={setMicPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center justify-between w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-800 text-white text-sm"
                aria-label="Select Microphone"
              >
                <span className="truncate max-w-[180px]">
                  {getDeviceLabel(selectedMic, "audioinput")}
                </span>
                <ChevronDown className="ml-2 w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-full p-0">
              <div className="max-h-56 overflow-y-auto">
                {devices
                  .filter((d) => d.kind === "audioinput")
                  .map((device) => (
                    <button
                      key={device.deviceId}
                      className={`flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedMic === device.deviceId
                          ? "bg-gray-200 dark:bg-gray-800"
                          : ""
                      }`}
                      onClick={() => handleMicChange(device.deviceId)}
                    >
                      <span className="truncate">
                        {device.label || "Default Microphone"}
                      </span>
                      {selectedMic === device.deviceId && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Speaker select-like trigger */}
          <Popover
            open={speakerPopoverOpen}
            onOpenChange={setSpeakerPopoverOpen}
          >
            <PopoverTrigger asChild>
              <button
                className="flex items-center justify-between w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-800 text-white text-sm"
                aria-label="Select Speaker"
              >
                <span className="truncate max-w-[180px]">
                  {getDeviceLabel(selectedSpeaker, "audiooutput")}
                </span>
                <ChevronDown className="ml-2 w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-full p-0">
              <div className="max-h-56 overflow-y-auto">
                {devices
                  .filter((d) => d.kind === "audiooutput")
                  .map((device) => (
                    <button
                      key={device.deviceId}
                      className={`flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedSpeaker === device.deviceId
                          ? "bg-gray-200 dark:bg-gray-800"
                          : ""
                      }`}
                      onClick={() => handleSpeakerChange(device.deviceId)}
                    >
                      <span className="truncate">
                        {device.label || "Default Speaker"}
                      </span>
                      {selectedSpeaker === device.deviceId && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  ))}
              </div>
            </PopoverContent>
          </Popover>

          <Settings className=" hidden xl:block w-20 h-12" />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mic toggle button */}
      <button
        onClick={toggleMic}
        className={`flex items-center justify-between bg-gray-700 cursor-pointer transition-all duration-200 ${
          isMicOn
            ? "rounded-full border-gray-700"
            : "rounded-md bg-rose-900 border-red-400"
        }`}
        aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
      >
        {isMicOn ? (
          <Mic className="w-14 h-14 p-4 bg-gray-600 rounded-full" />
        ) : (
          <MicOff className="w-14 h-14 p-4 bg-rose-200 rounded-md text-red-600" />
        )}
      </button>
    </div>
  );
};

export default MicsButton;
