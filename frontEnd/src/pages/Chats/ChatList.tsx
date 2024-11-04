import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Avatar,
  InputBase,
  Paper,
  Divider,
} from '@mui/material';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { activeChatQueryKey, IActiveChat, useGetActiveChats } from 'pages/Chats/queries';
import SearchIcon from '@mui/icons-material/Search';


interface ChatListProps {
  onSelectChat: (chat: IActiveChat) => void;
  selectedChatId?: string;
  className?: string;
}

const formatTimeDifference = (timestamp: string) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days`;
};

export default function ChatList({ onSelectChat, selectedChatId, className }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const userId = retrieve(CacheKeys.userId, { parseJson: false });

  const {
    data: activeChats,
  } = useGetActiveChats(userId, {
    queryKey: activeChatQueryKey(userId),
  });

  const filteredChats = activeChats?.data.filter((chat: IActiveChat) => {
    const name = userId === chat.receiver?.id
      ? `${chat.sender.first_name} ${chat.sender.last_name}`
      : `${chat.receiver.first_name} ${chat.receiver.last_name}`;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Box
      className={className}
      sx={{
        bgcolor: 'white',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search Header */}
      <Box sx={{ p: 2 }}>
        <Paper
          sx={{
            p: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f5f5f5',
            borderRadius: 3,
          }}
        >
          <SearchIcon
            sx={{
              fontSize: 24,
              color: 'text.secondary',
              mr: 1,
            }}
          />
          <InputBase
            sx={{
              ml: 1,
              flex: 1,
              '& .MuiInputBase-input': {
                padding: '4px 0',
              },
            }}
            placeholder='Search...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Paper>
      </Box>

      <Divider />

      {/* Chat List */}
      <List sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        {filteredChats?.map((chat: IActiveChat) => {
          const isReceiver = userId === chat.receiver?.id;
          const otherUser = isReceiver ? chat.sender : chat.receiver;
          const lastMessage = chat.message;
          const displayName = `${otherUser.first_name} ${otherUser.last_name}`;
          const chatId = isReceiver ? chat.sender.id : chat.receiver.id;

          return (
            <ListItem
              key={otherUser.id}
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={selectedChatId === chatId}
                onClick={() => onSelectChat(chat)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: '#f0f2f5',
                  },
                }}
              >
                <Avatar
                  src={otherUser.profile_image_url}
                  alt={displayName}
                  sx={{ mr: 2, width: 48, height: 48 }}
                >
                  {displayName[0]}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                  >
                    <Typography
                      variant='subtitle1'
                      sx={{
                        fontWeight: 500,
                        color: 'text.primary',
                        lineHeight: 1.2,
                      }}
                      noWrap
                    >
                      {displayName}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ ml: 1, flexShrink: 0 }}
                    >
                      {formatTimeDifference(chat.timestamp || '')}
                    </Typography>
                  </Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isReceiver ? lastMessage : `You: ${lastMessage}`}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
