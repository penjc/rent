import React, { useState, useEffect } from 'react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { favoriteService } from '../../services/favoriteService';
import { showMessage } from '@/hooks/useMessage';

interface FavoriteButtonProps {
  userId: number;
  productId: number;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  userId,
  productId,
  size = 'medium',
  showText = false,
  className = '',
  onToggle
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // 根据size设置图标样式
  const getIconStyle = () => {
    switch (size) {
      case 'small': return { fontSize: '16px' };
      case 'large': return { fontSize: '24px' };
      default: return { fontSize: '20px' };
    }
  };

  // 检查收藏状态
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await favoriteService.checkFavorite(userId, productId);
        if (response.code === 200) {
          setIsFavorited(response.data || false);
        }
      } catch (error) {
        console.error('检查收藏状态失败:', error);
      }
    };

    if (userId && productId) {
      checkFavoriteStatus();
    }
  }, [userId, productId]);

  // 切换收藏状态
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    try {
      let response;
      if (isFavorited) {
        response = await favoriteService.removeFavorite(userId, productId);
      } else {
        response = await favoriteService.addFavorite(userId, productId);
      }

      if (response.code === 200) {
        const newFavoriteState = !isFavorited;
        setIsFavorited(newFavoriteState);
        onToggle?.(newFavoriteState);
        showMessage.success(newFavoriteState ? '已添加到收藏' : '已取消收藏');
      } else {
        showMessage.error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      showMessage.error('收藏操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`
        flex items-center justify-center gap-1 transition-all duration-200
        ${isFavorited 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorited ? '取消收藏' : '添加收藏'}
    >
      {isFavorited ? (
        <HeartFilled style={getIconStyle()} className="transition-all duration-200" />
      ) : (
        <HeartOutlined style={getIconStyle()} className="transition-all duration-200" />
      )}
      {showText && (
        <span className="text-sm">
          {isFavorited ? '已收藏' : '收藏'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton; 