package com.casual.rent.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.entity.Product;
import com.casual.rent.mapper.ProductMapper;
import org.springframework.stereotype.Service;

/**
 * 商品服务
 */
@Service
public class ProductService extends ServiceImpl<ProductMapper, Product> {
    
    /**
     * 分页查询商品
     */
    public IPage<Product> getProductPage(int page, int size, Long categoryId) {
        Page<Product> pageParam = new Page<>(page, size);
        
        return lambdaQuery()
                .eq(categoryId != null, Product::getCategoryId, categoryId)
                .eq(Product::getStatus, 1) // 只查询上架的商品
                .eq(Product::getAuditStatus, 1) // 只查询审核通过的商品
                .orderByDesc(Product::getCreatedAt)
                .page(pageParam);
    }
    
    /**
     * 根据商家ID查询商品
     */
    public IPage<Product> getProductsByMerchant(int page, int size, Long merchantId) {
        Page<Product> pageParam = new Page<>(page, size);
        
        return lambdaQuery()
                .eq(Product::getMerchantId, merchantId)
                .orderByDesc(Product::getCreatedAt)
                .page(pageParam);
    }
    
    /**
     * 商家发布商品
     */
    public Product publishProduct(Product product) {
        product.setStatus(0); // 待审核
        product.setAuditStatus(0); // 待审核
        save(product);
        return product;
    }
    
    /**
     * 审核商品
     */
    public void auditProduct(Long productId, Integer auditStatus, String auditRemark) {
        Product product = getById(productId);
        if (product != null) {
            product.setAuditStatus(auditStatus);
            product.setAuditRemark(auditRemark);
            if (auditStatus == 1) {
                product.setStatus(1); // 审核通过后自动上架
            }
            updateById(product);
        }
    }
    
    /**
     * 商家上架/下架商品
     */
    public void updateProductStatus(Long productId, Integer status, Long merchantId) {
        Product product = getById(productId);
        if (product != null && product.getMerchantId().equals(merchantId) && product.getAuditStatus() == 1) {
            product.setStatus(status);
            updateById(product);
        }
    }
    
    /**
     * 分页查询待审核商品
     */
    public IPage<Product> getPendingProducts(int page, int size) {
        Page<Product> pageParam = new Page<>(page, size);
        
        return lambdaQuery()
                .eq(Product::getAuditStatus, 0) // 待审核
                .orderByAsc(Product::getCreatedAt)
                .page(pageParam);
    }
    
    /**
     * 管理员查询商品列表（支持多条件查询）
     */
    public IPage<Product> getProductsForAdmin(int page, int size, String name, Integer auditStatus) {
        Page<Product> pageParam = new Page<>(page, size);
        
        return lambdaQuery()
                .like(name != null && !name.trim().isEmpty(), Product::getName, name)
                .eq(auditStatus != null, Product::getAuditStatus, auditStatus)
                .orderByDesc(Product::getCreatedAt)
                .page(pageParam);
    }
} 