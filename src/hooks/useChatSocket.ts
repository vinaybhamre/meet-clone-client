// hooks/useChatSocket.ts
import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/types";
import { useEffect } from "react";
import { useSocket } from "./useSocket";

export const useChatSocket = () => {
  const { socket } = useSocket();
  const addMessage = useChatStore((state) => state.addMessage);
  const setMessages = useChatStore((state) => state.setMessages);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message: ChatMessage) => {

      console.log("Received message on other client: ", message);
      

      addMessage(message);
    };

    const handleChatHistory = (messages: ChatMessage[]) => {
      setMessages(messages); // assuming setMessages replaces the current messages list
    };

    socket.on("chat-message-response", handleIncomingMessage);
    socket.on("chat-history", handleChatHistory);

    return () => {
      socket.off("chat-message-response", handleIncomingMessage);
      socket.off("chat-history", handleChatHistory);
    };
  }, [socket, addMessage, setMessages]);

  const sendMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    if (!socket) return;

    const fullMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    addMessage(fullMessage); // Optimistic UI
    socket.emit("chat-message", fullMessage);
  };

  return { sendMessage };
};
