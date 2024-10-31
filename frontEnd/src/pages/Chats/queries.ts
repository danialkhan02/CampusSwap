import { TApiResponse } from 'utils/apiResponse.type';
import http from 'utils/http';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { IUser } from 'pages/Authentication/queries';
import { getActiveChats, getChatHistory } from 'api/chat';

export interface IChatMessage {
  id?: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp?: string;
  read?: boolean;
}

export interface IActiveChat {
  user_id: string;
  user_name: string;
  last_message?: string;
  user?: IUser;
}

export const activeChatQueryKey = (userId: string) => ['chat', 'active', userId];
export const chatHistoryQueryKey = (userId: string, otherId: string) => ['chat', 'history', userId, otherId];

export function useGetActiveChats(
  userId: string,
  options?: UseQueryOptions<TApiResponse<IActiveChat[]>, Error>,
) {
  return useQuery<TApiResponse<IActiveChat[]>, Error>(
    {
      queryKey: activeChatQueryKey(userId),
      queryFn: () => getActiveChats(userId),
      ...options,
    },
  );
}

export function useGetChatHistory(
  userId: string,
  otherId: string,
  options?: UseQueryOptions<TApiResponse<IChatMessage[]>, Error>,
) {
  return useQuery<TApiResponse<IChatMessage[]>, Error>(
    {
      queryKey: chatHistoryQueryKey(userId, otherId),
      queryFn: () => getChatHistory(userId, otherId),
      ...options,
    },
  );
}