import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Tag, Typography, 
  Spin, Empty, Modal, Descriptions, Image, Pagination, Popconfirm
} from 'antd';
import { 
  PayCircleOutlined, TruckOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, 
  SendOutlined, InboxOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/useAuthStore';
import { showMessage } from '@/hooks/useMessage';
import api from '@/services/api';
import type { Order } from '../../types';

const { Title, Text } = Typography;

// 订单状态映射
const ORDER_STATUS_MAP = {
  1: { text: '待支付', color: 'orange', icon: <PayCircleOutlined /> },
  2: { text: '已支付', color: 'blue', icon: <CheckCircleOutlined /> },
  3: { text: '商家发货中', color: 'cyan', icon: <TruckOutlined /> },
  4: { text: '使用中', color: 'processing', icon: <InboxOutlined /> },
  5: { text: '用户返还中', color: 'purple', icon: <SendOutlined /> },
  6: { text: '已完成', color: 'green', icon: <CheckCircleOutlined /> },
  7: { text: '已取消', color: 'red', icon: <CloseCircleOutlined /> }
};

// 租赁类型映射
const RENT_TYPE_MAP = {
  1: '按天',
  2: '按周', 
  3: '按月'
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailVisible, setOrderDetailVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  const pageSize = 10;

  // 获取当前用户ID
  const getUserId = () => {
    if (userType === 'user' && user) {
      return (user as any).id;
    }
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      return JSON.parse(userInfo).id;
    }
    return null;
  };

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      showMessage.warning('请先登录用户账号');
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    const userId = getUserId();
    if (!userId) return;

    setLoading(true);
    try {
      const response = await api.get(`/orders/user/${userId}?page=${currentPage}&size=${pageSize}`);
      if (response.data.code === 200) {
        setOrders(response.data.data.records || []);
        setTotal(response.data.data.total || 0);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      showMessage.error('获取订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 支付订单
  const handlePayOrder = async (orderId: number) => {
    const userId = getUserId();
    if (!userId) return;

    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await api.post(`/orders/${orderId}/pay`, { userId });
      if (response.data.code === 200) {
        showMessage.success('支付成功');
        fetchOrders(); // 重新获取订单列表
      } else {
        showMessage.error(response.data.message || '支付失败');
      }
    } catch (error: any) {
      console.error('支付失败:', error);
      showMessage.error('支付失败');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // 取消订单
  const handleCancelOrder = async (orderId: number) => {
    const userId = getUserId();
    if (!userId) return;

    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await api.put(`/orders/${orderId}/cancel?userId=${userId}`);
      if (response.data.code === 200) {
        showMessage.success('订单已取消');
        fetchOrders();
      } else {
        showMessage.error(response.data.message || '取消订单失败');
      }
    } catch (error: any) {
      console.error('取消订单失败:', error);
      showMessage.error('取消订单失败');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // 确认收货
  const handleConfirmReceive = async (orderId: number) => {
    const userId = getUserId();
    if (!userId) return;

    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await api.put(`/orders/${orderId}/receive`, { userId });
      if (response.data.code === 200) {
        showMessage.success('确认收货成功');
        fetchOrders();
      } else {
        showMessage.error(response.data.message || '确认收货失败');
      }
    } catch (error: any) {
      console.error('确认收货失败:', error);
      showMessage.error('确认收货失败');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // 申请返还
  const handleReturnOrder = async (orderId: number) => {
    const userId = getUserId();
    if (!userId) return;

    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await api.put(`/orders/${orderId}/return`, { userId });
      if (response.data.code === 200) {
        showMessage.success('申请返还成功');
        fetchOrders();
      } else {
        showMessage.error(response.data.message || '申请返还失败');
      }
    } catch (error: any) {
      console.error('申请返还失败:', error);
      showMessage.error('申请返还失败');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // 查看订单详情
  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailVisible(true);
  };

  // 格式化价格
  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  // 处理图片
  const getProductImage = (images?: string) => {
    if (!images) return '/images/default-product.jpg';
    try {
      let imageUrls: string[] = [];
      if (images.startsWith('[') && images.endsWith(']')) {
        imageUrls = JSON.parse(images);
      } else {
        imageUrls = images.split(',').map(url => url.trim());
      }
      return imageUrls.length > 0 ? imageUrls[0] : '/images/default-product.jpg';
    } catch {
      return '/images/default-product.jpg';
    }
  };

  // 获取订单操作按钮
  const getOrderActions = (order: Order) => {
    const actions = [];
    const isLoading = actionLoading[order.id];

    switch (order.status) {
      case 1: // 待支付
        actions.push(
          <Button 
            key="pay" 
            type="primary" 
            size="small"
            loading={isLoading}
            onClick={() => handlePayOrder(order.id)}
          >
            立即支付
          </Button>
        );
        actions.push(
          <Popconfirm
            key="cancel"
            title="确定要取消这个订单吗？"
            onConfirm={() => handleCancelOrder(order.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              size="small" 
              loading={isLoading}
            >
              取消订单
            </Button>
          </Popconfirm>
        );
        break;
      case 3: // 商家发货中 - 可以确认收货
        actions.push(
          <Button 
            key="receive" 
            type="primary" 
            size="small"
            loading={isLoading}
            onClick={() => handleConfirmReceive(order.id)}
          >
            确认收货
          </Button>
        );
        break;
      case 4: // 使用中 - 可以申请返还
        actions.push(
          <Button 
            key="return" 
            type="primary" 
            size="small"
            loading={isLoading}
            onClick={() => handleReturnOrder(order.id)}
          >
            申请返还
          </Button>
        );
        break;
    }

    actions.push(
      <Button
        key="detail"
        size="small"
        onClick={() => handleViewOrderDetail(order)}
      >
        查看详情
      </Button>
    );
    actions.push(
      <Button
        key="chat"
        size="small"
        onClick={() => {
          if (!isAuthenticated) {
            navigate('/auth/login?type=user');
            return;
          }
          navigate(`/user/chat?merchantId=${order.merchantId}`);
        }}
      >
        联系商家
      </Button>
    );

    return actions;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">我的订单</Title>
      
      {orders.length === 0 ? (
        <Card>
          <Empty 
            description="暂无订单"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {orders.map((order) => (
              <Col xs={24} lg={12} xl={8} key={order.id}>
                <Card
                  className="order-card h-full"
                  bodyStyle={{ padding: '16px' }}
                  actions={getOrderActions(order)}
                >
                  <div className="flex mb-3">
                    <div className="flex-1">
                      <Text strong className="text-base">{order.productName}</Text>
                      <div className="mt-1">
                        <Text className="text-gray-500 font-mono text-sm">
                          订单号: {order.orderNo}
                        </Text>
                      </div>
                    </div>
                    <Tag 
                      color={ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP]?.color}
                      icon={ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP]?.icon}
                    >
                      {ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP]?.text}
                    </Tag>
                  </div>

                  <div className="flex items-center mb-3">
                    <Image
                      src={getProductImage(order.productImage)}
                      alt={order.productName}
                      width={60}
                      height={60}
                      className="rounded mr-3"
                      fallback="/images/default-product.jpg"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">
                        租期: {order.rentDays}天 ({RENT_TYPE_MAP[order.rentType as keyof typeof RENT_TYPE_MAP]})
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {dayjs(order.startDate).format('YYYY-MM-DD')} 至 {dayjs(order.endDate).format('YYYY-MM-DD')}
                      </div>
                      <div className="text-lg font-semibold text-red-600">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    下单时间: {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {total > pageSize && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
              />
            </div>
          )}
        </>
      )}

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={orderDetailVisible}
        onCancel={() => setOrderDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setOrderDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedOrder && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="订单编号" span={2}>
              <Text className="font-mono">{selectedOrder.orderNo}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="商品名称">
              {selectedOrder.productName}
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag 
                color={ORDER_STATUS_MAP[selectedOrder.status as keyof typeof ORDER_STATUS_MAP]?.color}
                icon={ORDER_STATUS_MAP[selectedOrder.status as keyof typeof ORDER_STATUS_MAP]?.icon}
              >
                {ORDER_STATUS_MAP[selectedOrder.status as keyof typeof ORDER_STATUS_MAP]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="租赁天数">
              {selectedOrder.rentDays}天
            </Descriptions.Item>
            <Descriptions.Item label="租赁方式">
              {RENT_TYPE_MAP[selectedOrder.rentType as keyof typeof RENT_TYPE_MAP]}
            </Descriptions.Item>
            <Descriptions.Item label="单价">
              {formatPrice(selectedOrder.unitPrice)}
            </Descriptions.Item>
            <Descriptions.Item label="押金">
              {formatPrice(selectedOrder.deposit)}
            </Descriptions.Item>
            <Descriptions.Item label="总金额">
              <Text className="text-red-600 font-semibold text-lg">
                {formatPrice(selectedOrder.totalAmount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="租赁开始">
              {dayjs(selectedOrder.startDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="租赁结束">
              {dayjs(selectedOrder.endDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="下单时间">
              {dayjs(selectedOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            {selectedOrder.shippedAt && (
              <Descriptions.Item label="发货时间">
                {dayjs(selectedOrder.shippedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
            {selectedOrder.returnedAt && (
              <Descriptions.Item label="归还时间">
                {dayjs(selectedOrder.returnedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
            {selectedOrder.remark && (
              <Descriptions.Item label="备注" span={2}>
                {selectedOrder.remark}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Orders; 