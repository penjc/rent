import React, { useEffect, useState } from 'react';
import { List, Avatar, Typography, Empty, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { getUserMessages } from '@/services/chatService';
import { getUserNicknames, getUserAvatars } from '@/services/userApi';
import type { ChatMessage } from '@/types';

const { Title, Text } = Typography;

interface UserChat {
  userId: number;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [userChats, setUserChats] = useState<UserChat[]>([]);

  useEffect(() => {
    if (user) {
      loadUserChats();
    }
  }, [user]);

  const loadUserChats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // 获取所有消息
      const messages = await getUserMessages(user.id as unknown as number);
      // 收集所有对方ID（用户ID）
      const userIdSet = new Set<number>();
      messages.forEach((msg: ChatMessage) => {
        if (msg.senderId !== user.id) {
          userIdSet.add(msg.senderId);
        }
        if (msg.receiverId !== user.id) {
          userIdSet.add(msg.receiverId);
        }
      });
      const userIds = Array.from(userIdSet);
      
      // 获取用户昵称和头像
      const [userNicknames, userAvatars] = await Promise.all([
        getUserNicknames(userIds),
        getUserAvatars(userIds)
      ]);
      
      // 按用户分组消息
      const userMap = new Map<number, UserChat>();
      messages.forEach((msg: ChatMessage) => {
        const userId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        if (userId === user.id) return;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            userName: userNicknames[userId] || `用户${userId}`,
            userAvatar: userAvatars[userId] || '',
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
            unreadCount: 0
          });
        } else {
          const chat = userMap.get(userId)!;
          if (new Date(msg.createdAt) > new Date(chat.lastMessageTime)) {
            chat.lastMessage = msg.content;
            chat.lastMessageTime = msg.createdAt;
          }
        }
      });
      // 转换为数组并排序
      const chats = Array.from(userMap.values())
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      setUserChats(chats);
    } catch (error) {
      console.error('加载消息失败:', error);
      message.error('加载消息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (userId: number) => {
    navigate(`/merchant/chat?userId=${userId}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (userChats.length === 0) {
    return (
      <div style={{ padding: '32px 0', minHeight: '80vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e6f7ff 100%)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', borderRadius: 18, boxShadow: '0 8px 32px rgba(102,126,234,0.10)', padding: '32px 32px 24px 32px' }}>
          <Title level={2} style={{ marginBottom: 32, textAlign: 'center', fontWeight: 700, color: '#3b5998', letterSpacing: 2 }}>消息列表</Title>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span style={{ color: '#888', fontSize: 16 }}>暂无消息</span>}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 0', minHeight: '80vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e6f7ff 100%)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', borderRadius: 18, boxShadow: '0 8px 32px rgba(102,126,234,0.10)', padding: '32px 32px 24px 32px' }}>
        <Title level={2} style={{ marginBottom: 32, textAlign: 'center', fontWeight: 700, color: '#3b5998', letterSpacing: 2 }}>消息列表</Title>
        <List
          itemLayout="horizontal"
          dataSource={userChats}
          renderItem={(chat) => (
            <List.Item
              onClick={() => handleChatClick(chat.userId)}
              style={{
                cursor: 'pointer',
                padding: '20px 18px',
                borderRadius: '14px',
                marginBottom: '18px',
                background: 'linear-gradient(90deg, #f6fbff 0%, #f0f4ff 100%)',
                boxShadow: '0 2px 8px rgba(102,126,234,0.08)',
                border: '1.5px solid #e6f7ff',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(102,126,234,0.15)';
                e.currentTarget.style.background = '#f0f8ff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(102,126,234,0.08)';
                e.currentTarget.style.background = 'linear-gradient(90deg, #f6fbff 0%, #f0f4ff 100%)';
              }}
            >
              <Avatar
                src={chat.userAvatar}
                icon={!chat.userAvatar && <UserOutlined />}
                style={{ backgroundColor: '#1890ff', fontSize: 22, marginRight: 18, width: 48, height: 48 }}
                size={48}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 18, color: '#222' }}>{chat.userName}</Text>
                  <Text type="secondary" style={{ fontSize: 13, color: '#888' }}>{new Date(chat.lastMessageTime).toLocaleString()}</Text>
                </div>
                <Text type="secondary" ellipsis style={{ marginTop: 6, fontSize: 15, color: '#666', display: 'block' }}>{chat.lastMessage}</Text>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default Messages; 