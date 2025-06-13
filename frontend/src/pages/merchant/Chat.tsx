import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { List, Input, Button, message, Typography } from 'antd';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMessages, sendMessage, type ChatMessage } from '@/services/chatService';
import { getUserNicknames } from '@/services/userApi';

const { Title } = Typography;

const Chat: React.FC = () => {
  const [params] = useSearchParams();
  const userId = Number(params.get('userId'));
  const { user } = useAuthStore();
  const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user && userId) {
      loadMessages();
      loadUserName();
    }
  }, [user, userId]);

  const loadMessages = async () => {
    if (!user) return;
    const list = await getMessages(user.id as unknown as number, userId);
    setMessagesList(list);
  };

  const loadUserName = async () => {
    if (!userId) return;
    const nicknames = await getUserNicknames([userId]);
    setUserName(nicknames[userId] || `用户${userId}`);
  };

  const handleSend = async () => {
    if (!content.trim() || !user) return;
    try {
      const msg = await sendMessage({
        senderId: user.id as unknown as number,
        receiverId: userId,
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
      <Title level={4} style={{ marginBottom: 24 }}>与 {userName} 的对话</Title>
      <List
        bordered
        dataSource={messagesList}
        renderItem={(item) => (
          <List.Item>
            <div>
              <b>{item.senderId === (user as any)?.id ? '我' : userName}:</b> {item.content}
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
