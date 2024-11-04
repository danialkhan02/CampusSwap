import { IChatMessage } from 'pages/Chats/queries';


const chatHistoryData: Record<string, IChatMessage[]> = {
  'receiver-1': [
    {
      id: '1',
      sender_id: 'sender-1',
      receiver_id: 'receiver-1',
      message: 'Yes',
      timestamp: '2024-10-01 07:10:56',
      read: false,
    },
    {
      id: '2',
      sender_id: 'receiver-1',
      receiver_id: 'sender-1',
      message: 'Is the yellow sneakers available?',
      timestamp: '2024-10-01 07:05:56',
      read: false,
    },
    {
      id: '3',
      sender_id: 'sender-1',
      receiver_id: 'receiver-1',
      message: 'Yes how can I help you?',
      timestamp: '2024-10-01 07:01:56',
      read: false,
    },
    {
      id: '4',
      sender_id: 'receiver-1',
      receiver_id: 'sender-1',
      message: 'Hi there!',
      timestamp: '2024-10-01 06:10:56',
      read: false,
    },
  ],
};

export default chatHistoryData;
