import React, {
  createContext, useContext, useEffect, useMemo, useCallback, useState,
} from 'react';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';


interface ChatContextType {
  sendMessage: (receiverId: string, message: string) => void;
  messages: Record<string, Message[]>;
}

interface Message {
  id?: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp?: string;
  read?: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const userId = retrieve(CacheKeys.userId, { parseJson: false });

  useEffect(() => {
    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/ws/${userId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => ({
        ...prev,
        [message.sender_id]: [...(prev[message.sender_id] || []), message],
      }));
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [userId]);

  const sendMessage = useCallback((receiverId: string, message: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      const messageData = {
        sender_id: userId,
        receiver_id: receiverId,
        message,
      };
      socket.send(JSON.stringify(messageData));

      setMessages((prev) => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), messageData],
      }));
    }
  }, [socket, userId]);

  // Memoize the context value with the memoized sendMessage function
  const contextValue = useMemo(() => ({ sendMessage, messages }), [sendMessage, messages]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
