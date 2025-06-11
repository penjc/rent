package com.casual.rent.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.casual.rent.common.OrderStatus;
import com.casual.rent.common.VerificationStatus;
import com.casual.rent.common.AuditStatus;
import com.casual.rent.common.Result;
import com.casual.rent.entity.Admin;
import com.casual.rent.entity.Category;
import com.casual.rent.entity.Merchant;
import com.casual.rent.entity.Product;
import com.casual.rent.entity.Order;
import com.casual.rent.entity.User;
import com.casual.rent.service.AdminService;
import com.casual.rent.service.CategoryService;
import com.casual.rent.service.MerchantService;
import com.casual.rent.service.ProductService;
import com.casual.rent.service.OrderService;
import com.casual.rent.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 管理员控制器
 */
@RestController
@RequestMapping("/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private MerchantService merchantService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;
    
    /**
     * 管理员登录
     */
    @PostMapping("/login")
    public Result<Admin> login(@RequestBody Map<String, Object> params) {
        String username = (String) params.get("username");
        String password = (String) params.get("password");
        
        if (username == null || password == null) {
            return Result.fail("用户名和密码不能为空");
        }
        
        Admin admin = adminService.login(username, password);
        if (admin == null) {
            return Result.fail("用户名或密码错误");
        }
        
        return Result.success(admin);
    }
    
    // =================== 用户管理 ===================
    
    /**
     * 获取用户列表
     */
    @GetMapping("/users")
    public Result<IPage<User>> getUsers(@RequestParam(defaultValue = "1") int page,
                                       @RequestParam(defaultValue = "10") int size,
                                       @RequestParam(required = false) String phone) {
        IPage<User> users = userService.getUsers(page, size, phone);
        return Result.success(users);
    }
    
    /**
     * 更新用户信息
     */
    @PutMapping("/users/{userId}")
    public Result<String> updateUser(@PathVariable Long userId, @RequestBody User user) {
        user.setId(userId);
        userService.updateById(user);
        return Result.success("用户信息更新成功");
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/users/{userId}")
    public Result<String> deleteUser(@PathVariable Long userId) {
        userService.removeById(userId);
        return Result.success("用户删除成功");
    }
    
    /**
     * 用户认证审核
     */
    @PutMapping("/users/{userId}/verify")
    public Result<String> verifyUser(@PathVariable Long userId, @RequestBody Map<String, Object> params) {
        Integer verified = (Integer) params.get("verified");
        
        if (verified == null) {
            return Result.fail("认证状态不能为空");
        }
        
        User user = userService.getById(userId);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        
        user.setVerified(verified);
        userService.updateById(user);
        
        return Result.success(verified.equals(VerificationStatus.VERIFIED.getCode()) ? "用户认证通过" : "用户认证拒绝");
    }
    
    /**
     * 获取仪表盘统计数据
     */
    @GetMapping("/dashboard/stats")
    public Result<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 用户统计
        long totalUsers = userService.count();
        long pendingVerificationUsers = userService.countByVerificationStatus(VerificationStatus.PENDING);
        long approvedUsers = userService.countByVerificationStatus(VerificationStatus.VERIFIED);
        long rejectedUsers = userService.countByVerificationStatus(VerificationStatus.REJECTED);
        
        stats.put("totalUsers", totalUsers);
        stats.put("pendingVerificationUsers", pendingVerificationUsers);
        stats.put("approvedUsers", approvedUsers);
        stats.put("rejectedUsers", rejectedUsers);
        
        // 商家统计
        long totalMerchants = merchantService.count();
        long pendingMerchants = merchantService.countByStatus(VerificationStatus.PENDING);
        long approvedMerchants = merchantService.countByStatus(VerificationStatus.VERIFIED);
        long rejectedMerchants = merchantService.countByStatus(VerificationStatus.REJECTED);
        
        stats.put("totalMerchants", totalMerchants);
        stats.put("pendingMerchants", pendingMerchants);
        stats.put("approvedMerchants", approvedMerchants);
        stats.put("rejectedMerchants", rejectedMerchants);
        
        // 商品统计
        long totalProducts = productService.count();
        long pendingProducts = productService.countByAuditStatus(AuditStatus.PENDING.getCode());
        long approvedProducts = productService.countByAuditStatus(AuditStatus.APPROVED.getCode());
        long rejectedProducts = productService.countByAuditStatus(AuditStatus.REJECTED.getCode());
        
        stats.put("totalProducts", totalProducts);
        stats.put("pendingProducts", pendingProducts);
        stats.put("approvedProducts", approvedProducts);
        stats.put("rejectedProducts", rejectedProducts);
        
        // 订单统计
        long totalOrders = orderService.count();
        long completedOrders = orderService.countByStatus(OrderStatus.COMPLETED.getCode());
        long cancelledOrders = orderService.countByStatus(OrderStatus.CANCELLED.getCode());
        // 进行中订单 = 总订单 - 已完成订单 - 已取消订单
        long inProgressOrders = totalOrders - completedOrders - cancelledOrders;
        
        stats.put("totalOrders", totalOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("cancelledOrders", cancelledOrders);
        stats.put("inProgressOrders", inProgressOrders);
        
        return Result.success(stats);
    }
    
    // =================== 商家管理 ===================
    
    /**
     * 获取商家列表
     */
    @GetMapping("/merchants")
    public Result<IPage<Merchant>> getMerchants(@RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "10") int size,
                                               @RequestParam(required = false) String phone,
                                               @RequestParam(required = false) Integer status) {
        IPage<Merchant> merchants = merchantService.getMerchants(page, size, phone, status);
        return Result.success(merchants);
    }
    
    /**
     * 获取待审核商家列表
     */
    @GetMapping("/merchants/pending")
    public Result<IPage<Merchant>> getPendingMerchants(@RequestParam(defaultValue = "1") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        IPage<Merchant> merchants = merchantService.getPendingMerchants(page, size);
        return Result.success(merchants);
    }
    
    /**
     * 审核商家
     */
    @PutMapping("/merchants/{merchantId}/audit")
    public Result<String> auditMerchant(@PathVariable Long merchantId, @RequestBody Map<String, Object> params) {
        Integer status = (Integer) params.get("status");
        String remark = (String) params.get("remark");
        
        if (status == null) {
            return Result.fail("审核状态不能为空");
        }
        
        merchantService.auditMerchant(merchantId, status, remark);
        return Result.success(status.equals(VerificationStatus.VERIFIED.getCode()) ? "商家审核通过" : "商家审核拒绝");
    }
    
    // =================== 商品管理 ===================
    
    /**
     * 获取商品列表
     */
    @GetMapping("/products")
    public Result<IPage<Product>> getProducts(@RequestParam(defaultValue = "1") int page,
                                             @RequestParam(defaultValue = "10") int size,
                                             @RequestParam(required = false) String name,
                                             @RequestParam(required = false) Integer auditStatus) {
        IPage<Product> products = productService.getProductsForAdmin(page, size, name, auditStatus);
        return Result.success(products);
    }
    
    /**
     * 获取待审核商品列表
     */
    @GetMapping("/products/pending")
    public Result<IPage<Product>> getPendingProducts(@RequestParam(defaultValue = "1") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        IPage<Product> products = productService.getPendingProducts(page, size);
        return Result.success(products);
    }
    
    /**
     * 审核商品
     */
    @PutMapping("/products/{productId}/audit")
    public Result<String> auditProduct(@PathVariable Long productId, @RequestBody Map<String, Object> params) {
        Integer auditStatus = (Integer) params.get("auditStatus");
        String auditRemark = (String) params.get("auditRemark");
        
        if (auditStatus == null) {
            return Result.fail("审核状态不能为空");
        }
        
        productService.auditProduct(productId, auditStatus, auditRemark);
        return Result.success(auditStatus.equals(AuditStatus.APPROVED.getCode()) ? "商品审核通过" : "商品审核拒绝");
    }
    
    // =================== 订单管理 ===================
    
    /**
     * 获取所有订单
     */
    @GetMapping("/orders")
    public Result<IPage<Order>> getAllOrders(@RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(required = false) Integer status,
                                           @RequestParam(required = false) String orderNo) {
        IPage<Order> orders = orderService.getAllOrders(page, size, status, orderNo);
        return Result.success(orders);
    }
    
    /**
     * 手动修改订单状态
     */
    @PutMapping("/orders/{orderId}/status")
    public Result<String> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, Object> params) {
        Integer status = (Integer) params.get("status");
        
        if (status == null) {
            return Result.fail("订单状态不能为空");
        }
        
        orderService.updateOrderStatus(orderId, status);
        return Result.success("订单状态更新成功");
    }
    
    /**
     * 管理员取消订单
     */
    @PutMapping("/orders/{orderId}/cancel")
    public Result<String> cancelOrderByAdmin(@PathVariable Long orderId) {
        try {
            orderService.cancelOrderByAdmin(orderId);
            return Result.success("订单取消成功");
        } catch (Exception e) {
            return Result.error("取消订单失败：" + e.getMessage());
        }
    }
    
    // =================== 分类管理 ===================
    
    /**
     * 获取分类列表
     */
    @GetMapping("/categories")
    public Result<IPage<Category>> getCategories(@RequestParam(defaultValue = "1") int page,
                                                @RequestParam(defaultValue = "10") int size,
                                                @RequestParam(required = false) String name,
                                                @RequestParam(required = false) Integer status) {
        try {
            // 参数验证
            if (page < 1) page = 1;
            if (size < 1) size = 10;
            if (size > 100) size = 100; // 限制最大页面大小
            
            IPage<Category> categories = categoryService.getCategoriesForAdmin(page, size, name, status);
            return Result.success(categories);
        } catch (Exception e) {
            return Result.error("获取分类列表失败：" + e.getMessage());
        }
    }
    
    /**
     * 创建分类
     */
    @PostMapping("/categories")
    public Result<Category> createCategory(@RequestBody Map<String, Object> params) {
        if (params == null) {
            return Result.fail("请求参数不能为空");
        }
        
        String name = (String) params.get("name");
        String icon = (String) params.get("icon");
        Integer sortOrder = null;
        
        if (params.get("sortOrder") != null) {
            try {
                sortOrder = Integer.valueOf(params.get("sortOrder").toString());
            } catch (NumberFormatException e) {
                return Result.fail("排序号格式不正确");
            }
        }
        
        if (name == null || name.trim().isEmpty()) {
            return Result.fail("分类名称不能为空");
        }
        
        try {
            Category category = categoryService.createCategory(name, icon, sortOrder);
            return Result.success(category);
        } catch (Exception e) {
            return Result.error("创建分类失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新分类
     */
    @PutMapping("/categories/{categoryId}")
    public Result<Category> updateCategory(@PathVariable Long categoryId, @RequestBody Map<String, Object> params) {
        if (params == null) {
            return Result.fail("请求参数不能为空");
        }
        
        String name = (String) params.get("name");
        String icon = (String) params.get("icon");
        Integer sortOrder = null;
        Integer status = null;
        
        if (params.get("sortOrder") != null) {
            try {
                sortOrder = Integer.valueOf(params.get("sortOrder").toString());
            } catch (NumberFormatException e) {
                return Result.fail("排序号格式不正确");
            }
        }
        
        if (params.get("status") != null) {
            try {
                status = Integer.valueOf(params.get("status").toString());
            } catch (NumberFormatException e) {
                return Result.fail("状态格式不正确");
            }
        }
        
        try {
            Category category = categoryService.updateCategory(categoryId, name, icon, sortOrder, status);
            return Result.success(category);
        } catch (Exception e) {
            return Result.error("更新分类失败：" + e.getMessage());
        }
    }
    
    /**
     * 删除分类
     */
    @DeleteMapping("/categories/{categoryId}")
    public Result<String> deleteCategory(@PathVariable Long categoryId) {
        try {
            // 检查是否有商品使用该分类
            long productCount = productService.lambdaQuery()
                    .eq(Product::getCategoryId, categoryId)
                    .count();
            
            if (productCount > 0) {
                return Result.fail("该分类下还有商品，无法删除");
            }
            
            categoryService.deleteCategory(categoryId);
            return Result.success("分类删除成功");
        } catch (Exception e) {
            return Result.error("删除分类失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新分类状态
     */
    @PutMapping("/categories/{categoryId}/status")
    public Result<String> updateCategoryStatus(@PathVariable Long categoryId, @RequestBody Map<String, Object> params) {
        if (params == null || params.get("status") == null) {
            return Result.fail("状态不能为空");
        }
        
        Integer status;
        try {
            status = Integer.valueOf(params.get("status").toString());
        } catch (NumberFormatException e) {
            return Result.fail("状态格式不正确");
        }
        
        try {
            categoryService.updateCategoryStatus(categoryId, status);
            return Result.success(status == 1 ? "分类已启用" : "分类已禁用");
        } catch (Exception e) {
            return Result.error("更新分类状态失败：" + e.getMessage());
        }
    }
    
    /**
     * 批量更新分类排序
     */
    @PutMapping("/categories/sort")
    public Result<String> batchUpdateCategorySort(@RequestBody Map<String, Object> params) {
        try {
            if (params == null || params.get("categoryIds") == null) {
                return Result.fail("分类ID列表不能为空");
            }
            
            @SuppressWarnings("unchecked")
            java.util.List<Long> categoryIds = (java.util.List<Long>) params.get("categoryIds");
            
            if (categoryIds == null || categoryIds.isEmpty()) {
                return Result.fail("分类ID列表不能为空");
            }
            
            categoryService.batchUpdateSortOrder(categoryIds);
            return Result.success("分类排序更新成功");
        } catch (Exception e) {
            return Result.error("更新分类排序失败：" + e.getMessage());
        }
    }
} 