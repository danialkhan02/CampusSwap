import React, { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, Paper, Typography, InputAdornment,
} from '@mui/material';
import { useChat } from 'contexts/ChatContext';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { useQueryClient } from '@tanstack/react-query';
import { chatHistoryQueryKey } from 'pages/Chats/queries';
import IconButton from '@mui/material/IconButton';
import { ArrowBack, Send } from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';
import userImage from 'assets/avatar-25.webp';


interface ChatWindowProps {
    receiverId: string;
    receiverName: string;
    receiverImage?: string;
    onBack?: () => void;
}

export default function ChatWindow({
  receiverId, receiverName, receiverImage, onBack,
}: ChatWindowProps) {
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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8f9fa',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid #e0e0e0',
          bgcolor: 'white',
          flexShrink: 0,
        }}
      >
        {onBack && (
          <IconButton onClick={onBack} size='small'>
            <ArrowBack />
          </IconButton>
        )}
        <Avatar src={receiverImage || userImage} alt={receiverName} sx={{ width: 40, height: 40 }}>
          {receiverName[0]}
        </Avatar>
        <Box>
          <Typography variant='subtitle1' fontWeight='medium'>
            {receiverName}
          </Typography>
          {connectionStatus !== 'connected' && (
          <Typography variant='caption' color='error'>
            {connectionStatus}
          </Typography>
          )}
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          scrollBehavior: 'smooth',
          minHeight: 0,
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
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender_id === userId ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    p: 1.5,
                    bgcolor: msg.sender_id === userId ? '#dcf8c6' : 'white',
                    borderRadius: 2,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography>{msg.message}</Typography>
                  {msg.timestamp && (
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: '0.7rem',
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                  )}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: 1,
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
        }}
      >
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={connectionStatus === 'connected'
            ? 'Type a message...' : 'Waiting for connection...'}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          disabled={isLoading || connectionStatus !== 'connected'}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f0f2f5',
            },
          }}
        />
        <IconButton
          color='primary'
          onClick={handleSend}
          disabled={!message.trim() || isLoading || connectionStatus !== 'connected'}
          sx={{ alignSelf: 'flex-end' }}
        >
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
}
