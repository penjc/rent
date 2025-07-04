import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Card, Row, Col, Spin, Empty, Typography, Space } from 'antd';
import { ShoppingOutlined, RocketOutlined, SafetyCertificateOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/productService';
import LoginModal from '../../components/common/LoginModal';
import FavoriteButton from '../../components/common/FavoriteButton';
import { showMessage } from '@/hooks/useMessage';
import type { Product, Category } from '../../types';

const { Meta } = Card;
const { Title, Text } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  
  // 用户认证相关状态
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
        setIsComponentMounted(true); // 标记组件已完成初始化
      } catch (error) {
        console.error('获取分类失败:', error);
        setIsComponentMounted(true); // 即使出错也标记为已初始化
      }
    };
    fetchCategories();
  }, []);

  // 防止重复请求的标志
  const fetchingRef = useRef(false);

  // 商品去重工具函数
  const deduplicateProducts = (products: Product[]) => {
    const seen = new Set();
    return products.filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  };

  // 首次加载商品
  const fetchProducts = useCallback(async (page = 1, isLoadMore = false) => {
    // 防止重复请求
    if (!isLoadMore && fetchingRef.current) {
      return;
    }
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      fetchingRef.current = true;
    }
    
    try {
      const response = await getProducts({
        page,
        size: 12,
        categoryId: selectedCategory || undefined,
        name: searchText || undefined
      });
      
      const newProducts = response?.records || [];
      const newTotal = response?.total || 0;
      
      if (isLoadMore) {
        // 加载更多时追加到现有商品列表
        setProducts(prev => {
          // 合并新旧商品并根据ID去重
          const allProducts = [...prev, ...newProducts];
          const uniqueProducts = deduplicateProducts(allProducts);
          // 使用去重后的产品列表长度来检查是否还有更多数据
          setHasMoreData(uniqueProducts.length < newTotal);
          return uniqueProducts;
        });
      } else {
        // 首次加载或筛选时替换商品列表，同时去重
        const uniqueProducts = deduplicateProducts(newProducts);
        setProducts(uniqueProducts);
        setHasMoreData(uniqueProducts.length < newTotal);
      }
      
      setTotal(newTotal);
      
    } catch (error) {
      console.error('获取商品失败:', error);
      showMessage.error('获取商品失败');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      if (!isLoadMore) {
        fetchingRef.current = false;
      }
    }
  }, [selectedCategory, searchText]);

  // 加载更多商品
  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMoreData) return;
    
    const nextPage = Math.floor(products.length / 12) + 1;
    fetchProducts(nextPage, true);
  }, [loadingMore, hasMoreData, products.length, fetchProducts]);

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
    // 只有在组件完全初始化后才执行请求
    if (!isComponentMounted) return;
    
    // 添加延迟以避免快速连续的状态更新
    const timer = setTimeout(() => {
      setProducts([]); // 清空现有商品列表
      setHasMoreData(true);
      fetchProducts(1, false);
    }, 50); // 50ms延迟

    return () => clearTimeout(timer);
  }, [selectedCategory, searchText, isComponentMounted]);

  // 分类选择
  const handleCategorySelect = (categoryId: number | null) => {
    // 只有当分类真正改变时才更新
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
      setSearchText(''); // 选择分类时清除搜索关键词
      
      // 添加用户反馈
      // if (categoryId === null) {
      //   showMessage.info('已切换到全部商品');
      // } else {
      //   const categoryName = categories.find(c => c.id === categoryId)?.name;
      //   showMessage.info(`已切换到${categoryName}分类`);
      // }
    }
  };

  // 商品点击
  const handleProductClick = (productId: number) => {
    navigate(`/user/products/${productId}`);
  };

  // 登录成功处理
  const handleLoginSuccess = () => {
    showMessage.success('登录成功');
  };

  // 获取当前用户ID
  const getCurrentUserId = (): number => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    return 0;
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

  // 截断描述文本 - 首页卡片截断长度适中
  const truncateDescription = (text: string, maxLength: number = 45) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero 区域 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.1) 100%)',
        padding: '80px 50px',
        textAlign: 'center',
        color: '#1f2937',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)'
      }}>
        <Title level={1} style={{ color: '#1f2937', fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          Casual Rent
        </Title>
        <Text style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '2rem', display: 'block' }}>
          让闲置物品重新焕发价值，让生活更加便捷美好
        </Text>
        <Space size="large" style={{ marginTop: '2rem' }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<ShoppingOutlined />}
            style={{ 
              height: '50px', 
              padding: '0 30px', 
              fontSize: '16px',
              borderRadius: '25px',
              background: '#3b82f6',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            onClick={() => navigate('/user/products')}
          >
            开始租赁
          </Button>
          <Button 
            size="large" 
            style={{ 
              height: '50px', 
              padding: '0 30px', 
              fontSize: '16px',
              borderRadius: '25px',
              background: 'white',
              border: '2px solid #e5e7eb',
              color: '#374151'
            }}
            onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
          >
            了解更多
          </Button>
          {/*<Button */}
          {/*  size="large" */}
          {/*  style={{ */}
          {/*    height: '50px', */}
          {/*    padding: '0 30px', */}
          {/*    fontSize: '16px',*/}
          {/*    borderRadius: '25px',*/}
          {/*    background: 'rgba(255,255,255,0.1)',*/}
          {/*    border: '2px solid rgba(255,255,255,0.4)',*/}
          {/*    color: 'white'*/}
          {/*  }}*/}
          {/*  onClick={() => navigate('/user/message-demo')}*/}
          {/*>*/}
          {/*  消息演示*/}
          {/*</Button>*/}
        </Space>
      </div>

      {/* 特色功能区域 */}
      <div style={{ background: 'white', padding: '60px 50px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '3rem', color: '#1f2937' }}>
            为什么选择我们？
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card 
                hoverable
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  borderRadius: '15px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
                bodyStyle={{ padding: '40px 20px' }}
              >
                <RocketOutlined style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '1rem' }} />
                <Title level={4} style={{ color: '#1f2937' }}>快速便捷</Title>
                <Text style={{ color: '#6b7280' }}>
                  一键下单，快速租赁，让您的生活更加便捷高效
                </Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                hoverable
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  borderRadius: '15px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
                bodyStyle={{ padding: '40px 20px' }}
              >
                <SafetyCertificateOutlined style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '1rem' }} />
                <Title level={4} style={{ color: '#1f2937' }}>安全保障</Title>
                <Text style={{ color: '#6b7280' }}>
                  专业的审核机制，确保每件商品的品质和安全
                </Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                hoverable
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  borderRadius: '15px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
                bodyStyle={{ padding: '40px 20px' }}
              >
                <CustomerServiceOutlined style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '1rem' }} />
                <Title level={4} style={{ color: '#1f2937' }}>贴心服务</Title>
                <Text style={{ color: '#6b7280' }}>
                  用户和商家之间的直接沟通，提供更好的服务体验
                </Text>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* 商品分类和列表区域 */}
      <div style={{ background: '#f8fafc', padding: '60px 50px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* 分类导航 */}
          <div style={{ marginBottom: 40 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>
              商品分类
            </Title>
            <div style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              justifyContent: 'center',
              padding: '20px',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              border: '1px solid #f3f4f6'
            }}>
              <Button
                type={selectedCategory === null ? 'primary' : 'default'}
                size="large"
                onClick={() => handleCategorySelect(null)}
                style={{
                  borderRadius: '25px',
                  padding: '0 30px',
                  height: '45px',
                  fontWeight: selectedCategory === null ? '500' : 'normal',
                  background: selectedCategory === null ? '#3b82f6' : 'white',
                  border: selectedCategory === null ? 'none' : '1px solid #e5e7eb',
                  color: selectedCategory === null ? 'white' : '#374151',
                  boxShadow: selectedCategory === null ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none'
                }}
              >
                全部商品
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  type={selectedCategory === category.id ? 'primary' : 'default'}
                  size="large"
                  onClick={() => handleCategorySelect(category.id)}
                  style={{
                    borderRadius: '25px',
                    padding: '0 30px',
                    height: '45px',
                    fontWeight: selectedCategory === category.id ? '500' : 'normal',
                    background: selectedCategory === category.id ? '#3b82f6' : 'white',
                    border: selectedCategory === category.id ? 'none' : '1px solid #e5e7eb',
                    color: selectedCategory === category.id ? 'white' : '#374151',
                    boxShadow: selectedCategory === category.id ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none'
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 商品列表 */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 30
            }}>
              <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                {selectedCategory 
                  ? `${categories.find(c => c.id === selectedCategory)?.name || ''}分类商品` 
                  : '精选商品'
                }
              </Title>
              <div style={{ 
                fontSize: 14, 
                color: '#3b82f6',
                background: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontWeight: '500',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                border: '1px solid #f3f4f6'
              }}>
                共 {total} 件商品
              </div>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <Spin size="large" tip="正在加载精彩商品..." />
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <Empty 
                  description={
                    selectedCategory 
                      ? `该分类暂无商品，试试其他分类吧` 
                      : '暂无商品'
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  {selectedCategory ? (
                    <Button type="primary" onClick={() => handleCategorySelect(null)}>
                      查看全部商品
                    </Button>
                  ) : (
                    <Button type="primary" onClick={() => window.location.reload()}>
                      刷新页面
                    </Button>
                  )}
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
                            {/* 收藏按钮 */}
                            {getCurrentUserId() > 0 && (
                              <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '50%',
                                padding: '8px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}>
                                <FavoriteButton
                                  userId={getCurrentUserId()}
                                  productId={product.id}
                                  size="small"
                                />
                              </div>
                            )}
                          </div>
                        }
                        onClick={() => handleProductClick(product.id)}
                        style={{
                          borderRadius: '15px',
                          overflow: 'hidden',
                          border: '1px solid #f3f4f6',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.3s ease'
                        }}
                        bodyStyle={{ padding: '20px' }}
                      >
                        <Meta
                          title={
                            <div style={{ 
                              fontSize: 16, 
                              fontWeight: '600',
                              color: '#1f2937',
                              marginBottom: '8px',
                              lineHeight: '1.4',
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
                                color: '#6b7280', 
                                fontSize: 13, 
                                minHeight: 42,
                                maxHeight: 42,
                                overflow: 'hidden',
                                marginBottom: 12,
                                lineHeight: '1.4',
                                wordBreak: 'break-word'
                              }}>
                                {truncateDescription(product.description, 42)}
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                background: '#f8fafc',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #f1f5f9'
                              }}>
                                <div style={{ flex: 1, marginRight: '12px' }}>
                                  <div style={{ 
                                    color: '#dc2626', 
                                    fontSize: 18, 
                                    fontWeight: '600',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {formatPrice(product.dailyPrice)}/天
                                  </div>
                                  <div style={{ 
                                    color: '#9ca3af', 
                                    fontSize: 11,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    押金: {formatPrice(product.deposit)}
                                  </div>
                                </div>
                                <Button 
                                  type="primary" 
                                  size="small"
                                  style={{
                                    borderRadius: '15px',
                                    background: '#3b82f6',
                                    border: 'none',
                                    padding: '4px 16px',
                                    flexShrink: 0,
                                    minWidth: '80px',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                  }}
                                >
                                  查看详情
                                </Button>
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
                  <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <Spin tip="正在加载更多商品..." />
                  </div>
                )}
                
                {/* 没有更多数据提示 */}
                {!hasMoreData && products.length > 0 && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '30px 0',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    已加载全部商品
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 登录注册模态框 */}
      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Home; 