import React from 'react';
import { Card, Button, Typography } from 'antd';
import { PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';

const { Title, Text } = Typography;

const AddressManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  console.log('AddressManagement 渲染开始', { isAuthenticated, userId: user?.id });

  // 如果用户未登录，显示提示信息
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
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
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={4}>加载中...</Title>
            <Text type="secondary">正在获取用户信息</Text>
          </div>
        </Card>
      </div>
    );
  }

  console.log('用户端地址管理页面即将渲染主界面');

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f0f0', minHeight: '500px' }}>
      <Card style={{ backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0 }}>
            <HomeOutlined style={{ marginRight: '8px' }} />
            收货地址管理
          </Title>
          <Button type="primary" icon={<PlusOutlined />}>
            添加地址
          </Button>
        </div>

        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Text>地址管理功能正在加载中...</Text>
          <br />
          <Text type="secondary">用户ID: {user?.id}</Text>
          <br />
          <Text type="secondary">认证状态: {isAuthenticated ? '已登录' : '未登录'}</Text>
        </div>
      </Card>
    </div>
  );
};

export default AddressManagement; 