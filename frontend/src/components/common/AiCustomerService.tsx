import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Input, List, Avatar, Spin, message } from 'antd';
import { MessageOutlined, SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import * as aiChatApi from '@/services/aiChatApi';

const { TextArea } = Input;

interface AiMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

interface AiChat {
  id: number;
  sessionId: string;
  title: string;
  status: number;
}

const AiCustomerService: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState<AiChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 打开对话窗口
  const handleOpen = async () => {
    setVisible(true);
    if (!currentChat) {
      await createNewChat();
    }
  };

  // 创建新对话
  const createNewChat = async () => {
    try {
      const userId = user?.id || null;
      const response = await aiChatApi.createChat(userId);
      if (response.code === 200) {
        setCurrentChat(response.data);
        // 添加欢迎消息
        const welcomeMessage: AiMessage = {
          id: 0,
          content: '您好！我是 Casual Rent 的AI客服助手，很高兴为您服务！请问有什么可以帮助您的吗？',
          role: 'assistant',
          createdAt: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('创建对话失败:', error);
      message.error('创建对话失败，请稍后重试');
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setLoading(true);

    // 添加用户消息
    const newUserMessage: AiMessage = {
      id: Date.now(),
      content: userMessage,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const userId = user?.id || null;
      const sessionId = currentChat?.sessionId || '';
      
      const response = await aiChatApi.sendMessage({
        sessionId,
        message: userMessage,
        userId
      });

      if (response.code === 200) {
        const aiMessage: AiMessage = {
          id: response.data.id,
          content: response.data.content,
          role: 'assistant',
          createdAt: response.data.createdAt
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: AiMessage = {
        id: Date.now() + 1,
        content: '抱歉，AI客服暂时无法回复，请稍后重试。',
        role: 'assistant',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // 处理回车发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 关闭对话窗口
  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      {/* 悬浮客服按钮 */}
      <div
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          zIndex: 1000,
        }}
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={handleOpen}
          style={{
            width: '60px',
            height: '60px',
            fontSize: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        />
      </div>

      {/* AI客服对话窗口 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <span>AI客服</span>
          </div>
        }
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={400}
        style={{ top: 20 }}
        bodyStyle={{ 
          padding: 0, 
          height: '500px', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        {/* 消息列表 */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px',
            background: '#f5f5f5'
          }}
        >
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item
                style={{
                  border: 'none',
                  padding: '8px 0',
                  justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    maxWidth: '80%',
                    flexDirection: item.role === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  <Avatar
                    size="small"
                    icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: item.role === 'user' ? '#1890ff' : '#52c41a',
                      flexShrink: 0
                    }}
                  />
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '12px',
                      backgroundColor: item.role === 'user' ? '#1890ff' : '#ffffff',
                      color: item.role === 'user' ? '#ffffff' : '#000000',
                      fontSize: '14px',
                      lineHeight: '1.4',
                      wordBreak: 'break-word',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    {item.content}
                  </div>
                </div>
              </List.Item>
            )}
          />
          {loading && (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <Spin size="small" />
              <span style={{ marginLeft: '8px', color: '#666' }}>AI正在思考中...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息，按回车发送..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ 
                flex: 1,
                resize: 'none'
              }}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={loading}
              disabled={!inputValue.trim()}
              style={{
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#999', 
            marginTop: '4px',
            textAlign: 'center'
          }}>
            由 AI 驱动，可能会出现错误
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AiCustomerService;