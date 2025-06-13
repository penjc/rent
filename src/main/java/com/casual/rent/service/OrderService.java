package com.casual.rent.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.common.OrderStatus;
import com.casual.rent.common.ProductStatus;
import com.casual.rent.common.AuditStatus;
import com.casual.rent.entity.Order;
import com.casual.rent.entity.Product;
import com.casual.rent.mapper.OrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * 订单服务
 */
@Service
public class OrderService extends ServiceImpl<OrderMapper, Order> {
    
    @Autowired
    private ProductService productService;
    
    /**
     * 创建订单（向后兼容）
     */
    public Order createOrder(Long userId, Long productId, Integer days, LocalDate startDate) {
        return createOrder(userId, productId, days, startDate, 1);
    }
    
    /**
     * 创建订单
     */
    public Order createOrder(Long userId, Long productId, Integer days, LocalDate startDate, Integer quantity) {
        Product product = productService.getById(productId);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }
        
        if (quantity == null || quantity <= 0) {
            quantity = 1;
        }
        
        // 检查库存
        if (product.getStock() < quantity) {
            throw new RuntimeException("库存不足，当前库存：" + product.getStock());
        }
        
        // 根据租赁天数选择最优价格策略
        BigDecimal unitPrice;
        int multiplier;
        if (days >= 30) {
            // 月租
            unitPrice = product.getMonthlyPrice();
            multiplier = (int) Math.ceil((double) days / 30);
        } else if (days >= 7) {
            // 周租
            unitPrice = product.getWeeklyPrice();
            multiplier = (int) Math.ceil((double) days / 7);
        } else {
            // 日租
            unitPrice = product.getDailyPrice();
            multiplier = days;
        }
        
        BigDecimal totalAmount = unitPrice.multiply(new BigDecimal(multiplier)).multiply(new BigDecimal(quantity));
        BigDecimal totalDeposit = product.getDeposit().multiply(new BigDecimal(quantity));
        
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setMerchantId(product.getMerchantId());
        order.setProductId(productId);
        order.setProductName(product.getName());
        order.setProductImage(product.getImages());
        order.setRentType(days >= 30 ? 3 : days >= 7 ? 2 : 1); // 1=日租, 2=周租, 3=月租
        order.setRentDays(days);
        order.setQuantity(quantity);
        order.setUnitPrice(unitPrice);
        order.setTotalAmount(totalAmount.add(totalDeposit)); // 租金 + 押金
        order.setDeposit(totalDeposit);
        order.setStatus(OrderStatus.PENDING_PAYMENT.getCode()); // 待支付
        order.setStartDate(startDate);
        order.setEndDate(startDate.plusDays(days - 1));
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        
        save(order);
        
        // 减少库存
        product.setStock(product.getStock() - quantity);
        productService.updateById(product);
        
        // 检查库存，如果为0则自动下架
        productService.checkAndUpdateProductStatus(productId);
        
