import React, { useState, useEffect } from 'react';
import { 
  Layout, Card, Row, Col, Button, InputNumber, DatePicker, 
  Image, Descriptions, Divider, Spin, Alert, message, 
  Breadcrumb, Typography, Space, Tag, Form
} from 'antd';
import { 
  ShoppingCartOutlined, SafetyCertificateOutlined, 
 
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/services/api';
import type { Product } from '../../types';

const { Content } = Layout;
const { Title, Text } = Typography;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userType } = useAuthStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOrderLoading, setCreateOrderLoading] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().add(1, 'day'));
  const [rentDays, setRentDays] = useState<number>(1);
  const [quantity, setQuantity] = useState(1);
  const [form] = Form.useForm();

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
    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data.code === 200) {
        setProduct(response.data.data);
      } else {
        message.error('商品不存在');
        navigate('/user/products');
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
      message.error('获取商品详情失败');
      navigate('/user/products');
    } finally {
      setLoading(false);
    }
  };

  // 计算总价格（基于天数和数量）
  const calculateTotalPrice = () => {
    if (!product || !rentDays || !quantity) return 0;
    
    let unitPrice = product.dailyPrice;
    let multiplier = rentDays;
    
    // 根据租赁天数选择最优价格
    if (rentDays >= 30) {
      unitPrice = product.monthlyPrice;
      multiplier = Math.ceil(rentDays / 30);
    } else if (rentDays >= 7) {
      unitPrice = product.weeklyPrice;
      multiplier = Math.ceil(rentDays / 7);
    }
    
    return Number(unitPrice) * multiplier * quantity;
  };

  // 计算押金总额
  const calculateTotalDeposit = () => {
    if (!product || !quantity) return 0;
    return Number(product.deposit) * quantity;
  };

  // 处理订单创建
  const handleCreateOrder = async () => {
    // 检查用户登录状态
    if (!user || userType !== 'user') {
      message.warning('请先登录用户账号');
      navigate('/auth/login');
      return;
    }

    if (!startDate || !rentDays) {
      message.error('请选择租赁开始时间和天数');
      return;
    }

    if (!product) return;

    const userId = getUserId();
    if (!userId) {
      message.error('未找到用户信息');
      return;
    }

    setCreateOrderLoading(true);
    try {
      const orderData = {
        userId: userId,
        productId: product.id,
        days: rentDays,
        startDate: startDate.format('YYYY-MM-DD'),
        quantity: quantity
      };

      const response = await api.post('/orders', orderData);
      
      if (response.data.code === 200) {
        message.success('订单创建成功！请及时支付');
        navigate('/user/orders');
      } else {
        message.error(response.data.message || '下单失败');
      }
    } catch (error: any) {
      console.error('创建订单失败:', error);
      message.error('创建订单失败');
    } finally {
      setCreateOrderLoading(false);
    }
  };

  // 处理图片数组
  const getProductImages = (images: string): string[] => {
    try {
      let imageUrls: string[] = [];
      if (images.startsWith('[') && images.endsWith(']')) {
        imageUrls = JSON.parse(images);
      } else {
        imageUrls = images.split(',').map(url => url.trim());
      }
      return imageUrls.length > 0 ? imageUrls : ['/images/default-product.jpg'];
    } catch {
      return ['/images/default-product.jpg'];
    }
  };

  // 格式化价格
  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  // 禁用过去的日期
  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  // 获取价格策略说明
  const getPriceStrategy = () => {
    if (!product) return '';
    
    if (rentDays >= 30) {
      return `月租模式: ${formatPrice(product.monthlyPrice)}/月 × ${Math.ceil(rentDays / 30)}个月`;
    } else if (rentDays >= 7) {
      return `周租模式: ${formatPrice(product.weeklyPrice)}/周 × ${Math.ceil(rentDays / 7)}周`;
    } else {
      return `日租模式: ${formatPrice(product.dailyPrice)}/天 × ${rentDays}天`;
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Content style={{ padding: '50px' }}>
          <Alert
            message="商品不存在"
            description="该商品可能已被下架或删除"
            type="warning"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  const images = getProductImages(product.images);
  const totalPrice = calculateTotalPrice();
  const totalDeposit = calculateTotalDeposit();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '20px 50px' }}>
        {/* 面包屑导航 */}
        <Breadcrumb style={{ marginBottom: 20 }}>
          <Breadcrumb.Item>
            <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => navigate('/user')}>
              首页
            </span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => navigate('/user/products')}>
              商品
            </span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={32}>
          {/* 左侧：商品图片 */}
          <Col xs={24} md={12}>
            <Card bodyStyle={{ padding: 0 }}>
              <Image.PreviewGroup>
                {images.map((image, index) => (
                  <Image
                    key={index}
                    width="100%"
                    height={400}
                    src={image}
                    alt={`${product.name}-${index + 1}`}
                    style={{ objectFit: 'cover' }}
                    fallback="/images/default-product.jpg"
                  />
                ))}
              </Image.PreviewGroup>
            </Card>
          </Col>

          {/* 右侧：商品信息和租赁选项 */}
          <Col xs={24} md={12}>
            <Card>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* 商品基本信息 */}
                <div>
                  <Title level={2} style={{ marginBottom: 8 }}>
                    {product.name}
                  </Title>
                  <div style={{ marginBottom: 16 }}>
                    <Tag color="blue">库存: {product.stock}件</Tag>
                    <Tag color={product.status === 1 ? 'green' : 'red'}>
                      {product.status === 1 ? '可租赁' : '暂不可租'}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 16, lineHeight: 1.6 }}>
                    {product.description}
                  </Text>
                </div>

                <Divider />

                {/* 价格信息 */}
                <div>
                  <Title level={4}>租赁价格</Title>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                        <div style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>
                          {formatPrice(product.dailyPrice)}
                        </div>
                        <div style={{ color: '#666', fontSize: 14 }}>日租</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                        <div style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>
                          {formatPrice(product.weeklyPrice)}
                        </div>
                        <div style={{ color: '#666', fontSize: 14 }}>周租</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                        <div style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>
                          {formatPrice(product.monthlyPrice)}
                        </div>
                        <div style={{ color: '#666', fontSize: 14 }}>月租</div>
                      </div>
                    </Col>
                  </Row>
                  <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', borderRadius: 8, border: '1px solid #ffd591' }}>
                    <Text style={{ color: '#d46b08' }}>
                      <SafetyCertificateOutlined /> 押金: {formatPrice(product.deposit)}/件
                    </Text>
                  </div>
                </div>

                <Divider />

                {/* 租赁选项 */}
                <div>
                  <Title level={4}>租赁选项</Title>
                  <Form form={form} layout="vertical">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="开始时间">
                          <DatePicker
                            value={startDate}
                            onChange={setStartDate}
                            disabledDate={disabledDate}
                            style={{ width: '100%' }}
                            placeholder="选择开始时间"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="租赁天数">
                          <InputNumber
                            min={1}
                            max={365}
                            value={rentDays}
                            onChange={(value) => setRentDays(value || 1)}
                            style={{ width: '100%' }}
                            placeholder="租赁天数"
                            addonAfter="天"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="租赁数量">
                          <InputNumber
                            min={1}
                            max={product.stock}
                            value={quantity}
                            onChange={(value) => setQuantity(value || 1)}
                            style={{ width: '100%' }}
                            placeholder="租赁数量"
                            addonAfter="件"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="结束时间">
                          <DatePicker
                            value={startDate ? startDate.add(rentDays - 1, 'day') : null}
                            disabled
                            style={{ width: '100%' }}
                            placeholder="自动计算"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>

                <Divider />

                {/* 费用明细 */}
                <div>
                  <Title level={4}>费用明细</Title>
                  <div style={{ 
                    padding: 16, 
                    background: '#f0f8ff', 
                    borderRadius: 8,
                    border: '1px solid #d9d9d9'
                  }}>
                    <Row justify="space-between" style={{ marginBottom: 8 }}>
                      <span>计费方式:</span>
                      <span style={{ color: '#1890ff' }}>{getPriceStrategy()}</span>
                    </Row>
                    <Row justify="space-between" style={{ marginBottom: 8 }}>
                      <span>数量:</span>
                      <span>{quantity} 件</span>
                    </Row>
                    <Row justify="space-between" style={{ marginBottom: 8 }}>
                      <span>租赁费用:</span>
                      <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                        {formatPrice(totalPrice)}
                      </span>
                    </Row>
                    <Row justify="space-between" style={{ marginBottom: 8 }}>
                      <span>押金:</span>
                      <span>{formatPrice(totalDeposit)}</span>
                    </Row>
                    <Row justify="space-between" style={{ 
                      borderTop: '1px solid #d9d9d9', 
                      paddingTop: 8,
                      marginTop: 8
                    }}>
                      <span style={{ fontWeight: 'bold', fontSize: 16 }}>总计:</span>
                      <span style={{ 
                        color: '#ff4d4f', 
                        fontWeight: 'bold', 
                        fontSize: 18 
                      }}>
                        {formatPrice(totalPrice + totalDeposit)}
                      </span>
                    </Row>
                  </div>
                </div>

                {/* 租赁按钮 */}
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  loading={createOrderLoading}
                  onClick={handleCreateOrder}
                  disabled={product.status !== 1 || product.stock < quantity}
                  style={{
                    height: 50,
                    fontSize: 16,
                    background: 'linear-gradient(to right, #1890ff, #36cfc9)',
                    border: 'none'
                  }}
                  block
                >
                  立即租赁
                </Button>

                {product.stock < quantity && (
                  <Alert
                    message="库存不足"
                    description={`当前库存仅剩 ${product.stock} 件，请调整租赁数量`}
                    type="warning"
                    showIcon
                  />
                )}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 商品详细信息 */}
        <Row style={{ marginTop: 32 }}>
          <Col span={24}>
            <Card title="商品详情">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="商品名称">{product.name}</Descriptions.Item>
                <Descriptions.Item label="库存数量">{product.stock} 件</Descriptions.Item>
                <Descriptions.Item label="日租价格">{formatPrice(product.dailyPrice)}</Descriptions.Item>
                <Descriptions.Item label="周租价格">{formatPrice(product.weeklyPrice)}</Descriptions.Item>
                <Descriptions.Item label="月租价格">{formatPrice(product.monthlyPrice)}</Descriptions.Item>
                <Descriptions.Item label="押金">{formatPrice(product.deposit)}</Descriptions.Item>
                <Descriptions.Item label="商品状态">
                  <Tag color={product.status === 1 ? 'green' : 'red'}>
                    {product.status === 1 ? '可租赁' : '暂不可租'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="审核状态">
                  <Tag color={product.auditStatus === 1 ? 'green' : product.auditStatus === 0 ? 'orange' : 'red'}>
                    {product.auditStatus === 1 ? '审核通过' : product.auditStatus === 0 ? '待审核' : '审核拒绝'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="商品描述" span={2}>
                  {product.description}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ProductDetail; 