package com.casual.rent.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.common.AuditStatus;
import com.casual.rent.common.ProductStatus;
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
    public IPage<Product> getProductPage(int page, int size, Long categoryId, String name, String sortBy) {
        Page<Product> pageParam = new Page<>(page, size);
        
        // 根据排序方式进行排序
        if ("price_asc".equals(sortBy)) {
            return lambdaQuery()
                    .eq(categoryId != null, Product::getCategoryId, categoryId)
                    .like(name != null && !name.trim().isEmpty(), Product::getName, name)
                    .eq(Product::getStatus, ProductStatus.ON_SHELF.getCode()) // 只查询上架的商品
                    .eq(Product::getAuditStatus, AuditStatus.APPROVED.getCode()) // 只查询审核通过的商品
                    .gt(Product::getStock, 0) // 只查询库存大于0的商品
                    .orderByAsc(Product::getDailyPrice)
                    .page(pageParam);
        } else if ("price_desc".equals(sortBy)) {
            return lambdaQuery()
                    .eq(categoryId != null, Product::getCategoryId, categoryId)
                    .like(name != null && !name.trim().isEmpty(), Product::getName, name)
                    .eq(Product::getStatus, ProductStatus.ON_SHELF.getCode()) // 只查询上架的商品
                    .eq(Product::getAuditStatus, AuditStatus.APPROVED.getCode()) // 只查询审核通过的商品
                    .gt(Product::getStock, 0) // 只查询库存大于0的商品
                    .orderByDesc(Product::getDailyPrice)
                    .page(pageParam);
        } else if ("popular".equals(sortBy)) {
            // 暂时使用商品ID倒序作为热度排序，后续可以加入真实的热度统计
            return lambdaQuery()
                    .eq(categoryId != null, Product::getCategoryId, categoryId)
                    .like(name != null && !name.trim().isEmpty(), Product::getName, name)
                    .eq(Product::getStatus, ProductStatus.ON_SHELF.getCode()) // 只查询上架的商品
                    .eq(Product::getAuditStatus, AuditStatus.APPROVED.getCode()) // 只查询审核通过的商品
                    .gt(Product::getStock, 0) // 只查询库存大于0的商品
                    .orderByDesc(Product::getId)
                    .page(pageParam);
        } else {
            // 默认按创建时间倒序
            return lambdaQuery()
                    .eq(categoryId != null, Product::getCategoryId, categoryId)
                    .like(name != null && !name.trim().isEmpty(), Product::getName, name)
                    .eq(Product::getStatus, ProductStatus.ON_SHELF.getCode()) // 只查询上架的商品
                    .eq(Product::getAuditStatus, AuditStatus.APPROVED.getCode()) // 只查询审核通过的商品
                    .gt(Product::getStock, 0) // 只查询库存大于0的商品
                    .orderByDesc(Product::getCreatedAt)
                    .page(pageParam);
        }
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
        product.setStatus(ProductStatus.OFF_SHELF.getCode()); // 发布时下架状态
        product.setAuditStatus(AuditStatus.PENDING.getCode()); // 待审核
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
            if (auditStatus.equals(AuditStatus.APPROVED.getCode())) {
                product.setStatus(ProductStatus.ON_SHELF.getCode()); // 审核通过后自动上架
            }
            updateById(product);
        }
    }
    
    /**
     * 商家上架/下架商品
     */
    public Product updateProductStatus(Long productId, Integer status, Long merchantId) {
        Product product = getById(productId);
        if(product == null) {
            return null;
        }
        if (product != null && product.getMerchantId().equals(merchantId) && 
            product.getAuditStatus().equals(AuditStatus.APPROVED.getCode())) {
            product.setStatus(status);
            updateById(product);
        }
        return product;
    }
    
    /**
     * 分页查询待审核商品
     */
    public IPage<Product> getPendingProducts(int page, int size) {
        Page<Product> pageParam = new Page<>(page, size);
        
        return lambdaQuery()
                .eq(Product::getAuditStatus, AuditStatus.PENDING.getCode()) // 待审核
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
    
    /**
     * 根据审核状态统计商品数量
     */
    public long countByAuditStatus(Integer auditStatus) {
        return lambdaQuery()
                .eq(Product::getAuditStatus, auditStatus)
                .count();
    }
    
    /**
     * 自动下架库存为0的商品
     */
    public void autoOffShelfZeroStockProducts() {
        lambdaUpdate()
                .eq(Product::getStock, 0)
                .eq(Product::getStatus, ProductStatus.ON_SHELF.getCode()) // 只处理上架的商品
                .set(Product::getStatus, ProductStatus.OFF_SHELF.getCode()) // 设置为下架
                .update();
    }
    
    /**
     * 检查并更新商品状态（库存为0时自动下架）
     */
    public void checkAndUpdateProductStatus(Long productId) {
        Product product = getById(productId);
        if (product != null && product.getStock() <= 0 && 
            product.getStatus().equals(ProductStatus.ON_SHELF.getCode())) {
            product.setStatus(ProductStatus.OFF_SHELF.getCode()); // 自动下架
            updateById(product);
        }
    }
} 