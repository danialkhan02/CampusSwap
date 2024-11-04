import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
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
import { TApiResponse } from 'utils/apiResponse.type';


interface ChatContextType {
  messages: Record<string, IChatMessage[]>;
  activeChats: IActiveChat[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (receiverId: string, message: string) => void;
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, IChatMessage[]>>({});
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const queryClient = useQueryClient();

  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const reconnectAttemptsRef = useRef(0);

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

  useEffect(() => {
    if (chatHistoryResponse?.data && selectedUserId) {
      setMessages((prev) => ({
        ...prev,
        [selectedUserId]: [...chatHistoryResponse.data].sort((a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime()),
      }));
    }
  }, [chatHistoryResponse, selectedUserId]);

  const connectWebSocket = () => {
    if (!userId) return;

    if (
      wsRef.current
        && (wsRef.current.readyState === WebSocket.OPEN
            || wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/ws/${userId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: IChatMessage = JSON.parse(event.data);

          // Determine chat ID based on message direction
          const chatId = message.sender_id === userId
            ? message.receiver_id : message.sender_id;

          // Update messages state
          setMessages((prev) => {
            const existingMessages = [...(prev[chatId] || [])];
            const isDuplicate = existingMessages.some(
              (msg) => msg.id === message.id
                    || (msg.timestamp === message.timestamp
                        && msg.message === message.message
                        && msg.sender_id === message.sender_id),
            );

            if (!isDuplicate) {
              const updatedMessages = [...existingMessages, message].sort((a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime());

              return {
                ...prev,
                [chatId]: updatedMessages,
              };
            }
            return prev;
          });

          queryClient.setQueryData(
            chatHistoryQueryKey(userId, chatId),
            (oldData: TApiResponse<IChatMessage[]>) => {
              const existingMessages = oldData?.data || [];
              const updatedMessages = [...existingMessages, message].sort((a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime());

              return {
                ...oldData,
                data: updatedMessages,
              };
            },
          );
          queryClient.invalidateQueries({ queryKey: activeChatQueryKey(userId) });
        }
        catch (err) {
          Logger.error('Error handling WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        setConnectionStatus('disconnected');
        wsRef.current = null;

        if (event.code !== 1000 && event.code !== 1001) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
          }
        }
      };

      ws.onerror = (error) => {
        Logger.error('WebSocket Error: ', error);
      };
    }
    catch (error) {
      Logger.error('Error creating WebSocket: ', error);
      setConnectionStatus('disconnected');
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (userId) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Send message function
  const sendMessage = (receiverId: string, message: string) => {
    if (!userId) {
      return;
    }

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      Logger.error('WebSocket is not connected, current state:', ws?.readyState);
      return;
    }

    const chatMessage: IChatMessage = {
      sender_id: userId,
      receiver_id: receiverId,
      message,
      timestamp: new Date().toISOString(),
    };

    try {
      ws.send(JSON.stringify(chatMessage));

      // Update messages with proper sorting
      setMessages((prev) => {
        const existingMessages = [...(prev[receiverId] || [])];
        const updatedMessages = [...existingMessages, chatMessage].sort((a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime());

        return {
          ...prev,
          [receiverId]: updatedMessages,
        };
      });

      // Update React Query cache with proper sorting
      queryClient.setQueryData(
        chatHistoryQueryKey(userId, receiverId),
        (oldData: TApiResponse<IChatMessage[]>) => {
          const existingMessages = oldData?.data || [];
          const updatedMessages = [...existingMessages, chatMessage].sort((a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime());

          return {
            ...oldData,
            data: updatedMessages,
          };
        },
      );
    }
    catch (err) {
      Logger.error('Error sending message:', err);
    }
  };

  const contextValue = useMemo(() => ({
    messages,
    activeChats: activeChatsResponse?.data || [],
    isLoading: isLoadingChats || isLoadingHistory,
    error: activeChatsError || chatHistoryError || null,
    sendMessage,
    selectedUserId,
    setSelectedUserId,
    connectionStatus,
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
