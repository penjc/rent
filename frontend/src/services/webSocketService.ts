import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '@/types';

export class WebSocketService {
  private client: Client | null = null;
  private connected = false;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private retryCount = 0;
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  /**
   * 连接WebSocket
   */
  connect(userId: number, userType: 'user' | 'merchant'): void {
    if (this.connected) {
      return;
    }

    try {
      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/api/ws'),
        debug: (str) => {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onStompError: (frame) => {
          console.error('WebSocket错误:', frame.headers['message']);
          console.error('详情:', frame.body);
          this.handleConnectionError();
        },
        onWebSocketError: (event) => {
          console.error('WebSocket连接错误:', event);
          this.handleConnectionError();
        },
        onWebSocketClose: () => {
          console.log('WebSocket连接关闭');
          this.connected = false;
          this.notifyConnectionHandlers(false);
          this.handleConnectionError();
        }
      });

      this.client.onConnect = () => {
        console.log('WebSocket连接成功');
        this.connected = true;
        this.retryCount = 0;
        this.notifyConnectionHandlers(true);

        try {
          // 订阅个人消息队列
          this.client?.subscribe(`/queue/messages/${userType}/${userId}`, (message) => {
            try {
              const chatMessage: ChatMessage = JSON.parse(message.body);
              this.notifyMessageHandlers(chatMessage);
            } catch (error) {
              console.error('消息处理错误:', error);
            }
          });
        } catch (error) {
          console.error('订阅消息队列错误:', error);
          this.handleConnectionError();
        }
      };

      this.client.activate();
    } catch (error) {
      console.error('WebSocket初始化错误:', error);
      this.handleConnectionError();
    }
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.notifyConnectionHandlers(false);
    }
  }

  /**
   * 发送消息
   */
  sendMessage(
    senderId: number,
    senderType: 'user' | 'merchant',
    receiverId: number,
    receiverType: 'user' | 'merchant',
    content: string
  ): void {
    if (!this.connected || !this.client) {
      console.error('WebSocket未连接');
      return;
    }

    const message = {
      senderId,
      senderType,
      receiverId,
      receiverType,
      content,
    };

    this.client.publish({
      destination: '/app/sendMessage',
      body: JSON.stringify(message),
    });
  }

  /**
   * 添加消息处理器
   */
  addMessageHandler(handler: (message: ChatMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  /**
   * 移除消息处理器
   */
  removeMessageHandler(handler: (message: ChatMessage) => void): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  /**
   * 添加连接状态处理器
   */
  addConnectionHandler(handler: (connected: boolean) => void): void {
    this.connectionHandlers.push(handler);
  }

  /**
   * 移除连接状态处理器
   */
  removeConnectionHandler(handler: (connected: boolean) => void): void {
    const index = this.connectionHandlers.indexOf(handler);
    if (index > -1) {
      this.connectionHandlers.splice(index, 1);
    }
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 通知消息处理器
   */
  private notifyMessageHandlers(message: ChatMessage): void {
    this.messageHandlers.forEach((handler) => handler(message));
  }

  /**
   * 通知连接状态处理器
   */
  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }

  /**
   * 处理连接错误
   */
  private handleConnectionError(): void {
    this.connected = false;
    this.notifyConnectionHandlers(false);

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`尝试重新连接 (${this.retryCount}/${this.maxRetries})...`);
      
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }

      this.retryTimeout = setTimeout(() => {
        if (this.client) {
          try {
            this.client.deactivate();
          } catch (error) {
            console.error('断开连接错误:', error);
          }
        }
        this.client = null;
        // 这里不自动重连，让UI层决定是否重连
      }, 5000);
    } else {
      console.error('WebSocket连接失败，已达到最大重试次数');
      this.retryCount = 0;
    }
  }
}

// 创建单例实例
export const webSocketService = new WebSocketService(); 