import React, { useState } from 'react';
import {
  Grid, Typography, Box, Container,
} from '@mui/material';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { IActiveChat } from 'pages/Chats/queries';
import ChatList from 'pages/Chats/components/ChatList';
import ChatWindow from 'pages/Chats/components/ChatWindow';


type InitialChat = {
    receiverId: string;
    receiverName: string;
    receiverImage?: string;
};

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<InitialChat | null>(null);
  const userId = retrieve(CacheKeys.userId, { parseJson: false });

  const handleSelectChat = (chat: IActiveChat) => {
    const isReceiver = userId === chat.receiver?.id;
    setSelectedChat({
      receiverId: isReceiver ? chat.sender.id || '' : chat.receiver.id || '',
      receiverName: isReceiver
        ? `${chat.sender.first_name} ${chat.sender.last_name}`
        : `${chat.receiver.first_name} ${chat.receiver.last_name}`,
      receiverImage: isReceiver
        ? chat.sender.profile_image_url
        : chat.receiver.profile_image_url,
    });
  };

  return (
    <Container maxWidth='xl' sx={{ mt: 4, height: 'calc(100vh - 100px)' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Chat List - Left Side */}
        <Grid item xs={4} sx={{ height: '100%' }}>
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              <Typography variant='h6'>Messages</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <ChatList
                onSelectChat={handleSelectChat}
                selectedChatId={selectedChat?.receiverId}
              />
            </Box>
          </Box>
        </Grid>

        {/* Chat Window - Right Side */}
        <Grid item xs={8} sx={{ height: '100%' }}>
          {selectedChat ? (
            <ChatWindow
              receiverId={selectedChat.receiverId}
              receiverName={selectedChat.receiverName}
              receiverImage={selectedChat.receiverImage}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography color='text.secondary'>
                Select a conversation to start chatting
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
