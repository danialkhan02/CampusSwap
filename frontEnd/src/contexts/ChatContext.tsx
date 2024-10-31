import React, {
  createContext, useContext, useEffect, useMemo, useCallback, useState,
} from 'react';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { getChatHistory } from 'api/chat';

interface ChatContextType {
  sendMessage: (receiverId: string, message: string) => void;
  messages: Record<string, Message[]>;
  setSelectedUserId: (userId: string | null) => void;
  selectedUserId: string | null;
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedUserId || !userId) return;
      
      try {
        const history = await getChatHistory(userId, selectedUserId);
        setMessages(prev => ({
          ...prev,
          [selectedUserId]: history
        }));
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    if (selectedUserId) {
      fetchChatHistory();
    }
  }, [selectedUserId, userId]);

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

  const contextValue = useMemo(() => ({ 
    sendMessage, 
    messages, 
    selectedUserId, 
    setSelectedUserId 
  }), [sendMessage, messages, selectedUserId]);

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