import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, ShoppingOutlined, HeartOutlined, HistoryOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import Home from './Home';
import Products from './Products';
import ProductDetail from './ProductDetail';
import Orders from './Orders';
import Profile from './Profile';
import Favorites from './Favorites';

const { Header, Content, Footer } = Layout;

const UserLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 组件初始化时检查登录状态
  useEffect(() => {
    // 如果认证无效且当前页面需要登录权限，跳转到登录页
    const protectedPaths = ['/user/orders', '/user/profile', '/user/favorites'];
    const currentPath = location.pathname;
    
    if (!isAuthenticated && protectedPaths.includes(currentPath)) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/favorites')) return 'favorites';
    return 'home';
  };

  const handleMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
      navigate('/auth/login');
    } else if (key === 'profile') {
      navigate('/user/profile');
    } else if (key === 'orders') {
      navigate('/user/orders');
    }
  };

  const handleNavMenuClick = ({ key }: { key: string }) => {
    // 对于需要登录的功能，先检查登录状态
    const requireLoginRoutes = ['orders', 'favorites'];
    
    if (requireLoginRoutes.includes(key) && !isAuthenticated) {
      navigate('/auth/login');
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
      case 'favorites':
        navigate('/user/favorites');
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
        key: 'orders',
        label: '我的订单',
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

  return (
    <Layout className="min-h-screen">
      <Header className="header">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <div className="logo text-white text-xl font-bold mr-8 cursor-pointer" onClick={() => navigate('/user')}>
              Casual Rent
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[getSelectedKey()]}
              className="flex-1"
              onClick={handleNavMenuClick}
              items={[
                {
                  key: 'home',
                  label: '首页',
                  icon: <UserOutlined />,
                },
                {
                  key: 'products',
                  label: '商品',
                  icon: <ShoppingOutlined />,
                },
                {
                  key: 'favorites',
                  label: '收藏',
                  icon: <HeartOutlined />,
                },
                {
                  key: 'orders',
                  label: '订单',
                  icon: <HistoryOutlined />,
                },
              ]}
            />
          </div>
          
          <div className="auth-section">
            {isAuthenticated && user ? (
              <Dropdown menu={userMenu} placement="bottomRight">
                <div className="flex items-center cursor-pointer text-white hover:text-gray-300">
                  <Avatar src={(user as any)?.avatar} icon={<UserOutlined />} />
                  <span className="ml-2">
                    {(user as any)?.nickname || 
                     (user as any)?.name || 
                     (user as any)?.companyName || 
                     (user as any)?.contactName || 
                     '用户'}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <div className="space-x-2">
                <Button type="text" className="text-white" onClick={() => navigate('/auth/login')}>登录</Button>
                <Button type="primary" onClick={() => navigate('/auth/register')}>注册</Button>
              </div>
            )}
          </div>
        </div>
      </Header>

      <Content className="flex-1">
        <Routes>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="favorites" element={<Favorites />} />
        </Routes>
      </Content>

      <Footer className="text-center">
                    Casual Rent ©2025 Created by Genius of CityU
      </Footer>
    </Layout>
  );
};

export default UserLayout; 