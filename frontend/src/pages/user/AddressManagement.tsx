import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, List, Tag, Space, Spin } from 'antd';
import { PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import { userAddressApi } from '@/services/addressApi';
import type { Address } from '@/types';

const { Title, Text } = Typography;

const AddressManagement: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  console.log('AddressManagement 渲染开始', { isAuthenticated, userId: user?.id });

  // 获取地址列表
  const fetchAddresses = async () => {
    if (!user?.id) {
      console.log('fetchAddresses: 用户ID不存在');
      return;
    }
    
    console.log('fetchAddresses: 开始获取地址列表, userId:', user.id);
    setLoading(true);
    try {
      const response = await userAddressApi.getUserAddresses(user.id);
      console.log('fetchAddresses: API响应:', response);
      console.log('fetchAddresses: response.data:', response.data);
      
      // API拦截器返回完整response，实际数据在response.data.data中
      // 使用类型断言处理响应结构
      const apiResponse = response.data as any;
      console.log('fetchAddresses: apiResponse.data:', apiResponse.data);
      console.log('fetchAddresses: apiResponse.data类型:', typeof apiResponse.data, 'Array.isArray:', Array.isArray(apiResponse.data));
      
      const addressList = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      setAddresses(addressList);
      console.log('fetchAddresses: 设置地址列表完成, 数量:', addressList.length);
    } catch (error) {
      console.error('获取地址列表失败:', error);
      setAddresses([]); // 出错时设置为空数组
    } finally {
      setLoading(false);
      console.log('fetchAddresses: 完成');
    }
  };

  // 获取完整地址
  const getFullAddress = (address: Address) => {
    if (!address) return '地址信息不完整';
    const province = address.province || '';
    const city = address.city || '';
    const district = address.district || '';
    const detailAddress = address.detailAddress || '';
    return `${province}${city}${district}${detailAddress}` || '地址信息不完整';
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchAddresses();
    }
  }, [isAuthenticated, user]);

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

        <Spin spinning={loading}>
          {Array.isArray(addresses) ? (
            <List
              dataSource={addresses}
              locale={{ emptyText: '暂无收货地址，请添加' }}
              renderItem={(address) => {
                // 确保address对象存在且有必要的属性
                if (!address || typeof address !== 'object') {
                  return null;
                }
                
                return (
                  <List.Item
                    style={{ 
                      padding: '16px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{address.contactName || '未知联系人'}</Text>
                          <Text type="secondary">{address.contactPhone || '未知电话'}</Text>
                          {address.isDefault === 1 && (
                            <Tag color="blue">默认地址</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <div style={{ marginTop: '8px' }}>
                          <Text>{getFullAddress(address)}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">地址数据格式错误</Text>
            </div>
          )}
        </Spin>

        {/* 调试信息 */}
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <Text type="secondary">调试信息：</Text>
          <br />
          <Text type="secondary">用户ID: {user?.id}</Text>
          <br />
          <Text type="secondary">认证状态: {isAuthenticated ? '已登录' : '未登录'}</Text>
          <br />
          <Text type="secondary">地址数量: {addresses.length}</Text>
          <br />
          <Text type="secondary">加载状态: {loading ? '加载中' : '已完成'}</Text>
        </div>
      </Card>
    </div>
  );
};

export default AddressManagement; 