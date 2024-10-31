import { apiClient } from './client';

export const getActiveChats = async (userId: string) => {
  const response = await apiClient.get(`/chat/active/${userId}`);
  return response.data.data;
};

export const getChatHistory = async (userId: string, otherId: string) => {
  const response = await apiClient.get(`/chat/history/${userId}/${otherId}`);
  return response.data.data;
};