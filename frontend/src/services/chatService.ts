import api from './api';
import type { ApiResponse } from '@/types';

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  senderId: number;
  receiverId: number;
  content: string;
}

// 获取用户消息列表
export const getUserMessages = async (userId: number): Promise<ChatMessage[]> => {
  const response = await api.get<ApiResponse<ChatMessage[]>>(`/messages/user/${userId}`);
  return response.data.data || [];
};

// 获取商家消息列表
export const getMerchantMessages = async (merchantId: number): Promise<ChatMessage[]> => {
  const response = await api.get<ApiResponse<ChatMessage[]>>(`/messages/user/${merchantId}`);
  return response.data.data || [];
};

// 发送消息
export const sendMessage = async (message: Omit<ChatMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatMessage> => {
  const response = await api.post<ApiResponse<ChatMessage>>('/messages', message);
  if (!response.data.data) {
    throw new Error('发送消息失败');
  }
  return response.data.data;
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
