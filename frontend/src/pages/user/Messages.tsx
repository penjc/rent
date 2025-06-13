import React, { useEffect, useState } from 'react';
import { List, Avatar, Typography, Empty, Spin, message } from 'antd';
import { UserOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { getUserMessages } from '@/services/chatService';
import { getMerchantCompanyNames } from '@/services/merchantApi';
import type { ChatMessage } from '@/types';

const { Title, Text } = Typography;

interface MerchantChat {
  merchantId: number;
  merchantName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [merchantChats, setMerchantChats] = useState<MerchantChat[]>([]);

  useEffect(() => {
    if (user) {
      loadMerchantChats();
    }
  }, [user]);

  const loadMerchantChats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // 获取所有消息
      const messages = await getUserMessages(user.id as unknown as number);
      // 收集所有对方ID（商家ID）
      const merchantIdSet = new Set<number>();
      messages.forEach((msg: ChatMessage) => {
        if (msg.senderId !== user.id) {
          merchantIdSet.add(msg.senderId);
        }
        if (msg.receiverId !== user.id) {
          merchantIdSet.add(msg.receiverId);
        }
      });
      const merchantIds = Array.from(merchantIdSet);
      // 批量获取公司名
      let merchantNameMap: Record<number, string> = {};
      if (merchantIds.length > 0) {
        merchantNameMap = await getMerchantCompanyNames(merchantIds);
      }
      // 按商家分组消息
      const merchantMap = new Map<number, MerchantChat>();
      messages.forEach((msg: ChatMessage) => {
        const merchantId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        if (merchantId === user.id) return;
        const merchantName = merchantNameMap[merchantId] || '商家';
        if (!merchantMap.has(merchantId)) {
          merchantMap.set(merchantId, {
            merchantId,
            merchantName,
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
            unreadCount: 0
          });
        } else {
          const chat = merchantMap.get(merchantId)!;
          if (new Date(msg.createdAt) > new Date(chat.lastMessageTime)) {
            chat.lastMessage = msg.content;
            chat.lastMessageTime = msg.createdAt;
          }
        }
      });
      // 转换为数组并排序
      const chats = Array.from(merchantMap.values())
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      setMerchantChats(chats);
    } catch (error) {
      console.error('加载消息失败:', error);
      message.error('加载消息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (merchantId: number) => {
    navigate(`/user/chat?merchantId=${merchantId}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (merchantChats.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        background: 'white',
        borderRadius: '8px',
        padding: '24px'
      }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无消息"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>我的消息</Title>
      <List
        itemLayout="horizontal"
        dataSource={merchantChats}
        renderItem={(chat) => (
          <List.Item
            onClick={() => handleChatClick(chat.merchantId)}
            style={{
              cursor: 'pointer',
              padding: '16px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              background: 'white',
              marginBottom: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar 
                  icon={<ShopOutlined />} 
                  style={{ 
                    backgroundColor: '#1890ff',
                    fontSize: '16px'
                  }} 
                />
              }
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{chat.merchantName}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(chat.lastMessageTime).toLocaleString()}
                  </Text>
                </div>
              }
              description={
                <Text 
                  type="secondary" 
                  ellipsis
                  style={{ marginTop: '4px' }}
                >
                  {chat.lastMessage}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Messages; 