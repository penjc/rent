import api from './api';
import type { ApiResponse } from '@/types';

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
}

export interface SendMessageData {
  senderId: number;
  receiverId: number;
  content: string;
}

// 发送消息
export const sendMessage = async (data: SendMessageData): Promise<ChatMessage> => {
  const response = await api.post<ApiResponse<ChatMessage>>('/messages', data);
  return response.data.data!;
};

// 获取聊天记录
export const getMessages = async (
  userA: number,
  userB: number
): Promise<ChatMessage[]> => {
  const response = await api.get<ApiResponse<ChatMessage[]>>(
    `/messages?userA=${userA}&userB=${userB}`
  );
  return response.data.data || [];
};

// 获取用户的所有消息
export const getUserMessages = async (userId: number): Promise<ChatMessage[]> => {
  const response = await api.get<ApiResponse<ChatMessage[]>>(
    `/messages/user/${userId}`
  );
  return response.data.data || [];
};
