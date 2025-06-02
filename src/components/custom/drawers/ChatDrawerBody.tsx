// components/custom/drawers/ChatDrawerBody.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallStore } from "@/store/callStore";
import { useChatStore } from "@/store/chatStore";
import { useSessionStore } from "@/store/sessionStore";
import { ChatMessage } from "@/types";
import { useMemo, useState } from "react";

const ChatDrawerBody = () => {
  const [input, setInput] = useState("");

  const roomId = useSessionStore((state) => state.roomId);

  const socket = useCallStore((state) => state.socket);
  const myId = socket?.id;
  const addMessage = useChatStore((state) => state.addMessage);

  const messages = useChatStore((state) => state.messages);

  const filteredMessages = useMemo(() => {
    return messages.filter(
      (msg) => msg.receiverId === null && msg.roomId === roomId,
    );
  }, [messages, roomId]);

  const handleSend = () => {
    console.log("Input: ", input);
    console.log("MyId: ", myId);
    console.log("roomId: ", roomId);

    if (!input.trim() || !myId || !roomId) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: myId,
      senderName: "Me",
      receiverId: null,
      content: input.trim(),
      timestamp: Date.now(),
      type: "group",
      roomId: roomId,
    };

    console.log("Sending message: ", newMessage);

    addMessage(newMessage);
    socket.emit("chat:message", newMessage);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[75%] px-4 py-2 rounded-lg ${
              msg.senderId === myId
                ? "bg-blue-600 text-white self-end"
                : "bg-gray-200 text-black self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-4 border-t">
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
  );
};

export default ChatDrawerBody;
