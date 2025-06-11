import React, { useState, useEffect, useCallback } from 'react';
// import { Button, Card, Row, Col, Carousel, Spin, Empty, message } from 'antd';
import { Button, Card, Row, Col, Spin, Empty, message } from 'antd';

import { useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/productService';

import LoginModal from '../../components/common/LoginModal';
import type { Product, Category } from '../../types';


const { Meta } = Card;

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
  
  // 用户认证相关状态
  const [loginModalVisible, setLoginModalVisible] = useState(false);



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
  const fetchProducts = useCallback(async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
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
      message.error('获取商品失败');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, searchText, products.length]);

  // 加载更多商品
  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMoreData) return;
    
    const nextPage = Math.floor(products.length / 12) + 1;
    fetchProducts(nextPage, true);
  }, [fetchProducts, loadingMore, hasMoreData, products.length]);

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
  }, [selectedCategory, searchText]);



  // 分类选择
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchText(''); // 选择分类时清除搜索关键词
    
    // 添加用户反馈
    if (categoryId === null) {
      message.info('已切换到全部商品');
    } else {
      const categoryName = categories.find(c => c.id === categoryId)?.name;
      message.info(`已切换到${categoryName}分类`);
    }
  };

  // 商品点击
  const handleProductClick = (productId: number) => {
    navigate(`/user/products/${productId}`);
  };

  // 登录成功处理
  const handleLoginSuccess = () => {
    message.success('登录成功');
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



  // 轮播图数据
  // const bannerImages = [
  //   '/images/banner1.jpg',
  //   '/images/banner2.jpg',
  //   '/images/banner3.jpg'
  // ];

  return (
    <div style={{ padding: '20px 50px' }}>
        {/* 轮播图 */}
        {/*<div style={{ marginBottom: 30 }}>*/}
        {/*  <Carousel autoplay style={{ borderRadius: 8, overflow: 'hidden' }}>*/}
        {/*    {bannerImages.map((_, index) => (*/}
        {/*        <div key={index}>*/}
        {/*          <div*/}
        {/*              style={{*/}
        {/*                height: 300,*/}
        {/*                backgroundImage: `url(${bannerImages[index]})`,*/}
        {/*                backgroundSize: 'cover',*/}
        {/*                backgroundPosition: 'center',*/}
        {/*                display: 'flex',*/}
        {/*                alignItems: 'center',*/}
        {/*                justifyContent: 'center'*/}
        {/*              }}*/}
        {/*          >*/}
        {/*            /!* 可以在这里添加文字覆盖层 *!/*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*    ))}*/}
        {/*  </Carousel>*/}
        {/*</div>*/}

      {/* 分类导航 */}
      <div style={{marginBottom: 30}}>
        <h2 style={{marginBottom: 16, color: '#333'}}>商品分类</h2>
        <div style={{
          display: 'flex',
          gap: 12,
            flexWrap: 'wrap',
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <Button
              type={selectedCategory === null ? 'primary' : 'default'}
              size="large"
              onClick={() => handleCategorySelect(null)}
              style={{
                borderRadius: '20px',
                fontWeight: selectedCategory === null ? 'bold' : 'normal',
                boxShadow: selectedCategory === null ? '0 2px 4px rgba(24, 144, 255, 0.3)' : 'none'
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
                  borderRadius: '20px',
                  fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                  boxShadow: selectedCategory === category.id ? '0 2px 4px rgba(24, 144, 255, 0.3)' : 'none'
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
            marginBottom: 20
          }}>
            <h2 style={{ margin: 0, color: '#333' }}>
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name || ''}分类商品` 
                : '精选商品'
              }
            </h2>
            <div style={{ 
              fontSize: 14, 
              color: '#666',
              background: '#f0f0f0',
              padding: '4px 12px',
              borderRadius: '12px'
            }}>
              共 {total} 件商品
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <Spin size="large" tip="正在加载商品..." />
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
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
              <Row gutter={[16, 16]}>
                {products.map(product => (
                  <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
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
                    >
                      <Meta
                        title={<div style={{ fontSize: 16, fontWeight: 'bold' }}>{product.name}</div>}
                        description={
                          <div>
                            <div style={{ 
                              color: '#666', 
                              fontSize: 12, 
                              height: 40, 
                              overflow: 'hidden',
                              marginBottom: 8
                            }}>
                              {product.description}
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center' 
                            }}>
                              <span style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>
                                {formatPrice(product.dailyPrice)}/天
                              </span>
                              <span style={{ color: '#999', fontSize: 12 }}>
                                押金: {formatPrice(product.deposit)}
                              </span>
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
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Spin tip="正在加载更多商品..." />
                </div>
              )}
              
              {/* 没有更多数据提示 */}
              {!hasMoreData && products.length > 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px 0',
                  color: '#999',
                  fontSize: '14px'
                }}>
                  已加载全部商品
                </div>
              )}
            </>
          )}
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