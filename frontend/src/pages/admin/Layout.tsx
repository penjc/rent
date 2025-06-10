import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, message } from 'antd';
import { 
  DashboardOutlined, 
  UsergroupAddOutlined, 
  ShopOutlined, 
  AuditOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import Dashboard from './Dashboard';
import Users from './Users';
import Merchants from './Merchants';
import Products from './Products';

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout: React.FC = () => {
  const { isAuthenticated, user, userType, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 检查管理员认证状态
  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    
    if (!isAuthenticated || storedUserType !== 'admin') {
      message.warning('请先登录管理员账号');
      navigate('/auth/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/users')) return 'users';
    if (path.includes('/merchants')) return 'merchants';
    if (path.includes('/products')) return 'products';
    return 'dashboard';
  };

  const handleMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
      message.success('已退出登录');
      navigate('/auth/login');
    } else if (key === 'profile') {
      message.info('个人信息页面开发中...');
    }
  };

  const handleNavMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'dashboard':
        navigate('/admin');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'merchants':
        navigate('/admin/merchants');
        break;
      case 'products':
        navigate('/admin/products');
        break;
      default:
        break;
    }
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: '个人信息',
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        label: '退出登录',
      },
    ],
    onClick: ({ key }: { key: string }) => handleMenuClick(key),
  };

  // 如果没有有效的认证状态，显示加载状态
  if (!isAuthenticated || userType !== 'admin') {
    return (
      <Layout className="min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">正在验证管理员身份...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Header className="header">
        <div className="flex justify-between items-center">
          <div className="logo text-white text-xl font-bold">
            Casual Rent - 管理后台
          </div>
          
          <div className="auth-section">
            {isAuthenticated && user ? (
              <Dropdown menu={userMenu} placement="bottomRight">
                <div className="flex items-center cursor-pointer text-white">
                  <Avatar src={(user as any)?.avatar} icon={<UserOutlined />} />
                  <span className="ml-2">
                    {(user as any)?.name || 
                     (user as any)?.username || 
                     '管理员'}
                  </span>
                </div>
              </Dropdown>
                          ) : (
                <div className="space-x-2">
                  <Button type="text" className="text-white" onClick={() => navigate('/auth/login')}>登录</Button>
                </div>
              )}
          </div>
        </div>
      </Header>

      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            style={{ height: '100%', borderRight: 0 }}
            onClick={handleNavMenuClick}
            items={[
              {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: '仪表盘',
              },
              {
                key: 'users',
                icon: <UsergroupAddOutlined />,
                label: '用户管理',
              },
              {
                key: 'merchants',
                icon: <AuditOutlined />,
                label: '商家管理',
              },
              {
                key: 'products',
                icon: <ShopOutlined />,
                label: '商品审核',
              },
            ]}
          />
        </Sider>

        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="merchants" element={<Merchants />} />
              <Route path="products" element={<Products />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>

      <Footer className="text-center">
        Casual Rent ©2024 管理后台
      </Footer>
    </Layout>
  );
};

export default AdminLayout; 