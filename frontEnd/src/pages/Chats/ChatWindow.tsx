import React, { useState } from 'react';
import {
  Box, TextField, Button, Paper, Typography,
} from '@mui/material';
import { useChat } from 'contexts/ChatContext';


interface ChatWindowProps {
    receiverId: string;
    receiverName: string;
}

export default function ChatWindow({ receiverId, receiverName }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const { sendMessage, messages } = useChat();
  const chatMessages = messages[receiverId] || [];

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(receiverId, message);
      setMessage('');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2, height: '500px', display: 'flex', flexDirection: 'column',
      }}
    >
      <Typography variant='h6' sx={{ mb: 2 }}>
        Chat with
        {' '}
        {receiverName}
      </Typography>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        {chatMessages.map((msg, index) => (
          <Box
            sx={{
              mb: 1,
              p: 1,
              backgroundColor: msg.sender_id === receiverId ? '#f0f0f0' : '#e3f2fd',
              borderRadius: 1,
              maxWidth: '70%',
              alignSelf: msg.sender_id === receiverId ? 'flex-start' : 'flex-end',
            }}
          >
            <Typography>{msg.message}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Type a message...'
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button variant='contained' onClick={handleSend}>
          Send
        </Button>
      </Box>
    </Paper>
  );
}
