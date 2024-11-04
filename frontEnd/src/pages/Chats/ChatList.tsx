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
import { activeChatQueryKey, IActiveChat, useGetActiveChats } from 'pages/Chats/queries';
import ChatWindow from 'pages/Chats/ChatWindow';


export default function ChatList() {
  const [selectedChat, setSelectedChat] = useState<IActiveChat | null>(null);
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
            {activeChats?.data.map((chat: IActiveChat) => (
              <ListItem key={chat.receiver.id} disablePadding>
                <ListItemButton
                  selected={selectedChat?.receiver.id === chat.receiver.id}
                  onClick={() => setSelectedChat(chat)}
                >
                  <ListItemText
                    primary={chat.message}
                    secondary={chat.message}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={8}>
          {selectedChat ? (
            <ChatWindow
              receiverId={userId === selectedChat.receiver?.id ? selectedChat.sender.id || '' : selectedChat.receiver?.id || ''}
              receiverName={userId === selectedChat.receiver?.id ? `${selectedChat.sender.first_name} ${selectedChat.sender.last_name}` : `${selectedChat.receiver.first_name} ${selectedChat.receiver.last_name}`}
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
