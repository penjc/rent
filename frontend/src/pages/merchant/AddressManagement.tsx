import React from 'react';
import { Card, Typography, Button } from 'antd';
import { ShopOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';

const { Title, Text } = Typography;

const MerchantAddressManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  console.log('MerchantAddressManagement 渲染开始', { isAuthenticated, userId: user?.id });

  // 如果用户未登录，显示提示信息
  if (!isAuthenticated) {
    console.log('商家未登录，显示登录提示');
    return (
      <div style={{ padding: '24px', backgroundColor: '#f0f0f0', minHeight: '500px' }}>
        <Card style={{ backgroundColor: '#ffffff' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={4}>请先登录</Title>
            <Text type="secondary">您需要登录后才能管理收货地址</Text>
          </div>
        </Card>
      </div>
    );
  }

  // 如果用户已登录但没有用户信息，显示加载状态
  if (isAuthenticated && !user) {
    console.log('商家已登录但用户信息未加载');
    return (
      <div style={{ padding: '24px', backgroundColor: '#f0f0f0', minHeight: '500px' }}>
        <Card style={{ backgroundColor: '#ffffff' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={4}>加载中...</Title>
            <Text type="secondary">正在获取商家信息</Text>
          </div>
        </Card>
      </div>
    );
  }

  console.log('商家端地址管理页面即将渲染主界面');

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f0f0', minHeight: '500px' }}>
      <Card style={{ backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0 }}>
            <ShopOutlined style={{ marginRight: '8px' }} />
            收货地址管理
          </Title>
          <Button type="primary" icon={<PlusOutlined />}>
            添加地址
          </Button>
        </div>

        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Text>商家地址管理功能正在加载中...</Text>
          <br />
          <Text type="secondary">商家ID: {user?.id}</Text>
          <br />
          <Text type="secondary">认证状态: {isAuthenticated ? '已登录' : '未登录'}</Text>
        </div>
      </Card>
    </div>
  );
};

export default MerchantAddressManagement; 