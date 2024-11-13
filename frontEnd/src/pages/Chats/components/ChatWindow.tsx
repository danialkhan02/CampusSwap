import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Paper, TextField, Typography,
} from '@mui/material';
import { useChat } from 'contexts/ChatContext';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { useQueryClient } from '@tanstack/react-query';
import { chatHistoryQueryKey, EMessageType, IChatMessage } from 'pages/Chats/queries';
import IconButton from '@mui/material/IconButton';
import { ArrowBack, Refresh, Send } from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';
import userImage from 'assets/avatar-25.webp';
import { IProduct } from 'pages/HomePage/queries';
import ChatInquiryRender from 'pages/Chats/components/ChatInquiryRender';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';


interface ChatWindowProps {
  receiverId: string;
  receiverName: string;
  receiverImage?: string;
  onBack?: () => void;
  productInquiry?: IProduct;
  onClose?: () => void;
}

export default function ChatWindow({
  receiverId,
  receiverName,
  receiverImage,
  onBack,
  productInquiry,
  onClose,
}: ChatWindowProps) {
  const [message, setMessage] = useState<IChatMessage | null>(null);
  const {
    sendMessage,
    messages,
    isLoading,
    connectionStatus,
    setSelectedUserId,
    reconnect,
  } = useChat();
  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set selected user for chat context
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

  const chatMessages = messages[receiverId] || [];

  // Set initial product inquiry message
  useEffect(() => {
    if (productInquiry && !chatMessages.some((
      msg,
    ) => msg.product_inquiry_id === productInquiry.id)) {
      setMessage({
        sender_id: userId,
        receiver_id: receiverId,
        message: 'Hi I am interested in your listing!',
        type: EMessageType.PRODUCT_INQUIRY,
        timestamp: new Date().toISOString(),
        product_inquiry_id: productInquiry.id,
        product_inquiry: {
          name: productInquiry.name,
          lister_information: {
            first_name: productInquiry.seller?.first_name || '',
            last_name: productInquiry.seller?.last_name || '',
            profile_image_url: productInquiry.seller?.profile_image_url || '',
          },
          price: productInquiry.price,
          image: productInquiry.images[0],
        },
      });
    }
  }, [userId, receiverId, productInquiry, chatMessages]);

  const handleRemoveFirstMessage = () => {
    setMessage({
      sender_id: userId,
      receiver_id: receiverId,
      message: 'Hi I am interested in your listing!',
      type: EMessageType.TEXT,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSend = (messageToSend: IChatMessage | null) => {
    if (messageToSend?.message.trim() && connectionStatus === 'connected') {
      sendMessage(messageToSend);
      setMessage(null);
    }
  };

  const handleNavigate = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose?.();
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage({
      sender_id: userId,
      receiver_id: receiverId,
      message: e.target.value,
      type: EMessageType.TEXT,
      timestamp: new Date().toISOString(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && message) {
      e.preventDefault();
      handleSend(message);
    }
  };

  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Typography variant='caption' color='warning.main'>Connecting...</Typography>;
      case 'disconnected':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='error'>Disconnected</Typography>
            <IconButton size='small' onClick={reconnect}>
              <Refresh />
            </IconButton>
          </Box>
        );
      default:
        return null;
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
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='subtitle1' fontWeight='medium'>{receiverName}</Typography>
          {renderConnectionStatus()}
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
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Typography color='text.secondary'>Loading messages...</Typography>
          </Box>
        ) : (
          chatMessages.map((msg) => (
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
                {msg.type === EMessageType.PRODUCT_INQUIRY && msg.product_inquiry && (
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: 'white',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      mb: 1,
                    }}
                  >
                    <Box
                      onClick={() => handleNavigate(msg.product_inquiry_id || '')}
                      component='img'
                      src={msg.product_inquiry.image}
                      alt={msg.product_inquiry.name}
                      sx={{
                        width: '100%',
                        height: 160,
                        objectFit: 'cover',
                        cursor: 'pointer',
                      }}
                    />
                    <Stack spacing={1} sx={{ p: 2 }}>
                      <Typography variant='h6' sx={{ fontWeight: 600, color: 'primary.main' }}>
                        $
                        {msg.product_inquiry.price.toFixed(2)}
                      </Typography>
                      <Typography variant='subtitle2' sx={{ fontWeight: 500 }}>
                        {msg.product_inquiry.name}
                      </Typography>
                    </Stack>
                  </Paper>
                )}
                <Typography>{msg.message}</Typography>
                {msg.timestamp && (
                  <Typography variant='caption' sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                )}
              </Box>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
        {message?.type === EMessageType.PRODUCT_INQUIRY && productInquiry && (
          <ChatInquiryRender
            product={productInquiry}
            handleRemove={handleRemoveFirstMessage}
          />
        )}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            fullWidth
            value={message?.message || ''}
            onChange={handleMessageChange}
            placeholder={connectionStatus === 'connected' ? 'Type a message...' : 'Connecting...'}
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
            onClick={() => handleSend(message)}
            disabled={!message?.message.trim() || connectionStatus !== 'connected'}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
