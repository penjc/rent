import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { List, Input, Button, message } from 'antd';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMessages, sendMessage, type ChatMessage } from '@/services/chatService';

const Chat: React.FC = () => {
  const [params] = useSearchParams();
  const merchantId = Number(params.get('merchantId'));
  const { user } = useAuthStore();
  const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (user && merchantId) {
      loadMessages();
    }
  }, [user, merchantId]);

  const loadMessages = async () => {
    if (!user) return;
    const list = await getMessages(user.id as unknown as number, merchantId);
    setMessagesList(list);
  };

  const handleSend = async () => {
    if (!content.trim() || !user) return;
    try {
      const msg = await sendMessage({
        senderId: user.id as unknown as number,
        receiverId: merchantId,
        content,
      });
      setMessagesList((prev) => [...prev, msg]);
      setContent('');
    } catch (e) {
      message.error('发送失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <List
        bordered
        dataSource={messagesList}
        renderItem={(item) => (
          <List.Item>
            <div>
              <b>{item.senderId === (user as any)?.id ? '我' : '对方'}:</b> {item.content}
            </div>
          </List.Item>
        )}
        style={{ marginBottom: 16 }}
      />
      <Input.TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="输入消息"
      />
      <Button type="primary" onClick={handleSend} style={{ marginTop: 8 }}>
        发送
      </Button>
    </div>
  );
};

export default Chat;