        return order;
    }
    
    /**
     * 根据用户ID查询订单
     */
    public IPage<Order> getUserOrders(int page, int size, Long userId, Integer status) {
        Page<Order> pageParam = new Page<>(page, size);
        
        return lambdaQuery()
                .eq(Order::getUserId, userId)
                .eq(status != null, Order::getStatus, status)
                .orderByDesc(Order::getCreatedAt)
                .page(pageParam);
    }
    
    /**
     * 根据商家ID查询订单
     */
    public IPage<Order> getMerchantOrders(int page, int size, Long merchantId, Integer status) {
        Page<Order> pageParam = new Page<>(page, size);
        
        return lambdaQuery()
                .eq(Order::getMerchantId, merchantId)
                .eq(status != null, Order::getStatus, status)
                .orderByDesc(Order::getCreatedAt)
                .page(pageParam);
    }
    
    /**
     * 获取所有订单（管理员）
     */
    public IPage<Order> getAllOrders(int page, int size, Integer status) {
        Page<Order> pageParam = new Page<>(page, size);
        
        return lambdaQuery()
                .eq(status != null, Order::getStatus, status)
                .orderByDesc(Order::getCreatedAt)
                .page(pageParam);
    }
    
    /**
     * 获取所有订单（管理员，支持订单号搜索）
     */
    public IPage<Order> getAllOrders(int page, int size, Integer status, String orderNo) {
        Page<Order> pageParam = new Page<>(page, size);
        
        return lambdaQuery()
                .eq(status != null, Order::getStatus, status)
                .like(orderNo != null && !orderNo.trim().isEmpty(), Order::getOrderNo, orderNo)
                .orderByDesc(Order::getCreatedAt)
                .page(pageParam);
    }
    
    /**
     * 支付订单
     */
    public void payOrder(Long orderId, Long userId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("无权限操作此订单");
        }
        if (!order.getStatus().equals(OrderStatus.PENDING_PAYMENT.getCode())) {
            throw new RuntimeException("订单状态不允许支付");
        }
        
        order.setStatus(OrderStatus.PAID.getCode()); // 已支付
        order.setUpdatedAt(LocalDateTime.now());
        updateById(order);
    }
    
    /**
     * 商家发货
     */
    public void shipOrder(Long orderId, Long merchantId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (!order.getMerchantId().equals(merchantId)) {
            throw new RuntimeException("无权限操作此订单");
        }
        if (!order.getStatus().equals(OrderStatus.PAID.getCode())) {
            throw new RuntimeException("订单状态不允许发货");
        }
        
        order.setStatus(OrderStatus.MERCHANT_SHIPPING.getCode()); // 商家发货中
        order.setShippedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        updateById(order);
    }

    /**
     * 用户确认收货
     */
    public void receiveOrder(Long orderId, Long userId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("无权限操作此订单");
        }
        if (!order.getStatus().equals(OrderStatus.MERCHANT_SHIPPING.getCode())) {
            throw new RuntimeException("订单状态不允许确认收货");
        }
        
        order.setStatus(OrderStatus.IN_USE.getCode()); // 使用中
        order.setUpdatedAt(LocalDateTime.now());
        updateById(order);
    }

    /**
     * 用户申请返还
     */
    public void userReturnOrder(Long orderId, Long userId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("无权限操作此订单");
        }
        if (!order.getStatus().equals(OrderStatus.IN_USE.getCode())) {
            throw new RuntimeException("订单状态不允许申请返还");
        }
        
        order.setStatus(OrderStatus.USER_RETURNING.getCode()); // 用户返还中
        order.setUpdatedAt(LocalDateTime.now());
        updateById(order);
    }

    /**
     * 商家确认收货（完成订单）
     */
    public void confirmReturn(Long orderId, Long merchantId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (!order.getMerchantId().equals(merchantId)) {
            throw new RuntimeException("无权限操作此订单");
        }
        if (!order.getStatus().equals(OrderStatus.USER_RETURNING.getCode())) {
            throw new RuntimeException("订单状态不允许确认收货");
        }
        
        // 更新订单状态
        order.setStatus(OrderStatus.COMPLETED.getCode()); // 已完成
        order.setReturnedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        updateById(order);
        
        // 恢复商品库存
        Product product = productService.getById(order.getProductId());
        if (product != null) {
            // 使用订单的数量恢复库存，默认1
            Integer quantity = order.getQuantity() != null ? order.getQuantity() : 1;
            product.setStock(product.getStock() + quantity);
            productService.updateById(product);

            // 如果商品库存恢复后大于0且当前是下架状态，重新上架
            if (product.getStock() > 0
                    && product.getStatus().equals(ProductStatus.OFF_SHELF.getCode())
                    && product.getAuditStatus().equals(AuditStatus.APPROVED.getCode())) {
                product.setStatus(ProductStatus.ON_SHELF.getCode());
                productService.updateById(product);
            }
        }
    }
    
    /**
     * 确认归还（向后兼容）
     */
    public void returnOrder(Long orderId, Long merchantId) {
        confirmReturn(orderId, merchantId);
    }
    
    /**
     * 取消订单
     */
    public void cancelOrder(Long orderId, Long userId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("无权限操作此订单");
        }
        
        // 只有待支付和已支付状态的订单可以取消
        if (!order.getStatus().equals(OrderStatus.PENDING_PAYMENT.getCode()) && 
            !order.getStatus().equals(OrderStatus.PAID.getCode())) {
            throw new RuntimeException("当前订单状态不允许取消");
        }
        
        // 更新订单状态为已取消
        order.setStatus(OrderStatus.CANCELLED.getCode());
        order.setUpdatedAt(LocalDateTime.now());
        updateById(order);
        
        // 恢复商品库存
        Product product = productService.getById(order.getProductId());
        if (product != null) {
            // 恢复库存，使用订单的数量
            Integer quantity = order.getQuantity() != null ? order.getQuantity() : 1;
            product.setStock(product.getStock() + quantity);
            productService.updateById(product);
            
            // 如果商品库存恢复后大于0且当前是下架状态，重新上架
            if (product.getStock() > 0 && 
                product.getStatus().equals(ProductStatus.OFF_SHELF.getCode()) && 
                product.getAuditStatus().equals(AuditStatus.APPROVED.getCode())) {
                product.setStatus(ProductStatus.ON_SHELF.getCode()); // 重新上架
                productService.updateById(product);
            }
        }
    }
    
    /**
     * 管理员取消订单
     */
    public void cancelOrderByAdmin(Long orderId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        
        // 管理员可以取消任何未完成的订单
        if (order.getStatus().equals(OrderStatus.COMPLETED.getCode())) {
            throw new RuntimeException("已完成的订单不能取消");
        }
        
        // 更新订单状态为已取消
        order.setStatus(OrderStatus.CANCELLED.getCode());
        order.setUpdatedAt(LocalDateTime.now());
        updateById(order);
        
        // 恢复商品库存
        Product product = productService.getById(order.getProductId());
        if (product != null) {
            Integer quantity = order.getQuantity() != null ? order.getQuantity() : 1;
            product.setStock(product.getStock() + quantity);
            productService.updateById(product);
            
            // 如果商品库存恢复后大于0且当前是下架状态，重新上架
            if (product.getStock() > 0 && 
                product.getStatus().equals(ProductStatus.OFF_SHELF.getCode()) && 
                product.getAuditStatus().equals(AuditStatus.APPROVED.getCode())) {
                product.setStatus(ProductStatus.ON_SHELF.getCode()); // 重新上架
                productService.updateById(product);
            }
        }
    }
    
    /**
     * 更新订单状态（管理员）
     */
    public void updateOrderStatus(Long orderId, Integer status) {
        Order order = getById(orderId);
        if (order != null) {
            Integer oldStatus = order.getStatus();
            order.setStatus(status);
            if (status.equals(OrderStatus.MERCHANT_SHIPPING.getCode()) && order.getShippedAt() == null) {
                order.setShippedAt(LocalDateTime.now());
            }
            if (status.equals(OrderStatus.COMPLETED.getCode()) && order.getReturnedAt() == null) {
                order.setReturnedAt(LocalDateTime.now());
                
                // 订单完成时恢复库存
                Product product = productService.getById(order.getProductId());
                if (product != null) {
                    Integer quantity = order.getQuantity() != null ? order.getQuantity() : 1;
                    product.setStock(product.getStock() + quantity);
                    productService.updateById(product);
                }
            }
            if (status.equals(OrderStatus.CANCELLED.getCode())) {
                // 订单被取消时恢复库存
                Product product = productService.getById(order.getProductId());
                if (product != null) {
                    Integer quantity = order.getQuantity() != null ? order.getQuantity() : 1;
                    product.setStock(product.getStock() + quantity);
                    productService.updateById(product);
                    
                    // 如果商品库存恢复后大于0且当前是下架状态，重新上架
                    if (product.getStock() > 0 && 
                        product.getStatus().equals(ProductStatus.OFF_SHELF.getCode()) && 
                        product.getAuditStatus().equals(AuditStatus.APPROVED.getCode())) {
                        product.setStatus(ProductStatus.ON_SHELF.getCode()); // 重新上架
                        productService.updateById(product);
                    }
                }
            }
            order.setUpdatedAt(LocalDateTime.now());
            updateById(order);
        }
    }
    
    /**
     * 根据状态统计订单数量
     */
    public long countByStatus(Integer status) {
        return lambdaQuery()
                .eq(Order::getStatus, status)
                .count();
    }
    
    /**
     * 生成订单号
     */
    private String generateOrderNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.valueOf((int) (Math.random() * 1000));
        return "R" + timestamp + String.format("%03d", Integer.parseInt(random));
    }
} 