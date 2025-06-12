import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Card,
  List,
  Avatar,
  Badge,
  Button,
  Empty,
  Spin,
  message,
  Input,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  MessageOutlined,
  UserOutlined,
  SearchOutlined,
  BellOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import { chatService } from '@/services/chatService';
import { webSocketService } from '@/services/webSocketService';
import api from '@/services/api';
import ChatWindow from '@/components/common/ChatWindow';
import type { ChatSession, ChatMessage } from '@/types';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const Messages: React.FC = () => {
  const { user, userType } = useAuthStore();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [chatVisible, setChatVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // 获取商家ID
  const getMerchantId = () => {
    if (userType === 'merchant' && user) {
      return (user as any).id;
    }
    const merchantInfo = localStorage.getItem('merchantInfo');
    if (merchantInfo) {
      return JSON.parse(merchantInfo).id;
    }
    return null;
  };

  // 加载聊天会话列表
  const loadSessions = useCallback(async () => {
    const merchantId = getMerchantId();
    if (!merchantId) return;

    setLoading(true);
    try {
      const response = await chatService.getMerchantSessions(merchantId);
      if (response.code === 200) {
        const sessionData = response.data || [];
        setSessions(sessionData);
        // 计算总未读数
        const totalUnread = sessionData.reduce((sum: number, session: ChatSession) => 
          sum + session.merchantUnreadCount, 0
        );
        setTotalUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('获取聊天会话失败:', error);
      message.error('获取聊天会话失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取用户信息
  const fetchUserInfo = async (userId: number) => {
    try {
      const response = await api.get(`/users/${userId}`);
      if (response.data.code === 200) {
        setUserInfo(response.data.data);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 打开聊天窗口
  const handleOpenChat = async (session: ChatSession) => {
    setSelectedSession(session);
    await fetchUserInfo(session.userId);
    setChatVisible(true);
    
    // 标记消息为已读
    const merchantId = getMerchantId();
    if (merchantId && session.merchantUnreadCount > 0) {
      try {
        await chatService.markAsRead({
          receiverId: merchantId,
          receiverType: 'merchant',
          senderId: session.userId,
          senderType: 'user',
        });
        // 重新加载会话列表
        await loadSessions();
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }
  };

  // 格式化时间
  const formatTime = (time: string) => {
    const now = dayjs();
    const msgTime = dayjs(time);
    
    if (now.diff(msgTime, 'day') === 0) {
      return msgTime.format('HH:mm');
    } else if (now.diff(msgTime, 'day') === 1) {
      return '昨天';
    } else if (now.diff(msgTime, 'day') < 7) {
      return msgTime.format('dddd');
    } else {
      return msgTime.format('MM-DD');
    }
  };

  // 过滤会话
  const filteredSessions = sessions.filter(session => {
    if (!searchText) return true;
    // 这里可以根据用户名进行搜索，需要先获取用户信息
    return session.lastMessage?.toLowerCase().includes(searchText.toLowerCase());
  });

  // 处理新消息
  const handleNewMessage = useCallback((newMessage: ChatMessage) => {
    // 如果是发给当前商家的消息
    const merchantId = getMerchantId();
    if (newMessage.receiverId === merchantId && newMessage.receiverType === 'merchant') {
      // 刷新会话列表
      loadSessions();
      // 显示通知
      if (!chatVisible || selectedSession?.userId !== newMessage.senderId) {
        message.info(`收到来自用户的新消息: ${newMessage.content.substring(0, 20)}...`);
      }
    }
  }, [loadSessions, chatVisible, selectedSession]);

  // 初始化WebSocket连接
  useEffect(() => {
    const merchantId = getMerchantId();
    if (merchantId) {
      try {
        // 连接WebSocket
        webSocketService.connect(merchantId, 'merchant');
        
        // 添加消息处理器
        webSocketService.addMessageHandler(handleNewMessage);
        
        // 添加连接状态处理器
        const handleConnectionChange = (connected: boolean) => {
          setIsConnected(connected);
          if (connected) {
            message.success('实时消息连接已建立');
          } else {
            message.warning('实时消息连接已断开，请检查网络连接');
          }
        };
        webSocketService.addConnectionHandler(handleConnectionChange);
        
        // 清理函数
        return () => {
          try {
            webSocketService.removeMessageHandler(handleNewMessage);
            webSocketService.removeConnectionHandler(handleConnectionChange);
            webSocketService.disconnect();
          } catch (error) {
            console.error('清理WebSocket连接时出错:', error);
          }
        };
      } catch (error) {
        console.error('初始化WebSocket连接时出错:', error);
        message.error('初始化实时消息服务失败，请刷新页面重试');
      }
    }
  }, [handleNewMessage]);

  // 手动重连WebSocket
  const handleReconnect = useCallback(() => {
    const merchantId = getMerchantId();
    if (merchantId) {
      try {
        webSocketService.disconnect();
        webSocketService.connect(merchantId, 'merchant');
      } catch (error) {
        console.error('重连WebSocket时出错:', error);
        message.error('重连失败，请刷新页面重试');
      }
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                  <MessageOutlined /> 客户消息中心
                </Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Badge dot={!isConnected}>
                    <Button 
                      icon={<SyncOutlined spin={!isConnected} />} 
                      onClick={handleReconnect}
                      type={isConnected ? 'default' : 'primary'}
                    >
                      {isConnected ? '刷新' : '重连'}
                    </Button>
                  </Badge>
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="总未读消息"
                  value={totalUnreadCount}
                  prefix={<BellOutlined />}
                  valueStyle={{ color: totalUnreadCount > 0 ? '#cf1322' : '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="活跃会话"
                  value={sessions.length}
                  prefix={<MessageOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="连接状态"
                  value={isConnected ? '已连接' : '未连接'}
                  valueStyle={{ color: isConnected ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Search
                placeholder="搜索消息内容..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ marginBottom: 16 }}
                enterButton={<SearchOutlined />}
              />
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16, color: '#666' }}>正在加载聊天会话...</p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <Empty
                  description={searchText ? "没有找到匹配的聊天记录" : "暂无客户聊天记录"}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: '50px 0' }}
                />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={filteredSessions}
                  renderItem={(session) => (
                    <List.Item
                      key={session.id}
                      style={{
                        cursor: 'pointer',
                        padding: '16px',
                        borderRadius: '8px',
                        transition: 'all 0.3s',
                        border: '1px solid #f0f0f0',
                        marginBottom: '8px',
                        backgroundColor: session.merchantUnreadCount > 0 ? '#fff7e6' : 'white',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = session.merchantUnreadCount > 0 ? '#fff1e6' : '#f5f5f5';
                        e.currentTarget.style.borderColor = '#1890ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = session.merchantUnreadCount > 0 ? '#fff7e6' : 'white';
                        e.currentTarget.style.borderColor = '#f0f0f0';
                      }}
                      onClick={() => handleOpenChat(session)}
                      actions={[
                        <Button 
                          type="primary" 
                          size="small"
                          style={{ 
                            background: session.merchantUnreadCount > 0 ? '#ff4d4f' : '#1890ff',
                            borderColor: session.merchantUnreadCount > 0 ? '#ff4d4f' : '#1890ff'
                          }}
                        >
                          {session.merchantUnreadCount > 0 ? '查看新消息' : '查看对话'}
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge count={session.merchantUnreadCount} size="small" offset={[-5, 5]}>
                            <Avatar 
                              icon={<UserOutlined />} 
                              size="large" 
                              style={{ 
                                backgroundColor: session.merchantUnreadCount > 0 ? '#ff4d4f' : '#1890ff'
                              }}
                            />
                          </Badge>
                        }
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text 
                              strong 
                              style={{ 
                                fontSize: '16px',
                                color: session.merchantUnreadCount > 0 ? '#262626' : '#595959'
                              }}
                            >
                              用户 #{session.userId}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {session.lastMessageTime && formatTime(session.lastMessageTime)}
                            </Text>
                          </div>
                        }
                        description={
                          <div>
                            <Text
                              type="secondary"
                              ellipsis
                              style={{
                                display: 'block',
                                maxWidth: '400px',
                                fontWeight: session.merchantUnreadCount > 0 ? 'bold' : 'normal',
                                color: session.merchantUnreadCount > 0 ? '#262626' : '#8c8c8c',
                                fontSize: '14px',
                              }}
                            >
                              {session.lastMessage || '暂无消息'}
                            </Text>
                            {session.merchantUnreadCount > 0 && (
                              <Text style={{ color: '#ff4d4f', fontSize: '12px' }}>
                                {session.merchantUnreadCount} 条未读消息
                              </Text>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Space>
          </Card>
        </div>
      </Content>
      
      {/* 聊天窗口 */}
      {selectedSession && userInfo && (
        <ChatWindow
          visible={chatVisible}
          onClose={() => {
            setChatVisible(false);
            setSelectedSession(null);
            setUserInfo(null);
            // 关闭聊天窗口后重新加载会话列表
            loadSessions();
          }}
          currentUserId={getMerchantId()}
          currentUserType="merchant"
          targetUserId={selectedSession.userId}
          targetUserType="user"
          targetUserName={userInfo.nickname || userInfo.phone}
          targetUserAvatar={userInfo.avatar}
        />
      )}
    </Layout>
  );
};

export default Messages; 