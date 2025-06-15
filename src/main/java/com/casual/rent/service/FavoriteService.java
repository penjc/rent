package com.casual.rent.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.entity.Favorite;
import com.casual.rent.entity.Product;
import com.casual.rent.mapper.FavoriteMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 收藏服务
 */
@Service
public class FavoriteService extends ServiceImpl<FavoriteMapper, Favorite> {
    
    @Autowired
    private ProductService productService;
    
    /**
     * 添加收藏
     */
    public boolean addFavorite(Long userId, Long productId) {
        // 检查是否已收藏
        if (isFavorited(userId, productId)) {
            return false; // 已收藏
        }
        
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setProductId(productId);
        favorite.setCreatedAt(LocalDateTime.now());
        
        return save(favorite);
    }
    
    /**
     * 取消收藏
     */
    public boolean removeFavorite(Long userId, Long productId) {
        return lambdaUpdate()
                .eq(Favorite::getUserId, userId)
                .eq(Favorite::getProductId, productId)
                .remove();
    }
    
    /**
     * 检查是否已收藏
     */
    public boolean isFavorited(Long userId, Long productId) {
        return lambdaQuery()
                .eq(Favorite::getUserId, userId)
                .eq(Favorite::getProductId, productId)
                .exists();
    }
    
    /**
     * 获取用户收藏的商品列表（分页）
     */
    public IPage<Product> getFavoriteProducts(Long userId, int page, int size) {
        Page<Product> pageParam = new Page<>(page, size);
        
        // 获取用户收藏的商品ID列表
        List<Long> productIds = lambdaQuery()
                .eq(Favorite::getUserId, userId)
                .orderByDesc(Favorite::getCreatedAt)
                .list()
                .stream()
                .map(Favorite::getProductId)
                .collect(Collectors.toList());
        
        if (productIds.isEmpty()) {
            return pageParam; // 返回空页面
        }
        
        // 查询商品信息（包括库存为0的商品）
        return productService.lambdaQuery()
                .in(Product::getId, productIds)
                .orderByDesc(Product::getCreatedAt)
                .page(pageParam);
    }
    
    /**
     * 获取用户收藏的商品ID集合
     */
    public Set<Long> getUserFavoriteProductIds(Long userId) {
        return lambdaQuery()
                .eq(Favorite::getUserId, userId)
                .list()
                .stream()
                .map(Favorite::getProductId)
                .collect(Collectors.toSet());
    }
    
    /**
     * 获取商品的收藏数量
     */
    public long getProductFavoriteCount(Long productId) {
        return lambdaQuery()
                .eq(Favorite::getProductId, productId)
                .count();
    }
    
    /**
     * 批量获取商品的收藏状态
     */
    public Set<Long> getFavoriteProductIds(Long userId, List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptySet();
        }
        
        return lambdaQuery()
                .eq(Favorite::getUserId, userId)
                .in(Favorite::getProductId, productIds)
                .list()
                .stream()
                .map(Favorite::getProductId)
                .collect(Collectors.toSet());
    }
} 