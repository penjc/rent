import React, { useState } from 'react';
import { Button, Modal, Input } from 'antd';
import { MessageOutlined, SendOutlined, RobotOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const AiChat: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: number;
    content: string;
    role: 'user' | 'assistant';
  }>>([
    {
      id: 1,
      content: '您好！我是 Casual Rent 的AI客服助手，很高兴为您服务！请问有什么可以帮助您的吗？',
      role: 'assistant'
    }
  ]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    setMessages(prev => [...prev, {
      id: Date.now(),
      content: userMessage,
      role: 'user'
    }]);

    // 模拟AI回复
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        content: '感谢您的咨询！目前AI客服正在开发中，请稍后重试或联系人工客服。',
        role: 'assistant'
      }]);
    }, 1000);
  };

  return (
    <>
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
          onClick={() => setVisible(true)}
          style={{
            width: '60px',
            height: '60px',
            fontSize: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        />
      </div>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <span>AI客服</span>
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: msg.role === 'user' ? '#1890ff' : '#ffffff',
                    color: msg.role === 'user' ? '#ffffff' : '#000000',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入消息..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ flex: 1 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AiChat;