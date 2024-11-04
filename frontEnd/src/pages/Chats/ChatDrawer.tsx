import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { IActiveChat } from 'pages/Chats/queries';
import ChatWindow from 'pages/Chats/ChatWindow';
import ChatList from 'pages/Chats/ChatList';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';


interface ChatDrawerProps {
    open: boolean;
    onClose: () => void;
    initialChat?: {
        receiverId: string;
        receiverName: string;
        receiverImage?: string;
    };
}

export default function ChatDrawer({ open, onClose, initialChat }: ChatDrawerProps) {
  const [selectedChat, setSelectedChat] = useState(initialChat || null);
  const [showChatList, setShowChatList] = useState(!initialChat);
  const userId = retrieve(CacheKeys.userId, { parseJson: false });

  useEffect(() => {
    if (initialChat) {
      setSelectedChat(initialChat);
      setShowChatList(false);
    }
  }, [initialChat]);

  const handleBack = () => {
    setSelectedChat(null);
    setShowChatList(true);
  };

  const handleClose = () => {
    onClose();
    setSelectedChat(null);
    setShowChatList(!initialChat);
  };

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
    setShowChatList(false);
  };

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '600px' },
          height: '100%',
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <IconButton
            onClick={handleClose}
            size='small'
            sx={{ mr: 2 }}
          >
            <Close />
          </IconButton>
          <Typography variant='h6'>
            Messages
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {showChatList ? (
            <ChatList
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChat?.receiverId}
            />
          ) : selectedChat && (
            <ChatWindow
              receiverId={selectedChat.receiverId}
              receiverName={selectedChat.receiverName}
              receiverImage={selectedChat.receiverImage}
              onBack={handleBack}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
