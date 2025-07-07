import api from './api';

export interface AiChat {
  id: number;
  userId: number | null;
  sessionId: string;
  title: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface AiMessage {
  id: number;
  chatId: number;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  tokens?: number;
  createdAt: string;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
  userId: number | null;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 创建新的AI对话会话
 */
export const createChat = async (userId: number | null): Promise<ApiResponse<AiChat>> => {
  const response = await api.post('/ai-chat/create', null, {
    params: { userId }
  });
  return response.data;
};

/**
 * 获取用户的对话历史
 */
export const getChatHistory = async (userId: number): Promise<ApiResponse<AiChat[]>> => {
  const response = await api.get(`/ai-chat/history/${userId}`);
  return response.data;
};

/**
 * 获取对话消息
 */
export const getChatMessages = async (sessionId: string): Promise<ApiResponse<AiMessage[]>> => {
  const response = await api.get(`/ai-chat/messages/${sessionId}`);
  return response.data;
};

/**
 * 发送消息并获取AI回复
 */
export const sendMessage = async (request: SendMessageRequest): Promise<ApiResponse<AiMessage>> => {
  const response = await api.post('/ai-chat/send', request);
  return response.data;
};

/**
 * 重新加载AI模型
 */
export const reloadModel = async (): Promise<ApiResponse<string>> => {
  const response = await api.post('/ai-chat/reload-model');
  return response.data;
};