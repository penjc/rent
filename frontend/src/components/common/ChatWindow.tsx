import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Input,
  Button,
  Upload,
  message,
  Avatar,
  Spin,
  Empty,
  Divider,
} from 'antd';
import {
  SendOutlined,
  PictureOutlined,
  FileOutlined,
  UserOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { chatService } from '@/services/chatService';
import type { ChatMessage } from '@/types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ChatWindowProps {
  visible: boolean;
  onClose: () => void;
  currentUserId: number;
  currentUserType: 'user' | 'merchant';
  targetUserId: number;
  targetUserType: 'user' | 'merchant';
  targetUserName: string;
  targetUserAvatar?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  visible,
  onClose,
  currentUserId,
  currentUserType,
  targetUserId,
  targetUserType,
  targetUserName,
  targetUserAvatar,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 加载聊天记录
  const loadChatHistory = async () => {
    if (!visible) return;
    
    setLoading(true);
    try {
      const response = await chatService.getChatHistory({
        senderId: currentUserId,
        senderType: currentUserType,
        receiverId: targetUserId,
        receiverType: targetUserType,
        page: 1,
        size: 50,
      });
      
      if (response.code === 200) {
        setMessages(response.data || []);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('加载聊天记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 发送文本消息
  const sendTextMessage = async () => {
    if (!inputValue.trim()) return;
    
    setSending(true);
    try {
      const response = await chatService.sendMessage({
        senderId: currentUserId,
        senderType: currentUserType,
        receiverId: targetUserId,
        receiverType: targetUserType,
        content: inputValue.trim(),
      });
      
                   if (response.code === 200 && response.data) {
        setMessages(prev => [...prev, response.data!]);
        setInputValue('');
        setTimeout(scrollToBottom, 100);
      } else {
        message.error(response.message || '发送失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送失败');
    } finally {
      setSending(false);
    }
  };

  // 发送图片
  const handleImageUpload = async (file: File) => {
    try {
      const response = await chatService.sendImage(
        file,
        currentUserId,
        currentUserType,
        targetUserId,
        targetUserType
      );
      
                   if (response.code === 200 && response.data) {
        setMessages(prev => [...prev, response.data!]);
        setTimeout(scrollToBottom, 100);
        message.success('图片发送成功');
      } else {
        message.error(response.message || '图片发送失败');
      }
    } catch (error) {
      console.error('图片发送失败:', error);
      message.error('图片发送失败');
    }
  };

  // 发送文件
  const handleFileUpload = async (file: File) => {
    try {
      const response = await chatService.sendFile(
        file,
        currentUserId,
        currentUserType,
        targetUserId,
        targetUserType
      );
      
                   if (response.code === 200 && response.data) {
        setMessages(prev => [...prev, response.data!]);
        setTimeout(scrollToBottom, 100);
        message.success('文件发送成功');
      } else {
        message.error(response.message || '文件发送失败');
      }
    } catch (error) {
      console.error('文件发送失败:', error);
      message.error('文件发送失败');
    }
  };

  // 处理按键事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  // 格式化时间
  const formatTime = (time: string) => {
    return dayjs(time).format('HH:mm');
  };

  // 渲染消息内容
  const renderMessageContent = (msg: ChatMessage) => {
    switch (msg.messageType) {
      case 'text':
        return <div className="text-gray-800">{msg.content}</div>;
      case 'image':
        return (
          <div className="max-w-xs">
            <img
              src={msg.fileUrl}
              alt="图片"
              className="rounded cursor-pointer max-w-full h-auto"
              onClick={() => window.open(msg.fileUrl)}
            />
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
            <FileOutlined className="text-blue-500" />
            <div>
              <div className="text-sm font-medium">{msg.fileName}</div>
              <a
                href={msg.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500"
              >
                下载文件
              </a>
            </div>
          </div>
        );
      default:
        return <div className="text-gray-800">{msg.content}</div>;
    }
  };

  useEffect(() => {
    if (visible) {
      loadChatHistory();
    }
  }, [visible, currentUserId, targetUserId]);

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <Avatar
            src={targetUserAvatar}
            icon={targetUserType === 'user' ? <UserOutlined /> : <ShopOutlined />}
          />
          <span>{targetUserName}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      height={600}
    >
      <div className="flex flex-col h-96">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center">
              <Spin />
            </div>
          ) : messages.length === 0 ? (
            <Empty description="暂无聊天记录" />
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.senderId === currentUserId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {msg.senderId !== currentUserId && (
                      <Avatar
                        size="small"
                        src={msg.senderAvatar}
                        icon={msg.senderType === 'user' ? <UserOutlined /> : <ShopOutlined />}
                      />
                    )}
                    <div className="flex-1">
                      {msg.senderId !== currentUserId && (
                        <div className="text-xs text-gray-500 mb-1">{msg.senderName}</div>
                      )}
                      {renderMessageContent(msg)}
                      <div
                        className={`text-xs mt-1 ${
                          msg.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <Divider className="my-2" />

        {/* 输入区域 */}
        <div className="p-4 border-t">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                rows={2}
                maxLength={500}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  handleImageUpload(file);
                  return false;
                }}
              >
                <Button icon={<PictureOutlined />} size="small" />
              </Upload>
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  handleFileUpload(file);
                  return false;
                }}
              >
                <Button icon={<FileOutlined />} size="small" />
              </Upload>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendTextMessage}
                loading={sending}
                disabled={!inputValue.trim()}
              >
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChatWindow; 