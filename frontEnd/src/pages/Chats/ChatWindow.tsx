import React, { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, Button, Paper, Typography,
} from '@mui/material';
import { useChat } from 'contexts/ChatContext';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { useQueryClient } from '@tanstack/react-query';
import { chatHistoryQueryKey } from 'pages/Chats/queries';


interface ChatWindowProps {
    receiverId: string;
    receiverName: string;
}

export default function ChatWindow({ receiverId, receiverName }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const {
    sendMessage,
    messages,
    isLoading,
    connectionStatus,
    setSelectedUserId,
  } = useChat();
  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set selected user for the chat context
  useEffect(() => {
    setSelectedUserId(receiverId);
    return () => setSelectedUserId(null);
  }, [receiverId, setSelectedUserId]);

  // Initial fetch of chat history
  useEffect(() => {
    if (userId && receiverId) {
      queryClient.invalidateQueries({ queryKey: chatHistoryQueryKey(userId, receiverId) });
    }
  }, [userId, receiverId, queryClient]);

  // Get messages from context instead of direct query
  const chatMessages = messages[receiverId] || [];

  const handleSend = () => {
    if (message.trim() && connectionStatus === 'connected') {
      sendMessage(receiverId, message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant='h6' sx={{ mb: 2 }}>
        Chat with
        {' '}
        {receiverName}
        {connectionStatus !== 'connected' && (
        <Typography
          component='span'
          color='error'
          sx={{ ml: 1, fontSize: '0.8em' }}
        >
          (
          {connectionStatus}
          )
        </Typography>
        )}
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          scrollBehavior: 'smooth',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Typography color='text.secondary'>Loading messages...</Typography>
          </Box>
        ) : (
          <>
            {chatMessages.map((msg) => (
              <Box
                key={msg.id || msg.timestamp}
                sx={{
                  mb: 1,
                  p: 1,
                  backgroundColor: msg.sender_id === userId ? '#e3f2fd' : '#f0f0f0',
                  borderRadius: 1,
                  maxWidth: '70%',
                  alignSelf: msg.sender_id === userId ? 'flex-end' : 'flex-start',
                  wordBreak: 'break-word',
                }}
              >
                <Typography>{msg.message}</Typography>
                {msg.timestamp && (
                <Typography
                  variant='caption'
                  sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Typography>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={connectionStatus === 'connected'
            ? 'Type a message...'
            : 'Waiting for connection...'}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          disabled={isLoading || connectionStatus !== 'connected'}
          sx={{
            '& .MuiInputBase-input': {
              color: connectionStatus !== 'connected' ? 'text.disabled' : 'inherit',
            },
          }}
        />
        <Button
          variant='contained'
          onClick={handleSend}
          disabled={!message.trim() || isLoading || connectionStatus !== 'connected'}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
}
