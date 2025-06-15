package com.casual.rent.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.casual.rent.common.Result;
import com.casual.rent.entity.Product;
import com.casual.rent.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Set;

/**
 * 收藏控制器
 */
@Tag(name = "收藏接口")
@RestController
@RequestMapping("/favorites")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class FavoriteController {
    
    @Autowired
    private FavoriteService favoriteService;
    
    /**
     * 添加收藏
     */
    @Operation(summary = "添加收藏")
    @PostMapping("/{userId}/{productId}")
    public Result<String> addFavorite(@PathVariable Long userId, @PathVariable Long productId) {
        boolean success = favoriteService.addFavorite(userId, productId);
        if (success) {
            return Result.success("收藏成功");
        } else {
            return Result.fail("商品已收藏");
        }
    }
    
    /**
     * 取消收藏
     */
    @Operation(summary = "取消收藏")
    @DeleteMapping("/{userId}/{productId}")
    public Result<String> removeFavorite(@PathVariable Long userId, @PathVariable Long productId) {
        boolean success = favoriteService.removeFavorite(userId, productId);
        if (success) {
            return Result.success("取消收藏成功");
        } else {
            return Result.fail("取消收藏失败");
        }
    }
    
    /**
     * 检查是否已收藏
     */
    @Operation(summary = "检查是否已收藏")
    @GetMapping("/check/{userId}/{productId}")
    public Result<Boolean> checkFavorite(@PathVariable Long userId, @PathVariable Long productId) {
        boolean isFavorited = favoriteService.isFavorited(userId, productId);
        return Result.success(isFavorited);
    }
    
    /**
     * 获取用户收藏的商品列表
     */
    @Operation(summary = "获取用户收藏的商品列表")
    @GetMapping("/user/{userId}")
    public Result<IPage<Product>> getFavoriteProducts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        IPage<Product> favoriteProducts = favoriteService.getFavoriteProducts(userId, page, size);
        return Result.success(favoriteProducts);
    }
    
    /**
     * 获取用户收藏的商品ID集合
     */
    @Operation(summary = "获取用户收藏的商品ID集合")
    @GetMapping("/user/{userId}/ids")
    public Result<Set<Long>> getUserFavoriteProductIds(@PathVariable Long userId) {
        Set<Long> favoriteProductIds = favoriteService.getUserFavoriteProductIds(userId);
        return Result.success(favoriteProductIds);
    }
    
    /**
     * 批量检查商品收藏状态
     */
    @Operation(summary = "批量检查商品收藏状态")
    @PostMapping("/check/{userId}")
    public Result<Set<Long>> checkFavorites(@PathVariable Long userId, @RequestBody List<Long> productIds) {
        Set<Long> favoriteProductIds = favoriteService.getFavoriteProductIds(userId, productIds);
        return Result.success(favoriteProductIds);
    }
    
    /**
     * 获取商品的收藏数量
     */
    @Operation(summary = "获取商品的收藏数量")
    @GetMapping("/count/{productId}")
    public Result<Long> getProductFavoriteCount(@PathVariable Long productId) {
        long count = favoriteService.getProductFavoriteCount(productId);
        return Result.success(count);
    }
} 