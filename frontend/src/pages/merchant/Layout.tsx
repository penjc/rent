import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, message, Badge } from 'antd';
import { 
  DashboardOutlined, 
  ShopOutlined, 
  OrderedListOutlined, 
  UserOutlined,
  LogoutOutlined,
  MessageOutlined
} from '@ant-design/icons';
import Dashboard from './Dashboard';
import Products from './Products';
import Orders from './Orders';
import Certification from './Certification';
import Messages from './Messages';
import { useAuthStore } from '@/stores/useAuthStore';
import { chatService } from '@/services/chatService';
import type { MerchantData } from '@/services/merchantApi';

const { Header, Sider, Content, Footer } = Layout;

const MerchantLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, userType, logout } = useAuthStore();
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // 获取商家ID
  const getMerchantId = (): number | null => {
    if (userType === 'merchant' && user) {
      return Number((user as any).id);
    }
    const merchantInfo = localStorage.getItem('merchantInfo');
    if (merchantInfo) {
      return Number(JSON.parse(merchantInfo).id);
    }
    return null;
  };

  // 加载未读消息数量
  const loadUnreadCount = useCallback(async () => {
    const merchantId = getMerchantId();
    if (!merchantId) return;

    try {
      const response = await chatService.getUnreadCount('merchant', merchantId);
      if (response.code === 200) {
        setUnreadCount(response.data || 0);
      }
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
    }
  }, []);

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/messages')) return 'messages';
    if (path.includes('/certification')) return 'certification';
    return 'dashboard';
  };

  useEffect(() => {
    // 检查是否是商家类型的登录
    const storedUserType = localStorage.getItem('merchant_userType');
    
    if (!isAuthenticated || storedUserType !== 'merchant') {
      message.warning('请先登录商家账号');
      navigate('/auth/login');
      return;
    }
    
    // 如果认证有效且是商家类型，设置商家信息
    if (user) {
      setMerchant(user as any);
      // 加载未读消息数量
      loadUnreadCount();
    }
    }, [navigate, isAuthenticated, userType, user, loadUnreadCount]);

  // 定期刷新未读消息数量
  useEffect(() => {
    if (getMerchantId()) {
      const interval = setInterval(loadUnreadCount, 30000); // 每30秒刷新一次
      return () => clearInterval(interval);
    }
  }, [loadUnreadCount]);

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/auth/login');
  };

  const handleMenuClick = (key: string) => {
    if (key === 'logout') {
      handleLogout();
    }
  };

  const handleNavMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'dashboard':
        navigate('/merchant');
        break;
      case 'products':
        navigate('/merchant/products');
        break;
      case 'orders':
        navigate('/merchant/orders');
        break;
      case 'messages':
        navigate('/merchant/messages');
        // 进入消息页面时清零未读数量显示
        setTimeout(() => {
          loadUnreadCount();
        }, 1000);
        break;
      case 'certification':
        navigate('/merchant/certification');
        break;
      default:
        break;
    }
  };

  const userMenu = {
    items: [
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
      },
    ],
    onClick: ({ key }: { key: string }) => handleMenuClick(key),
  };

  // 如果没有有效的认证状态，显示加载状态
  if (!isAuthenticated || !merchant) {
    return (
      <Layout className="min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">正在验证商家身份...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Header className="header bg-green-600">
        <div className="flex justify-between items-center">
          <div className="logo text-white text-xl font-bold">
            Casual Rent - 商家中心
          </div>
          
          <div className="auth-section">
            {merchant ? (
              <Dropdown menu={userMenu} placement="bottomRight">
                <div className="flex items-center cursor-pointer text-white hover:text-green-100 transition-colors">
                  <Avatar icon={<UserOutlined />} className="bg-green-500" />
                  <span className="ml-2 font-medium">{merchant.contactName || merchant.companyName || '商家用户'}</span>
                  {unreadCount > 0 && (
                    <Badge 
                      count={unreadCount} 
                      size="small" 
                      style={{ marginLeft: 8 }}
                      title={`${unreadCount}条未读消息`}
                    />
                  )}
                </div>
              </Dropdown>
            ) : (
              <div className="space-x-2">
                <Button type="text" className="text-white hover:text-green-100" onClick={() => navigate('/auth/login')}>
                  登录
                </Button>
                <Button type="primary" className="bg-white text-green-600 border-white hover:bg-green-50" onClick={() => navigate('/auth/register')}>
                  注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </Header>

      <Layout>
        <Sider width={250} className="site-layout-background bg-white shadow-lg">
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            className="h-full border-right-0 pt-4"
            onClick={handleNavMenuClick}
            items={[
              {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: '商家概览',
              },
              {
                key: 'products',
                icon: <ShopOutlined />,
                label: '商品管理',
              },
              {
                key: 'orders',
                icon: <OrderedListOutlined />,
                label: '订单管理',
              },
              {
                key: 'messages',
                icon: <Badge count={unreadCount} size="small" offset={[10, 0]}>
                  <MessageOutlined />
                </Badge>,
                label: '客户消息',
              },
              {
                key: 'certification',
                icon: <UserOutlined />,
                label: '商家认证',
              },
            ]}
          />
        </Sider>

        <Layout className="site-layout">
          <Content className="site-layout-background bg-gray-50 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/certification" element={<Certification />} />
            </Routes>
          </Content>

          <Footer className="text-center bg-white border-t">
            Casual Rent ©2025 Created by Genius of CityU
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MerchantLayout; 