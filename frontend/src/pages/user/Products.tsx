import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Spin, 
  Empty, 
  Select, 
  Pagination, 
  Breadcrumb,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Space
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined,
  ShoppingCartOutlined,

} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/productService';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/services/api';
import type { Product, Category } from '../../types';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Meta } = Card;
const { Option } = Select;

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, userType } = useAuthStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [activeSearchText, setActiveSearchText] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('category') ? Number(searchParams.get('category')) : null
  );
  const [sortBy, setSortBy] = useState<string>('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 立即租赁相关状态
  const [isRentModalVisible, setIsRentModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rentForm] = Form.useForm();
  const [rentLoading, setRentLoading] = useState(false);

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

  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    };
    fetchCategories();
  }, []);

  // 获取商品数据
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, currentPage, sortBy, activeSearchText]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts({
        page: currentPage,
        size: pageSize,
        categoryId: selectedCategory || undefined,
        name: activeSearchText || undefined
      });
      
      setProducts(response?.records || []);
      setTotal(response?.total || 0);
    } catch (error) {
      console.error('获取商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = () => {
    setActiveSearchText(searchText);
    setCurrentPage(1);
    
    // 更新URL参数
    const params = new URLSearchParams();
    if (searchText) params.set('search', searchText);
    if (selectedCategory) params.set('category', selectedCategory.toString());
    setSearchParams(params);
  };

  // 分类选择
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    
    // 更新URL参数
    const params = new URLSearchParams();
    if (searchText) params.set('search', searchText);
    if (categoryId) params.set('category', categoryId.toString());
    setSearchParams(params);
  };

  // 排序处理
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 商品点击
  const handleProductClick = (productId: number) => {
    navigate(`/user/products/${productId}`);
  };

  // 立即租赁
  const handleRentNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    if (!user || userType !== 'user') {
      message.warning('请先登录用户账号');
      navigate('/auth/login');
      return;
    }

    setSelectedProduct(product);
    rentForm.resetFields();
    rentForm.setFieldsValue({
      rentDays: 1,
      quantity: 1,
      startDate: dayjs().add(1, 'day')
    });
    setIsRentModalVisible(true);
  };

  // 提交租赁订单
  const handleRentSubmit = async (values: any) => {
    if (!selectedProduct || !user) return;

    const userId = getUserId();
    if (!userId) {
      message.error('未找到用户信息');
      return;
    }

    try {
      setRentLoading(true);
      
      const orderData = {
        userId: userId,
        productId: selectedProduct.id,
        days: values.rentDays,
        startDate: values.startDate.format('YYYY-MM-DD'),
        quantity: values.quantity || 1
      };

      const response = await api.post('/orders', orderData);
      
      if (response.data.code === 200) {
        message.success('订单创建成功！请及时支付');
        setIsRentModalVisible(false);
        rentForm.resetFields();
        // 跳转到订单页面
        navigate('/user/orders');
      } else {
        message.error(response.data.message || '下单失败');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      message.error('下单失败，请重试');
    } finally {
      setRentLoading(false);
    }
  };

  // 计算总价
  const calculateTotalPrice = (rentDays: number, quantity: number = 1) => {
    if (!selectedProduct || !rentDays) return 0;
    
    let unitPrice = selectedProduct.dailyPrice;
    let multiplier = rentDays;
    
    if (rentDays >= 30) {
      unitPrice = selectedProduct.monthlyPrice;
      multiplier = Math.ceil(rentDays / 30);
    } else if (rentDays >= 7) {
      unitPrice = selectedProduct.weeklyPrice;
      multiplier = Math.ceil(rentDays / 7);
    }
    
    return Number(unitPrice) * multiplier * quantity;
  };

  // 格式化价格
  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  // 处理图片数组
  const getProductImage = (images: string) => {
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

  // 获取当前分类名称
  const getCurrentCategoryName = () => {
    if (!selectedCategory) return '全部商品';
    const category = categories.find(c => c.id === selectedCategory);
    return category ? category.name : '未知分类';
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '20px 50px' }}>
        {/* 面包屑导航 */}
        <Breadcrumb style={{ marginBottom: 20 }}>
          <Breadcrumb.Item>
            <a href="/">首页</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>商品</Breadcrumb.Item>
          {selectedCategory && (
            <Breadcrumb.Item>{getCurrentCategoryName()}</Breadcrumb.Item>
          )}
        </Breadcrumb>

        {/* 筛选区域 */}
        <div style={{ 
          background: '#fff', 
          padding: 20, 
          borderRadius: 8, 
          marginBottom: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="搜索商品名称"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
              />
            </Col>
            
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="选择分类"
                value={selectedCategory}
                onChange={handleCategorySelect}
                style={{ width: '100%' }}
                allowClear
              >
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={12} sm={6} md={4}>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                style={{ width: '100%' }}
              >
                <Option value="created_desc">最新发布</Option>
                <Option value="price_asc">价格从低到高</Option>
                <Option value="price_desc">价格从高到低</Option>
                <Option value="popular">最受欢迎</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* 分类标签 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: '#666', marginRight: 10 }}>
              <FilterOutlined /> 快速筛选:
            </span>
            <Button
              type={selectedCategory === null ? 'primary' : 'default'}
              size="small"
              onClick={() => handleCategorySelect(null)}
            >
              全部
            </Button>
            {categories.slice(0, 8).map(category => (
              <Button
                key={category.id}
                type={selectedCategory === category.id ? 'primary' : 'default'}
                size="small"
                onClick={() => handleCategorySelect(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 商品列表头部信息 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 20 
        }}>
          <h2 style={{ margin: 0 }}>
            {getCurrentCategoryName()}
            <span style={{ fontSize: 14, color: '#666', marginLeft: 10 }}>
              共 {total} 件商品
            </span>
          </h2>
        </div>

        {/* 商品列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <Spin size="large" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <Empty 
              description="暂无商品"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            <Row gutter={[20, 20]}>
              {products.map(product => (
                <Col key={product.id} xs={12} sm={8} md={6} lg={6} xl={4}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={product.name}
                        src={getProductImage(product.images)}
                        style={{ height: 200, objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.src = '/images/default-product.jpg';
                        }}
                      />
                    }
                    onClick={() => handleProductClick(product.id)}
                    style={{ height: '100%' }}
                    bodyStyle={{ padding: 12 }}
                    actions={[
                      <Button 
                        type="primary" 
                        icon={<ShoppingCartOutlined />}
                        size="small"
                        onClick={(e) => handleRentNow(product, e)}
                        style={{ width: '90%' }}
                      >
                        立即租赁
                      </Button>
                    ]}
                  >
                    <Meta
                      title={
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {product.name}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ 
                            color: '#666', 
                            fontSize: 12, 
                            height: 32, 
                            overflow: 'hidden',
                            marginBottom: 8,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {product.description}
                          </div>
                          <div>
                            <div style={{ color: '#ff4d4f', fontSize: 16, fontWeight: 'bold' }}>
                              {formatPrice(product.dailyPrice)}/天
                            </div>
                            <div style={{ color: '#999', fontSize: 10 }}>
                              押金: {formatPrice(product.deposit)}
                            </div>
                            <div style={{ color: '#52c41a', fontSize: 10 }}>
                              库存: {product.stock}件
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 分页 */}
            {total > pageSize && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => 
                    `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
                  }
                />
              </div>
            )}
          </>
        )}
      </Content>

      {/* 立即租赁弹窗 */}
      <Modal
        title="立即租赁"
        open={isRentModalVisible}
        onCancel={() => setIsRentModalVisible(false)}
        onOk={() => rentForm.submit()}
        confirmLoading={rentLoading}
        width={600}
        destroyOnClose
      >
        {selectedProduct && (
          <div>
            <div style={{ marginBottom: 20, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <img 
                    src={getProductImage(selectedProduct.images)} 
                    alt={selectedProduct.name}
                    style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }}
                  />
                </Col>
                <Col span={18}>
                  <h4 style={{ margin: 0, marginBottom: 8 }}>{selectedProduct.name}</h4>
                  <Space direction="vertical" size="small">
                    <span>日租价格: <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{formatPrice(selectedProduct.dailyPrice)}/天</span></span>
                    <span>周租价格: <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{formatPrice(selectedProduct.weeklyPrice)}/周</span></span>
                    <span>月租价格: <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{formatPrice(selectedProduct.monthlyPrice)}/月</span></span>
                    <span>押金: <span style={{ color: '#666' }}>{formatPrice(selectedProduct.deposit)}</span></span>
                  </Space>
                </Col>
              </Row>
            </div>

            <Form
              form={rentForm}
              layout="vertical"
              onFinish={handleRentSubmit}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="startDate"
                    label="租赁开始日期"
                    rules={[{ required: true, message: '请选择开始日期' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      disabledDate={(current) => current && current < dayjs().add(1, 'day')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="rentDays"
                    label="租赁天数"
                    rules={[{ required: true, message: '请输入租赁天数' }]}
                  >
                    <InputNumber
                      min={1}
                      max={365}
                      style={{ width: '100%' }}
                      placeholder="租赁天数"
                      addonAfter="天"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="quantity"
                    label="租赁数量"
                    rules={[{ required: true, message: '请输入租赁数量' }]}
                  >
                    <InputNumber
                      min={1}
                      max={selectedProduct?.stock || 1}
                      style={{ width: '100%' }}
                      placeholder="租赁数量"
                      addonAfter="件"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="库存">
                    <div style={{ 
                      height: 32, 
                      lineHeight: '32px', 
                      color: selectedProduct && selectedProduct.stock > 0 ? '#52c41a' : '#ff4d4f' 
                    }}>
                      剩余 {selectedProduct?.stock || 0} 件
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item dependencies={['rentDays', 'quantity']}>
                {({ getFieldValue }) => {
                  const rentDays = getFieldValue('rentDays') || 1;
                  const quantity = getFieldValue('quantity') || 1;
                  const totalPrice = calculateTotalPrice(rentDays, quantity);
                  const deposit = Number(selectedProduct.deposit) * quantity;
                  
                  return (
                    <div style={{ 
                      padding: 16, 
                      background: '#f0f8ff', 
                      borderRadius: 8,
                      border: '1px solid #d9d9d9'
                    }}>
                      <h4 style={{ margin: 0, marginBottom: 12 }}>费用明细</h4>
                      <Row justify="space-between" style={{ marginBottom: 8 }}>
                        <span>计费方式:</span>
                        <span style={{ color: '#1890ff' }}>
                          {rentDays >= 30 ? `月租 × ${Math.ceil(rentDays / 30)}个月` :
                           rentDays >= 7 ? `周租 × ${Math.ceil(rentDays / 7)}周` :
                           `日租 × ${rentDays}天`}
                        </span>
                      </Row>
                      <Row justify="space-between" style={{ marginBottom: 8 }}>
                        <span>租赁数量:</span>
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
                        <span>{formatPrice(deposit)}</span>
                      </Row>
                      <Row justify="space-between" style={{ borderTop: '1px solid #d9d9d9', paddingTop: 8 }}>
                        <span style={{ fontWeight: 'bold' }}>总计:</span>
                        <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 16 }}>
                          {formatPrice(totalPrice + deposit)}
                        </span>
                      </Row>
                    </div>
                  );
                }}
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Products; 