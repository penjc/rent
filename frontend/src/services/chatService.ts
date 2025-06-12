import api from './api';
import type {
  ApiResponse,
  ChatMessage,
  ChatSession,
  SendMessageRequest,
  ChatHistoryRequest,
  MarkReadRequest,
} from '@/types';

/**
 * 聊天相关API服务
 */
export const chatService = {
  /**
   * 发送文本消息
   */
  sendMessage: async (data: SendMessageRequest): Promise<ApiResponse<ChatMessage>> => {
    const response = await api.post('/chat/message', data);
    return response.data;
  },

  /**
   * 发送图片消息
   */
  sendImage: async (
    file: File,
    senderId: number,
    senderType: 'user' | 'merchant',
    receiverId: number,
    receiverType: 'user' | 'merchant'
  ): Promise<ApiResponse<ChatMessage>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', senderId.toString());
    formData.append('senderType', senderType);
    formData.append('receiverId', receiverId.toString());
    formData.append('receiverType', receiverType);

    const response = await api.post('/chat/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 发送文件消息
   */
  sendFile: async (
    file: File,
    senderId: number,
    senderType: 'user' | 'merchant',
    receiverId: number,
    receiverType: 'user' | 'merchant'
  ): Promise<ApiResponse<ChatMessage>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', senderId.toString());
    formData.append('senderType', senderType);
    formData.append('receiverId', receiverId.toString());
    formData.append('receiverType', receiverType);

    const response = await api.post('/chat/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 获取聊天记录
   */
  getChatHistory: async (params: ChatHistoryRequest): Promise<ApiResponse<ChatMessage[]>> => {
    const response = await api.get('/chat/history', { params });
    return response.data;
  },

  /**
   * 标记消息为已读
   */
  markAsRead: async (data: MarkReadRequest): Promise<ApiResponse<string>> => {
    const response = await api.post('/chat/read', data);
    return response.data;
  },

  /**
   * 获取用户的聊天会话列表
   */
  getUserSessions: async (userId: number): Promise<ApiResponse<ChatSession[]>> => {
    const response = await api.get(`/chat/sessions/user/${userId}`);
    return response.data;
  },

  /**
   * 获取商家的聊天会话列表
   */
  getMerchantSessions: async (merchantId: number): Promise<ApiResponse<ChatSession[]>> => {
    const response = await api.get(`/chat/sessions/merchant/${merchantId}`);
    return response.data;
  },

  /**
   * 获取未读消息数量
   */
  getUnreadCount: async (receiverType: 'user' | 'merchant', receiverId: number): Promise<ApiResponse<number>> => {
    const response = await api.get(`/chat/unread/${receiverType}/${receiverId}`);
    return response.data;
  },
}; 