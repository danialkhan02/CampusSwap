import React, {
  createContext, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  activeChatQueryKey,
  chatHistoryQueryKey,
  IActiveChat,
  IChatMessage,
  useGetActiveChats,
  useGetChatHistory,
} from 'pages/Chats/queries';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { Logger } from 'utils/logger';


interface ChatContextType {
  messages: Record<string, IChatMessage[]>;
  activeChats: IActiveChat[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (msgToSend: IChatMessage) => void;
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  reconnect: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, IChatMessage[]>>({});
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const queryClient = useQueryClient();

  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const wsRef = useRef<WebSocket | null>(null);
  const isUnmountingRef = useRef(false);

  const {
    data: activeChatsResponse,
    isLoading: isLoadingChats,
    error: activeChatsError,
  } = useGetActiveChats(userId || '', {
    queryKey: activeChatQueryKey(userId || ''),
    enabled: !!userId,
  });

  const {
    data: chatHistoryResponse,
    isLoading: isLoadingHistory,
    error: chatHistoryError,
  } = useGetChatHistory(userId || '', selectedUserId || '', {
    queryKey: chatHistoryQueryKey(userId || '', selectedUserId || ''),
    enabled: !!userId && !!selectedUserId,
  });

  // Update messages when chat history changes
  useEffect(() => {
    if (chatHistoryResponse?.data && selectedUserId) {
      setMessages((prev) => ({
        ...prev,
        [selectedUserId]: [...chatHistoryResponse.data].sort(
          (a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime(),
        ),
      }));
    }
  }, [chatHistoryResponse, selectedUserId]);

  const connectWebSocket = () => {
    if (!userId || isUnmountingRef.current) return;

    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      setConnectionStatus('connecting');
      const wsUrl = `${process.env.REACT_APP_WS_URL}/ws/${userId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isUnmountingRef.current) {
          setConnectionStatus('connected');
        }
      };

      ws.onmessage = (event) => {
        if (isUnmountingRef.current) return;

        try {
          const message = JSON.parse(event.data) as IChatMessage;
          const chatId = message.sender_id === userId ? message.receiver_id : message.sender_id;

          setMessages((prev) => {
            const existingMessages = [...(prev[chatId] || [])];
            if (existingMessages.some((msg) => msg.id === message.id)) return prev;

            return {
              ...prev,
              [chatId]: [...existingMessages, message].sort(
                (a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime(),
              ),
            };
          });

          queryClient.invalidateQueries({ queryKey: activeChatQueryKey(userId) });
        }
        catch (err) {
          Logger.error('Error handling message:', err);
        }
      };

      ws.onclose = () => {
        if (!isUnmountingRef.current) {
          setConnectionStatus('disconnected');
          wsRef.current = null;
          // Simple reconnect after 2 seconds
          setTimeout(connectWebSocket, 2000);
        }
      };

      ws.onerror = () => {
        if (!isUnmountingRef.current) {
          setConnectionStatus('disconnected');
        }
      };
    }
    catch (error) {
      Logger.error('WebSocket connection error:', error);
      setConnectionStatus('disconnected');
    }
  };

  const sendMessage = (msgToSend: IChatMessage) => {
    if (!userId) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      return;
    }

    try {
      const wsMessage = { ...msgToSend };
      if (wsMessage.product_inquiry) {
        delete wsMessage.product_inquiry;
      }

      ws.send(JSON.stringify(wsMessage));

      // Optimistic update
      setMessages((prev) => {
        const existingMessages = [...(prev[msgToSend.receiver_id] || [])];
        return {
          ...prev,
          [msgToSend.receiver_id]: [...existingMessages, msgToSend].sort(
            (a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime(),
          ),
        };
      });
    }
    catch (err) {
      Logger.error('Error sending message:', err);
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    isUnmountingRef.current = false;
    if (userId) connectWebSocket();

    return () => {
      isUnmountingRef.current = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userId]);

  const contextValue = useMemo(() => ({
    messages,
    activeChats: activeChatsResponse?.data || [],
    isLoading: isLoadingChats || isLoadingHistory,
    error: activeChatsError || chatHistoryError || null,
    sendMessage,
    selectedUserId,
    setSelectedUserId,
    connectionStatus,
    reconnect: connectWebSocket,
  }), [
    messages,
    activeChatsResponse?.data,
    isLoadingChats,
    isLoadingHistory,
    activeChatsError,
    chatHistoryError,
    selectedUserId,
    connectionStatus,
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
