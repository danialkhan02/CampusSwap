import React, { useState } from 'react';
import {
  Box,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Grid,
} from '@mui/material';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { activeChatQueryKey, useGetActiveChats } from 'pages/Chats/queries';
import ChatWindow from 'pages/Chats/ChatWindow';


interface ActiveChat {
  user_id: string;
  user_name: string;
  last_message?: string;
}

export default function ChatsPage() {
  const [selectedChat, setSelectedChat] = useState<ActiveChat | null>(null);
  const userId = retrieve(CacheKeys.userId, { parseJson: false });

  const {
    data: activeChats,
  } = useGetActiveChats(userId, {
    queryKey: activeChatQueryKey(userId),
  });

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      <Typography variant='h4' sx={{ mb: 3 }}>Messages</Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <List>
            {activeChats?.data.map((chat: ActiveChat) => (
              <ListItem key={chat.user_id} disablePadding>
                <ListItemButton
                  selected={selectedChat?.user_id === chat.user_id}
                  onClick={() => setSelectedChat(chat)}
                >
                  <ListItemText
                    primary={chat.user_name}
                    secondary={chat.last_message}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={8}>
          {selectedChat ? (
            <ChatWindow
              receiverId={selectedChat.user_id}
              receiverName={selectedChat.user_name}
            />
          ) : (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '500px',
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
