import { TApiResponse } from 'utils/apiResponse.type';
import http from 'utils/http';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { IUser } from 'pages/Authentication/queries';
import { chat } from 'utils/apiUrls';


export interface IChatMessage {
  id?: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp?: string;
  read?: boolean;
}

export interface IActiveChat {
  id: string;
  message: string;
  read: boolean;
  receiver: IUser;
  sender: IUser;
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
      queryFn: () => http.get(chat.active(userId)),
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
      queryFn: () => http.get(chat.history(userId, otherId)),
      ...options,
    },
  );
}
