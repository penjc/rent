import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
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
import Chat from './Chat';
import Messages from './Messages';
import { useAuthStore } from '@/stores/useAuthStore';
import { showMessage } from '@/hooks/useMessage';
import type { MerchantData } from '@/services/merchantApi';

const { Header, Sider, Content, Footer } = Layout;

const MerchantLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, userType, logout } = useAuthStore();
  const [merchant, setMerchant] = useState<MerchantData | null>(null);

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/certification')) return 'certification';
    if (path.includes('/messages')) return 'messages';
    return 'dashboard';
  };

  useEffect(() => {
    // 检查是否是商家类型的登录
    const storedUserType = localStorage.getItem('merchant_userType');
    
    if (!isAuthenticated || storedUserType !== 'merchant') {
      // showMessage.warning('请先登录商家账号');
      navigate('/auth/login?type=merchant');
      return;
    }
    
    // 如果认证有效且是商家类型，设置商家信息
    if (user) {
      setMerchant(user as any);
    }
  }, [navigate, isAuthenticated, userType, user]);

  const handleLogout = () => {
    logout();
    showMessage.success('已退出登录');
    navigate('/auth/login?type=merchant');
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '控制台',
      onClick: () => navigate('/merchant')
    },
    {
      key: 'products',
      icon: <ShopOutlined />,
      label: '商品管理',
      onClick: () => navigate('/merchant/products')
    },
    {
      key: 'orders',
      icon: <OrderedListOutlined />,
      label: '订单管理',
      onClick: () => navigate('/merchant/orders')
    },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: '消息列表',
      onClick: () => navigate('/merchant/messages')
    },
    {
      key: 'certification',
      icon: <UserOutlined />,
      label: '商家认证',
      onClick: () => navigate('/merchant/certification')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light" style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.06)' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <h1 style={{ margin: 0, fontSize: 20, color: '#1890ff' }}>商家中心</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: handleLogout
                }
              ]
            }}
          >
            <Button type="text" icon={<Avatar icon={<UserOutlined />} />}>
              {merchant?.companyName || '商家'}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', background: '#fff', padding: 24, minHeight: 280 }}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="certification" element={<Certification />} />
            <Route path="chat" element={<Chat />} />
            <Route path="messages" element={<Messages />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Casual Rent ©{new Date().getFullYear()} Created by Your Company
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MerchantLayout; 