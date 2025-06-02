export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string | null;
  content: string;
  timestamp: number;
  type?: "group" | "direct";
  roomId: string;
}
