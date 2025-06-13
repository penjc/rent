import React, { useState, useEffect, useCallback } from 'react';
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
  Breadcrumb,
  Modal,
  Form,
  DatePicker,
  InputNumber,
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
import { showMessage } from '@/hooks/useMessage';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [activeSearchText, setActiveSearchText] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('category') ? Number(searchParams.get('category')) : null
  );
  const [sortBy, setSortBy] = useState<string>('created_desc');
  const [total, setTotal] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
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

  // 首次加载商品
  const fetchProducts = async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await getProducts({
        page,
        size: pageSize,
        categoryId: selectedCategory || undefined,
        name: activeSearchText || undefined,
        sortBy: sortBy || undefined
      });
      
      const newProducts = response?.records || [];
      const newTotal = response?.total || 0;
      
      if (isLoadMore) {
        // 加载更多时追加到现有商品列表
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        // 首次加载或筛选时替换商品列表
        setProducts(newProducts);
      }
      
      setTotal(newTotal);
      
      // 检查是否还有更多数据
      const totalLoaded = isLoadMore ? products.length + newProducts.length : newProducts.length;
      setHasMoreData(totalLoaded < newTotal);
      
    } catch (error) {
      console.error('获取商品失败:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 加载更多商品
  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMoreData) return;
    
    const nextPage = Math.floor(products.length / pageSize) + 1;
    fetchProducts(nextPage, true);
  }, [loadingMore, hasMoreData, products.length, selectedCategory, activeSearchText, sortBy]);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      // 检查是否滚动到页面底部
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.offsetHeight;
      
      // 当滚动到距离底部100px时开始加载更多
      if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreProducts();
      }
    };

    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll);
    
    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadMoreProducts]);

  // 获取商品数据
  useEffect(() => {
    setProducts([]); // 清空现有商品列表
    setHasMoreData(true);
    fetchProducts(1, false);
  }, [selectedCategory, sortBy, activeSearchText]);

  // 搜索处理
  const handleSearch = () => {
    setActiveSearchText(searchText);
    
    // 更新URL参数
    const params = new URLSearchParams();
    if (searchText) params.set('search', searchText);
    if (selectedCategory) params.set('category', selectedCategory.toString());
    setSearchParams(params);
  };

  // 分类选择
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    
    // 更新URL参数
    const params = new URLSearchParams();
    if (searchText) params.set('search', searchText);
    if (categoryId) params.set('category', categoryId.toString());
    setSearchParams(params);
  };

  // 排序处理
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };



  // 商品点击
  const handleProductClick = (productId: number) => {
    navigate(`/user/products/${productId}`);
  };

  // 立即租赁
  const handleRentNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    if (!user || userType !== 'user') {
      showMessage.warning('请先登录用户账号');
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
      showMessage.error('未找到用户信息');
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
        showMessage.success('订单创建成功！请及时支付');
        setIsRentModalVisible(false);
        rentForm.resetFields();
        // 跳转到订单页面
        navigate('/user/orders');
      } else {
        showMessage.error(response.data.message || '下单失败');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      showMessage.error('下单失败，请重试');
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

  // 截断描述文本 - 商品页卡片较宽，可以显示更多文字
  const truncateDescription = (text: string, maxLength: number = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <a href="/" style={{ color: '#667eea', textDecoration: 'none' }}>首页</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>商品</Breadcrumb.Item>
          {selectedCategory && (
            <Breadcrumb.Item>{getCurrentCategoryName()}</Breadcrumb.Item>
          )}
        </Breadcrumb>

        {/* 筛选区域 */}
        <div style={{ 
          background: 'white', 
          padding: '32px', 
          borderRadius: '16px', 
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={12} md={10}>
              <div style={{ position: 'relative' }}>
                <Input.Search
                  placeholder="搜索您想要的商品..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  enterButton={
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '0 8px 8px 0'
                      }}
                    >
                      搜索
                    </Button>
                  }
                  size="large"
                />
              </div>
            </Col>
            
            <Col xs={12} sm={6} md={6}>
              <Select
                placeholder="选择分类"
                value={selectedCategory}
                onChange={handleCategorySelect}
                style={{ width: '100%' }}
                size="large"
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#667eea' }} />}
              >
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={12} sm={6} md={6}>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                style={{ width: '100%' }}
                size="large"
              >
                <Option value="created_desc">🕒 最新发布</Option>
                <Option value="price_asc">💰 价格从低到高</Option>
                <Option value="price_desc">💎 价格从高到低</Option>
                <Option value="popular">🔥 最受欢迎</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* 分类标签 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            flexWrap: 'wrap', 
            alignItems: 'center',
            padding: '24px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <span style={{ 
              color: '#2c3e50', 
              marginRight: 16, 
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FilterOutlined style={{ color: '#667eea' }} /> 快速筛选:
            </span>
            <Button
              type={selectedCategory === null ? 'primary' : 'default'}
              size="large"
              onClick={() => handleCategorySelect(null)}
              style={{
                borderRadius: '20px',
                fontWeight: selectedCategory === null ? 'bold' : 'normal',
                background: selectedCategory === null ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                border: selectedCategory === null ? 'none' : '2px solid #f0f0f0',
                color: selectedCategory === null ? 'white' : '#2c3e50',
                boxShadow: selectedCategory === null ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
                padding: '0 24px',
                height: '42px',
                transition: 'all 0.3s ease'
              }}
            >
              全部
            </Button>
            {categories.slice(0, 8).map(category => (
              <Button
                key={category.id}
                type={selectedCategory === category.id ? 'primary' : 'default'}
                size="large"
                onClick={() => handleCategorySelect(category.id)}
                style={{
                  borderRadius: '20px',
                  fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                  background: selectedCategory === category.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  border: selectedCategory === category.id ? 'none' : '2px solid #f0f0f0',
                  color: selectedCategory === category.id ? 'white' : '#2c3e50',
                  boxShadow: selectedCategory === category.id ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
                  padding: '0 24px',
                  height: '42px',
                  transition: 'all 0.3s ease'
                }}
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
          marginBottom: 32,
          padding: '0 8px'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#2c3e50',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            {getCurrentCategoryName()}
            {activeSearchText && (
              <span style={{ color: '#667eea', fontSize: '20px', marginLeft: 12 }}>
                - "{activeSearchText}"
              </span>
            )}
          </h2>
          <div style={{ 
            fontSize: 16, 
            color: '#667eea',
            background: 'white',
            padding: '12px 24px',
            borderRadius: '20px',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid rgba(102, 126, 234, 0.1)'
          }}>
            共 {total} 件商品
          </div>
        </div>

        {/* 商品列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <Spin size="large" tip="正在搜索精彩商品..." />
          </div>
        ) : products.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 100,
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <Empty 
              description={
                <div style={{ color: '#7f8c8d', fontSize: '16px' }}>
                  {activeSearchText ? `没有找到包含"${activeSearchText}"的商品` : '暂无商品'}
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '0 30px',
                  height: '45px'
                }}
                onClick={() => {
                  setActiveSearchText('');
                  setSearchText('');
                  setSelectedCategory(null);
                }}
              >
                重新搜索
              </Button>
            </Empty>
          </div>
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {products.map(product => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <img
                          alt={product.name}
                          src={getProductImage(product.images)}
                          style={{ 
                            height: 220, 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            width: '100%'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/images/default-product.jpg';
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                          height: '40px'
                        }} />
                      </div>
                    }
                    onClick={() => handleProductClick(product.id)}
                    actions={[
                      <Button 
                        type="primary" 
                        icon={<ShoppingCartOutlined />}
                        size="middle"
                        onClick={(e) => handleRentNow(product, e)}
                        style={{ 
                          width: '90%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                      >
                        立即租赁
                      </Button>
                    ]}
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: 'none',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      background: 'white'
                    }}
                    bodyStyle={{ padding: '20px' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    }}
                  >
                    <Meta
                      title={
                        <div style={{ 
                          fontSize: 16, 
                          fontWeight: 'bold',
                          color: '#2c3e50',
                          marginBottom: '8px',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical' as any,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {product.name}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ 
                            color: '#7f8c8d', 
                            fontSize: 13, 
                            minHeight: 40,
                            maxHeight: 40,
                            overflow: 'hidden',
                            marginBottom: 12,
                            lineHeight: '1.4',
                            wordBreak: 'break-word'
                          }}>
                            {truncateDescription(product.description, 60)}
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(102, 126, 234, 0.1)'
                          }}>
                            <div>
                              <div style={{ color: '#e74c3c', fontSize: 18, fontWeight: 'bold' }}>
                                {formatPrice(product.dailyPrice)}/天
                              </div>
                              <div style={{ color: '#95a5a6', fontSize: 11 }}>
                                押金: {formatPrice(product.deposit)}
                              </div>
                            </div>
                            <div style={{
                              background: product.stock > 10 ? '#27ae60' : product.stock > 0 ? '#f39c12' : '#e74c3c',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}>
                              {product.stock > 10 ? '充足' : product.stock > 0 ? '紧缺' : '缺货'}
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 加载更多状态指示器 */}
            {loadingMore && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 0',
                background: 'white',
                borderRadius: '16px',
                marginTop: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <Spin size="large" tip="正在加载更多精彩商品..." />
              </div>
            )}
            
            {/* 没有更多数据提示 */}
            {!hasMoreData && products.length > 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 0',
                color: '#95a5a6',
                fontSize: '16px',
                background: 'white',
                borderRadius: '16px',
                marginTop: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                🎉 已展示全部商品，感谢您的浏览！
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