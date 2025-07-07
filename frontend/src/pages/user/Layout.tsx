import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Modal, Input, message } from 'antd';
import { UserOutlined, ShoppingOutlined, HistoryOutlined, MessageOutlined, HomeOutlined, HeartOutlined, SendOutlined, RobotOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { createChat, sendMessage } from '@/services/aiChatApi';
import type { SendMessageRequest } from '@/services/aiChatApi';
import Home from './Home';
import Products from './Products';
import ProductDetail from './ProductDetail';
import Orders from './Orders';
import OrderManagement from './OrderManagement';
import Profile from './Profile';
import Favorites from './Favorites';
import Chat from './Chat';
import Messages from './Messages';
import AddressManagement from './AddressManagement';

import MessageDemo from '@/components/common/MessageDemo';

const { Header, Content, Footer } = Layout;

const UserLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { unreadCount, refreshUnreadCount } = useUnreadMessages();
  const navigate = useNavigate();
  const location = useLocation();
  
  // AI客服状态
  const [aiChatVisible, setAiChatVisible] = useState(false);
  const [aiInputValue, setAiInputValue] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{
    id: number;
    content: string;
    role: 'user' | 'assistant';
  }>>([]);
  const [aiSessionId, setAiSessionId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // 组件初始化时检查登录状态
  useEffect(() => {
    // 如果认证无效且当前页面需要登录权限，跳转到登录页
    const protectedPaths = ['/user/orders', '/user/profile', '/user/favorites'];
    const currentPath = location.pathname;
    
    if (!isAuthenticated && protectedPaths.includes(currentPath)) {
      navigate('/auth/login?type=user');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/addresses')) return 'addresses';
    if (path.includes('/favorites')) return 'favorites';
    if (path.includes('/messages') || path.includes('/chat')) return 'messages';
    return 'home';
  };

  const handleMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
      navigate('/auth/login?type=user');
    } else if (key === 'profile') {
      navigate('/user/profile');
    } else if (key === 'orders') {
      navigate('/user/orders');
    } else if (key === 'addresses') {
      navigate('/user/addresses');
    }
  };

  const handleNavMenuClick = ({ key }: { key: string }) => {
    // 对于需要登录的功能，先检查登录状态
    const requireLoginRoutes = ['orders', 'addresses', 'favorites', 'messages'];
    
    if (requireLoginRoutes.includes(key) && !isAuthenticated) {
      navigate('/auth/login?type=user');
      return;
    }
    
    switch (key) {
      case 'home':
        navigate('/user');
        break;
      case 'products':
        navigate('/user/products');
        break;
      case 'orders':
        navigate('/user/orders');
        break;
      case 'addresses':
        navigate('/user/addresses');
        break;
      case 'favorites':
        navigate('/user/favorites');
        break;
      case 'messages':
        navigate('/user/messages');
        // 刷新未读消息数量
        setTimeout(() => refreshUnreadCount(), 1000);
        break;
      default:
        break;
    }
  };

  // 初始化AI客服聊天
  const initAiChat = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录后使用AI客服');
      navigate('/auth/login?type=user');
      return;
    }

    try {
      const response = await createChat(user?.id || null);
      setAiSessionId(response.data.sessionId);
      
      // 添加欢迎消息
      setAiMessages([{
        id: Date.now(),
        content: '您好！我是 Casual Rent 的AI客服助手，很高兴为您服务！请问有什么可以帮助您的吗？',
        role: 'assistant'
      }]);
    } catch (error) {
      console.error('初始化AI客服失败:', error);
      message.error('初始化AI客服失败，请稍后重试');
    }
  };

  // AI客服处理函数
  const handleAiSendMessage = async () => {
    if (!aiInputValue.trim() || aiLoading) return;
    if (!isAuthenticated) {
      message.warning('请先登录后使用AI客服');
      navigate('/auth/login?type=user');
      return;
    }

    const userMessage = aiInputValue.trim();
    setAiInputValue('');
    setAiLoading(true);

    // 添加用户消息
    setAiMessages(prev => [...prev, {
      id: Date.now(),
      content: userMessage,
      role: 'user'
    }]);

    try {
      // 如果没有会话ID，先创建会话
      let sessionId = aiSessionId;
      if (!sessionId) {
        const chatResponse = await createChat(user?.id || null);
        sessionId = chatResponse.data.sessionId;
        setAiSessionId(sessionId);
      }

      // 发送消息给AI
      const request: SendMessageRequest = {
        sessionId,
        message: userMessage,
        userId: user?.id || null
      };
      const response = await sendMessage(request);
      
      // 添加AI回复
      setAiMessages(prev => [...prev, {
        id: Date.now() + 1,
        content: response.data.content,
        role: 'assistant'
      }]);
    } catch (error) {
      console.error('发送消息失败:', error);
      setAiMessages(prev => [...prev, {
        id: Date.now() + 1,
        content: '抱歉，AI客服暂时无法回复，请稍后重试。如有紧急问题，请通过页面上的"消息"功能联系相关商家。',
        role: 'assistant'
      }]);
      message.error('发送消息失败，请稍后重试');
    } finally {
      setAiLoading(false);
    }
  };

  // 打开AI客服对话窗口
  const handleOpenAiChat = () => {
    setAiChatVisible(true);
    if (aiMessages.length === 0) {
      initAiChat();
    }
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: '个人中心',
        icon: <UserOutlined />
      },
      {
        key: 'orders',
        label: '我的订单',
        icon: <HistoryOutlined />
      },
      {
        key: 'addresses',
        label: '地址管理',
        icon: <HomeOutlined />
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        label: '退出登录',
        icon: <UserOutlined />
      },
    ],
    onClick: ({ key }: { key: string }) => handleMenuClick(key),
  };

  return (
    <Layout className="min-h-screen" style={{ background: '#f8fafc' }}>
      <Header 
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          padding: '0 24px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          maxWidth: '1400px', 
          margin: '0 auto',
          height: '64px',
          padding: '0 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <div 
              style={{ 
                color: '#1f2937', 
                fontSize: '24px', 
                fontWeight: 'bold', 
                marginRight: '24px', 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flexShrink: 0
              }} 
              onClick={() => navigate('/user')}
              onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1f2937'}
            >
              Casual Rent
            </div>
            <Menu
              theme="light"
              mode="horizontal"
              selectedKeys={[getSelectedKey()]}
              onClick={handleNavMenuClick}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '16px',
                flex: 1,
                minWidth: 0
              }}
              items={[
                {
                  key: 'home',
                  label: '首页',
                  icon: <UserOutlined style={{ fontSize: '16px', color: '#6b7280' }} />,
                  style: {
                    borderRadius: '8px',
                    margin: '0 4px',
                    transition: 'all 0.3s ease',
                    color: '#374151'
                  }
                },
                {
                  key: 'products',
                  label: '商品',
                  icon: <ShoppingOutlined style={{ fontSize: '16px', color: '#6b7280' }} />,
                  style: {
                    borderRadius: '8px',
                    margin: '0 4px',
                    transition: 'all 0.3s ease',
                    color: '#374151'
                  }
                },
                {
                  key: 'orders',
                  label: '订单',
                  icon: <HistoryOutlined style={{ fontSize: '16px', color: '#6b7280' }} />,
                  style: {
                    borderRadius: '8px',
                    margin: '0 4px',
                    transition: 'all 0.3s ease',
                    color: '#374151'
                  }
                },
                {
                  key: 'addresses',
                  label: '地址',
                  icon: <HomeOutlined style={{ fontSize: '16px', color: '#6b7280' }} />,
                  style: {
                    borderRadius: '8px',
                    margin: '0 4px',
                    transition: 'all 0.3s ease',
                    color: '#374151'
                  }
                },
                {
                  key: 'favorites',
                  label: '收藏',
                  icon: <HeartOutlined style={{ fontSize: '16px', color: '#6b7280' }} />,
                  style: {
                    borderRadius: '8px',
                    margin: '0 4px',
                    transition: 'all 0.3s ease',
                    color: '#374151'
                  }
                },
                {
                  key: 'messages',
                  label: (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <span>消息</span>
                      {unreadCount > 0 && (
                        <Badge 
                          count={unreadCount} 
                          size="small" 
                          style={{ 
                            position: 'absolute',
                            top: '-8px',
                            right: '-16px',
                            zIndex: 1
                          }}
                        />
                      )}
                    </div>
                  ),
                  icon: <MessageOutlined style={{ fontSize: '16px', color: '#6b7280' }} />,
                  style: {
                    borderRadius: '8px',
                    margin: '0 4px',
                    transition: 'all 0.3s ease',
                    color: '#374151'
                  }
                }
              ]}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            
            {isAuthenticated && user ? (
              <Dropdown menu={userMenu} placement="bottomRight" arrow>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: '#374151',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  maxWidth: window.innerWidth > 768 ? '200px' : '150px',
                  minWidth: window.innerWidth > 768 ? '120px' : '80px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}>
                  <Avatar 
                    src={(user as any)?.avatar} 
                    icon={<UserOutlined />}
                    style={{ marginRight: '8px', flexShrink: 0 }}
                    size={window.innerWidth > 768 ? 'default' : 'small'}
                  />
                  <span style={{ 
                    fontWeight: '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: window.innerWidth > 768 ? '120px' : '80px',
                    fontSize: window.innerWidth > 768 ? '14px' : '12px'
                  }}>
                    {(user as any)?.nickname || 
                     (user as any)?.name || 
                     (user as any)?.companyName || 
                     (user as any)?.contactName || 
                     '用户'}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <div style={{ display: 'flex', gap: window.innerWidth > 768 ? '12px' : '8px', flexShrink: 0 }}>
                <Button 
                  type="text" 
                  onClick={() => navigate('/auth/login?type=user')}
                  style={{
                    color: '#6b7280',
                    fontSize: window.innerWidth > 768 ? '16px' : '14px',
                    height: '40px',
                    padding: window.innerWidth > 768 ? '0 20px' : '0 16px',
                    borderRadius: '20px',
                    background: 'transparent',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    minWidth: window.innerWidth > 768 ? '80px' : '60px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  登录
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/auth/register?type=user')}
                  style={{
                    height: '40px',
                    padding: window.innerWidth > 768 ? '0 20px' : '0 16px',
                    borderRadius: '20px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: window.innerWidth > 768 ? '16px' : '14px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s ease',
                    minWidth: window.innerWidth > 768 ? '80px' : '60px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                  }}
                >
                  注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </Header>

      <Content style={{ flex: 1, background: '#f8fafc' }}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-management" element={<OrderManagement />} />
          <Route path="addresses" element={<AddressManagement />} />
          <Route path="profile" element={<Profile />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="chat" element={<Chat />} />
          <Route path="messages" element={<Messages />} />
          <Route path="message-demo" element={<MessageDemo />} />
        </Routes>
      </Content>

      <Footer 
        style={{
          textAlign: 'center',
          background: 'white',
          color: '#6b7280',
          padding: '40px 24px',
          fontSize: '16px',
          borderTop: '1px solid #e5e7eb'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              Casual Rent
            </span>
          </div>
          <div style={{ color: '#9ca3af' }}>
            让闲置物品重新焕发价值 | ©2025 Created by Genius of CityU
          </div>
        </div>
      </Footer>

      {/* AI客服悬浮按钮 */}
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
          onClick={handleOpenAiChat}
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
        open={aiChatVisible}
        onCancel={() => setAiChatVisible(false)}
        footer={null}
        width={400}
        style={{ top: 20 }}
      >
        <div style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            marginBottom: '16px', 
            background: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '8px',
            maxHeight: '300px'
          }}>
            {aiMessages.map((msg) => (
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
                    wordBreak: 'break-word',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input.TextArea
              value={aiInputValue}
              onChange={(e) => setAiInputValue(e.target.value)}
              placeholder="输入消息，按回车发送..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ flex: 1, resize: 'none' }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleAiSendMessage();
                }
              }}
            />
            <Button
              type="primary"
              icon={aiLoading ? <LoadingOutlined /> : <SendOutlined />}
              onClick={handleAiSendMessage}
              disabled={!aiInputValue.trim() || aiLoading}
              loading={aiLoading}
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
            marginTop: '8px',
            textAlign: 'center'
          }}>
            由 AI 驱动，可能会出现错误 | 支持多种AI模型
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default UserLayout; 