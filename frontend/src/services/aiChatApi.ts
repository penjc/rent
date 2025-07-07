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
 * 流式事件类型
 */
export interface StreamEvent {
  type: 'user_message' | 'ai_start' | 'ai_token' | 'ai_complete' | 'ai_error' | 'error';
  data: any;
}

/**
 * 流式回调函数类型
 */
export interface StreamCallbacks {
  onUserMessage?: (content: string) => void;
  onAiStart?: () => void;
  onAiToken?: (token: string, fullContent: string) => void;
  onAiComplete?: (messageId: number) => void;
  onError?: (error: string) => void;
}

/**
 * 发送消息并获取AI流式回复
 */
export const sendMessageStream = async (
  request: SendMessageRequest,
  callbacks: StreamCallbacks
): Promise<{ abort: () => void }> => {
  const controller = new AbortController();
  
  try {
    const response = await fetch('/api/ai-chat/send/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('user_token') || ''}`
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    // 用于缓存不完整的行
    let buffer = '';

    // 读取流数据
    const readChunk = async (): Promise<void> => {
      try {
        const { done, value } = await reader.read();
        
        if (done) {
          return;
        }

        // 将新数据添加到缓存中
        buffer += decoder.decode(value, { stream: true });
        
        // 按行分割，保留最后一个可能不完整的行
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保存最后一个可能不完整的行

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') {
            // 空行表示一个SSE事件结束，处理当前事件
            continue;
          } else if (trimmedLine.startsWith('event:')) {
            // 事件类型行，暂时忽略
            continue;
          } else if (trimmedLine.startsWith('data:')) {
            const data = trimmedLine.slice(5).trim();
            
            if (data === '') {
              continue;
            }

            try {
              const eventData = JSON.parse(data);
              
              // 根据事件数据内容判断事件类型并调用对应回调
              if (eventData.content && eventData.role === 'user') {
                callbacks.onUserMessage?.(eventData.content);
              } else if (eventData.status === 'start') {
                callbacks.onAiStart?.();
              } else if (eventData.content !== undefined && eventData.full_content !== undefined) {
                callbacks.onAiToken?.(eventData.content, eventData.full_content);
              } else if (eventData.status === 'complete') {
                callbacks.onAiComplete?.(eventData.message_id);
              } else if (eventData.error) {
                callbacks.onError?.(eventData.error);
              }
            } catch (e) {
              console.error('解析SSE数据失败:', e, 'data:', data);
            }
          }
        }

        // 继续读取下一个chunk
        return readChunk();
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('读取流数据失败:', error);
          callbacks.onError?.(error.message || '读取数据失败');
        }
      }
    };

    // 开始读取流
    readChunk();

  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('流式请求失败:', error);
      callbacks.onError?.(error.message || '请求失败');
    }
  }

  return {
    abort: () => controller.abort()
  };
};

/**
 * 重新加载AI模型
 */
export const reloadModel = async (): Promise<ApiResponse<string>> => {
  const response = await api.post('/ai-chat/reload-model');
  return response.data;
};