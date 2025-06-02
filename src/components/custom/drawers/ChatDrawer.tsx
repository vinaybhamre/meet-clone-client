import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateId } from "@/lib/utils";
import { useCallStore } from "@/store/callStore";
import { useChatStore } from "@/store/chatStore";
import { useSessionStore } from "@/store/sessionStore";
import { ChatMessage } from "@/types";
import { useEffect, useMemo, useRef, useState } from "react";

const ChatDrawer = () => {
  const [input, setInput] = useState("");
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | null>(
    null,
  );

  const roomId = useSessionStore((state) => state.roomId);
  const socket = useCallStore((state) => state.socket);
  const user = useSessionStore((state) => state.user);

  const participants = useCallStore((state) => state.participants);
  const myUserId = user?.id;

  const otherParticipants = participants.filter((p) => p.id !== myUserId);

  const messages = useChatStore((state) => state.messages);

  const addMessage = useChatStore((state) => state.addMessage);

  const filteredMessages = useMemo(() => {
    if (!myUserId) return [];
    return messages.filter((msg) => {
      if (msg.type === "group") {
        return msg.roomId === roomId;
      }

      return (
        msg.roomId === roomId &&
        (msg.senderId === myUserId || msg.receiverId === myUserId)
      );
    });
  }, [messages, myUserId, roomId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  const handleSend = () => {
    if (!input.trim() || !myUserId || !roomId) return;

    const isPrivate = selectedReceiverId !== null;

    const newMessage: ChatMessage = {
      id: generateId(12),
      senderId: myUserId!,
      senderName: user?.name || "Guest",
      receiverId: selectedReceiverId,
      content: input.trim(),
      timestamp: Date.now(),
      type: isPrivate ? "direct" : "group",
      roomId,
    };

    addMessage(newMessage);
    socket?.emit("chat:message", newMessage);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Scrollable Message Area */}
      <ScrollArea className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {filteredMessages.map((msg) => {
            const isOwn = msg.senderId === myUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isOwn ? "items-end" : "items-start"
                }`}
              >
                {!isOwn && (
                  <span className="text-sm text-gray-500 mb-1">
                    {msg.senderName}
                  </span>
                )}
                <div
                  className={`max-w-[75%] break-words whitespace-pre-wrap px-4 py-2 rounded-lg ${
                    isOwn ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.content}
                </div>

                <span className="text-xs text-gray-400 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex flex-col items-center gap-2 p-4 border-t">
        <Select
          onValueChange={(val) =>
            setSelectedReceiverId(val === "__group__" ? null : val)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Send to everyone (Group chat)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__group__">Everyone (Group chat)</SelectItem>

            {otherParticipants.map((participant) => (
              <SelectItem key={participant.id} value={participant.id}>
                {participant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className=" w-full flex gap-2">
          <Input
            placeholder="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;
