package com.casual.rent.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.casual.rent.common.Result;
import com.casual.rent.common.OrderStatus;
import com.casual.rent.entity.Order;
import com.casual.rent.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Map;

/**
 * 订单控制器
 */
@Tag(name = "订单接口")
@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    /**
     * 创建订单
     */
    @Operation(summary = "创建订单")
    @PostMapping
    public Result<Order> createOrder(@RequestBody Map<String, Object> params) {
        Long userId = Long.valueOf(params.get("userId").toString());
        Long productId = Long.valueOf(params.get("productId").toString());
        Integer days = Integer.valueOf(params.get("days").toString());
        LocalDate startDate = LocalDate.parse(params.get("startDate").toString());
        Integer quantity = params.get("quantity") != null ? Integer.valueOf(params.get("quantity").toString()) : 1;
        
        Order order = orderService.createOrder(userId, productId, days, startDate, quantity);
        return Result.success(order);
    }
    
    /**
     * 根据ID获取订单详情
     */
    @Operation(summary = "根据ID获取订单详情")
    @GetMapping("/{id}")
    public Result<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getById(id);
        if (order == null) {
            return Result.notFound();
        }
        return Result.success(order);
    }
    
    /**
     * 用户查询自己的订单
     */
    @Operation(summary = "用户查询自己的订单")
    @GetMapping("/user/{userId}")
    public Result<IPage<Order>> getOrdersByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        IPage<Order> orderPage = orderService.getUserOrders(page, size, userId, null);
        return Result.success(orderPage);
    }
    
    /**
     * 商家查询自己的订单
     */
    @Operation(summary = "商家查询自己的订单")
    @GetMapping("/merchant/{merchantId}")
    public Result<IPage<Order>> getOrdersByMerchant(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        IPage<Order> orderPage = orderService.getMerchantOrders(page, size, merchantId, null);
        return Result.success(orderPage);
    }
    
    /**
     * 更新订单状态
     */
    @Operation(summary = "更新订单状态")
    @PutMapping("/{id}/status")
    public Result<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer status = params.get("status");
        
        Order order = orderService.getById(id);
        if (order == null) {
            return Result.notFound();
        }
        
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        orderService.updateById(order);
        
        return Result.success(order);
    }
    
    /**
     * 支付订单
     */
    @Operation(summary = "支付订单")
    @PostMapping("/{id}/pay")
    public Result<String> payOrder(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        Long userId = Long.valueOf(params.get("userId").toString());
        
        orderService.payOrder(id, userId);
        return Result.success("支付成功");
    }

    /**
     * 商家发货
     */
    @Operation(summary = "商家发货")
    @PutMapping("/{id}/ship")
    public Result<String> shipOrder(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        Long merchantId = Long.valueOf(params.get("merchantId").toString());
        
        try {
            orderService.shipOrder(id, merchantId);
            return Result.success("发货成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 用户确认收货
     */
    @Operation(summary = "用户确认收货")
    @PutMapping("/{id}/receive")
    public Result<String> receiveOrder(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        Long userId = Long.valueOf(params.get("userId").toString());
        
        try {
            orderService.receiveOrder(id, userId);
            return Result.success("确认收货成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 用户申请返还
     */
    @Operation(summary = "用户申请返还")
    @PutMapping("/{id}/return")
    public Result<String> returnOrder(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        Long userId = Long.valueOf(params.get("userId").toString());
        
        try {
            orderService.userReturnOrder(id, userId);
            return Result.success("申请返还成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 商家确认收货
     */
    @Operation(summary = "商家确认收货")
    @PutMapping("/{id}/confirm-return")
    public Result<String> confirmReturn(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        Long merchantId = Long.valueOf(params.get("merchantId").toString());
        
        try {
            orderService.confirmReturn(id, merchantId);
            return Result.success("确认收货成功，订单已完成");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 取消订单
     */
    @Operation(summary = "取消订单")
    @PutMapping("/{orderId}/cancel")
    public Result<String> cancelOrder(@PathVariable Long orderId, @RequestParam Long userId) {
        try {
            orderService.cancelOrder(orderId, userId);
            return Result.success("订单取消成功");
        } catch (Exception e) {
            return Result.error("取消订单失败：" + e.getMessage());
        }
    }
} 