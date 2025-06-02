import ControlBar from "@/components/custom/ControlBar";
import CustomDrawer from "@/components/custom/CustomDrawer";
import ChatDrawer from "@/components/custom/drawers/ChatDrawer";
import VideoGrid from "@/components/custom/videos/VideoGrid";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useSocket } from "@/hooks/useSocket";
import { generateId } from "@/lib/utils";
import { useCallStore } from "@/store/callStore";
import { useSessionStore } from "@/store/sessionStore";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Socket } from "socket.io-client";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export type DrawerView = "chat" | "participants" | "info";

const MeetPage = () => {
  const [drawerView, setDrawerView] = useState<DrawerView | null>(null);
  useChatSocket();

  const { socket, isConnected } = useSocket();
  const setSocket = useCallStore((state) => state.setSocket);
  const { meetId } = useParams();
  const setRoomId = useSessionStore((state) => state.setRoomId);

  const user = useSessionStore((state) => state.user);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<{ [id: string]: RTCPeerConnection }>({});
  const remoteStreamsMap = useRef<Map<string, MediaStream>>(new Map());

  const addParticipant = useCallStore((state) => state.addParticipant);

  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      setSocket(socket);
    }
  }, [socket, setSocket]);

  useEffect(() => {
    if (socket && !isConnected) {
      navigate("/landing");
    }
  }, [isConnected, navigate, socket]);

  const setupPeerConnection = (
    userId: string,
    socket: Socket,
    localStream: MediaStream,
  ) => {
    if (!user?.id) return;
    const pc = new RTCPeerConnection(configuration);
    peerConnections.current[userId] = pc;

    localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      let remoteStream = remoteStreamsMap.current.get(userId);

      if (!remoteStream) {
        remoteStream = new MediaStream();
        remoteStreamsMap.current.set(userId, remoteStream);

        const hasVideoTrack = event.track.kind === "video";

        addParticipant({
          id: user?.id,
          name: user?.name,
          stream: remoteStream,
          micOn: event.track.kind === "audio",
          cameraOn: hasVideoTrack,
        });
      }

      if (!remoteStream.getTracks().find((t) => t.id === event.track.id)) {
        remoteStream.addTrack(event.track);
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidates", {
          targetId: userId,
          senderId: socket.id,
          candidates: [e.candidate],
        });
      }
    };

    return pc;
  };

  useEffect(() => {
    const initStream = async () => {
      if (!user?.id) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });

        localStreamRef.current = stream;

        addParticipant({
          id: user?.id,
          name: user?.name,
          stream,
          micOn: true,
          cameraOn: false,
        });
      } catch (err) {
        console.error("Failed to get local media:", err);

        // Create an empty stream so WebRTC still works
        const emptyStream = new MediaStream();
        localStreamRef.current = emptyStream;

        addParticipant({
          id: user?.id ?? generateId(16),
          name: user?.name ?? "Guest",
          stream: emptyStream,
          micOn: false,
          cameraOn: false,
        });
      }
    };

    initStream();
  }, [addParticipant]);

  useEffect(() => {
    if (isConnected && socket && meetId) {
      socket.emit("join-room", { roomId: meetId, user });
      setRoomId(meetId);
    }
  }, [isConnected, socket, meetId, setRoomId, user]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("user-joined", async ({ joinedUser }) => {
      const userId = joinedUser.id;
      if (userId === user?.id) return;

      // Pre-create an empty stream and participant UI
      const emptyStream = new MediaStream();
      remoteStreamsMap.current.set(userId, emptyStream);

      addParticipant({
        id: userId,
        name: joinedUser?.name,
        stream: emptyStream,
        micOn: true,
        cameraOn: false,
      });

      // Then create connection
      const pc = setupPeerConnection(userId, socket, localStreamRef.current!);

      const offer = await pc?.createOffer();
      await pc?.setLocalDescription(offer);

      socket.emit("offer", {
        offer,
        targetId: userId,
        senderId: socket.id,
      });
    });

    socket.on("offer", async ({ offer, senderId }) => {
      if (senderId === socket.id) return;
      const pc = setupPeerConnection(senderId, socket, localStreamRef.current!);

      await pc?.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc?.createAnswer();
      await pc?.setLocalDescription(answer);

      socket.emit("answer", {
        answer,
        targetId: senderId,
        senderId: socket.id,
      });
    });

    socket.on("answer", async ({ answer, senderId }) => {
      if (senderId === socket.id) return;
      const pc = peerConnections.current[senderId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidates", async ({ candidates, senderId }) => {
      if (senderId === socket.id) return;
      const pc = peerConnections.current[senderId];
      if (pc) {
        for (const candidate of candidates) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    });

    socket.on("media-state-updated", ({ userId, micOn, cameraOn }) => {
      useCallStore.getState().updateMediaState(userId, { micOn, cameraOn });
    });

    socket.on("user-left", ({ userId }) => {
      const removeParticipant = useCallStore.getState().removeParticipant;
      removeParticipant(userId);
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidates");
      socket.off("user-left");
      socket.off("media-state-updated");
    };
  }, [socket, isConnected]);

  useEffect(() => {
    return () => {
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      socket?.emit("leave-room", meetId);
    };
  }, [socket]);

  const handleLeaveCall = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());

    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};

    socket?.emit("leave-room", meetId);

    useCallStore.getState().clearParticipants();

    navigate("/");
  };

  const handleToggleDrawer = (view: DrawerView) => {
    setDrawerView((currentView) => (currentView === view ? null : view));
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Main content: video grid + drawer */}
      <div className="flex-1 flex overflow-hidden p-4 gap-5">
        <div
          className={`transition-all duration-300 ease-in-out
    ${drawerView !== null ? "w-[calc(100%-400px)]" : "w-full"} `}
        >
          <VideoGrid />
        </div>

        {drawerView === "chat" && (
          <CustomDrawer title="Chat" onClose={() => setDrawerView(null)}>
            {/* <ChatDrawerBody /> */}
            <ChatDrawer />
          </CustomDrawer>
        )}
      </div>

      {/* Control bar */}
      <div className="bottom-0 z-50 w-full h-20 backdrop-blur-md">
        <ControlBar
          onLeave={handleLeaveCall}
          onDrawerOpen={handleToggleDrawer}
        />
      </div>
    </div>
  );
};

export default MeetPage;
