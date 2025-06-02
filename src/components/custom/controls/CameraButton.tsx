import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Check, ChevronDown, Settings, Video, VideoOff } from "lucide-react";
import { useEffect, useState } from "react";

const CameraButton = () => {
  const participants = useCallStore((state) => state.participants);
  const toggleCameraStore = useCallStore((state) => state.toggleCamera);
  const updateParticipantStream = useCallStore(
    (state) => state.updateParticipantStream,
  );
  const user = useSessionStore((state) => state.user);

  const socket = useCallStore((state) => state.socket);

  const localParticipant = participants.find((p) => p.id === user?.id);
  const isCameraOn = localParticipant?.cameraOn ?? false;
  const videoTrack = localParticipant?.stream?.getVideoTracks()[0];

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const getVideoDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setVideoDevices(videoInputs);
    };

    getVideoDevices();
    navigator.mediaDevices.addEventListener("devicechange", getVideoDevices);
    return () =>
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        getVideoDevices,
      );
  }, []);

  useEffect(() => {
    if (videoDevices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(videoDevices[0].deviceId);
    }
  }, [videoDevices, selectedDeviceId]);

  const switchCamera = async (deviceId: string) => {
    if (!user?.id) return;

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: true,
      });

      const oldStream = localParticipant?.stream;
      oldStream?.getVideoTracks().forEach((track) => track.stop());

      updateParticipantStream(user?.id, newStream);
      toggleCameraStore(user?.id, true);

      socket?.emit("update-media-state", {
        userId: user?.id,
        micOn: localParticipant?.micOn ?? false,
        cameraOn: true,
      });
    } catch (error) {
      console.error("Failed to switch camera:", error);
    }
  };

  const handleToggleOff = () => {
    if (!user?.id) return;
    if (videoTrack) {
      videoTrack.enabled = false;
      toggleCameraStore(user?.id, false);

      socket?.emit("update-media-state", {
        userId: user?.id,
        micOn: localParticipant?.micOn ?? false,
        cameraOn: false,
      });
    }
  };

  const getDeviceLabel = (id: string) =>
    videoDevices.find((d) => d.deviceId === id)?.label || "Default Camera";

  return (
    <div
      className={`flex items-center bg-gray-700 cursor-pointer transition-all duration-200 ${
        isCameraOn
          ? "rounded-full border-gray-700"
          : "rounded-md bg-rose-900 border-red-400"
      }`}
    >
      {/* Dropdown for camera selection */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="px-3 rounded-full transition-colors cursor-pointer flex items-center"
            aria-label="Select camera"
          >
            <ChevronDown className="text-white" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-4 flex flex-col xl:flex-row gap-4">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center justify-between w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-800 text-white text-sm"
                aria-label="Select Camera"
              >
                <span className="truncate max-w-[180px]">
                  {getDeviceLabel(selectedDeviceId)}
                </span>
                <ChevronDown className="ml-2 w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-full p-0">
              <div className="max-h-56 overflow-y-auto">
                {videoDevices.map((device) => (
                  <button
                    key={device.deviceId}
                    className={`flex items-center cursor-pointer justify-between w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedDeviceId === device.deviceId
                        ? "bg-gray-200 dark:bg-gray-800"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedDeviceId(device.deviceId);
                      setPopoverOpen(false);
                      if (isCameraOn) switchCamera(device.deviceId);
                    }}
                  >
                    <span className="truncate">
                      {device.label || `Camera ${device.deviceId}`}
                    </span>
                    {selectedDeviceId === device.deviceId && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Settings className="hidden xl:block w-10 h-10" />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Camera toggle button */}
      {isCameraOn ? (
        <button
          onClick={handleToggleOff}
          className="flex items-center cursor-pointer justify-between bg-gray-700 rounded-full"
          aria-label="Turn off camera"
        >
          <Video className="w-14 h-14 p-4 bg-gray-600 rounded-full" />
        </button>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <VideoOff className="w-14 h-14 p-4 rounded-md bg-rose-200 text-red-600" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Turn on camera?</AlertDialogTitle>
              <AlertDialogDescription>
                This will allow your camera to be accessed and start video
                streaming.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => switchCamera(selectedDeviceId)}>
                Turn on
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default CameraButton;
