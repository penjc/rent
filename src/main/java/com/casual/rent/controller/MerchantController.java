package com.casual.rent.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.casual.rent.common.Result;
import com.casual.rent.common.ProductStatus;
import com.casual.rent.common.AuditStatus;
import com.casual.rent.common.OrderStatus;
import com.casual.rent.entity.Merchant;
import com.casual.rent.entity.Order;
import com.casual.rent.entity.Product;
import com.casual.rent.service.MerchantService;
import com.casual.rent.service.OrderService;
import com.casual.rent.service.ProductService;
import com.casual.rent.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;

/**
 * 商家控制器
 */
@Tag(name = "商家接口")
@RestController
@RequestMapping("/merchant")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class MerchantController {
    
    @Autowired
    private MerchantService merchantService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private FileUploadService fileUploadService;
    
    /**
     * 商家注册（支持文件上传）
     */
    @Operation(summary = "商家注册(文件上传)")
    @PostMapping("/register-with-files")
    public Result<Merchant> registerWithFiles(
            @RequestParam("phone") String phone,
            @RequestParam("password") String password,
            @RequestParam("companyName") String companyName,
            @RequestParam("contactName") String contactName,
            @RequestParam("idCardFront") MultipartFile idCardFront,
            @RequestParam("idCardBack") MultipartFile idCardBack,
            @RequestParam(value = "businessLicense", required = false) MultipartFile businessLicense) {
        
        try {
            // 参数验证
            if (phone == null || password == null || contactName == null || 
                idCardFront == null || idCardBack == null) {
                return Result.fail("必填参数不能为空");
            }
            
            if (password.length() < 6) {
                return Result.fail("密码长度不能少于6位");
            }
            
            // 检查是否已注册
            Merchant existMerchant = merchantService.findByPhone(phone);
            if (existMerchant != null) {
                return Result.fail("该手机号已注册商家");
            }
            
            // 验证文件类型和大小
            String[] allowedTypes = {"image/", "application/pdf"};
            long maxSize = 10 * 1024 * 1024; // 10MB
            
            if (!fileUploadService.isValidFileType(idCardFront, allowedTypes) ||
                !fileUploadService.isValidFileSize(idCardFront, maxSize)) {
                return Result.fail("身份证正面文件格式或大小不符合要求");
            }
            
            if (!fileUploadService.isValidFileType(idCardBack, allowedTypes) ||
                !fileUploadService.isValidFileSize(idCardBack, maxSize)) {
                return Result.fail("身份证背面文件格式或大小不符合要求");
            }
            
            if (businessLicense != null && (!fileUploadService.isValidFileType(businessLicense, allowedTypes) ||
                !fileUploadService.isValidFileSize(businessLicense, maxSize))) {
                return Result.fail("营业执照文件格式或大小不符合要求");
            }
            
            // 上传文件到腾讯云OSS
            String idCardFrontUrl = fileUploadService.uploadFile(idCardFront, "certificates");
            String idCardBackUrl = fileUploadService.uploadFile(idCardBack, "certificates");
            String businessLicenseUrl = null;
            if (businessLicense != null && !businessLicense.isEmpty()) {
                businessLicenseUrl = fileUploadService.uploadFile(businessLicense, "certificates");
            }
            
            // 注册商家
            Merchant merchant = merchantService.register(phone, password, companyName, contactName, businessLicenseUrl);
            return Result.success(merchant);
            
        } catch (Exception e) {
            return Result.error("注册失败：" + e.getMessage());
        }
    }

    /**
     * 商家注册（原JSON格式，保持向后兼容）
     */
    @Operation(summary = "商家注册(JSON)")
    @PostMapping("/register")
    public Result<Merchant> register(@RequestBody Map<String, Object> params) {
        String phone = (String) params.get("phone");
        String password = (String) params.get("password");
        String companyName = (String) params.get("companyName");
        String contactName = (String) params.get("contactName");
        String businessLicense = (String) params.get("businessLicense");
        
        if (phone == null || password == null || contactName == null) {
            return Result.fail("参数错误");
        }
        
        if (password.length() < 6) {
            return Result.fail("密码长度不能少于6位");
        }
        
        // 检查是否已注册
        Merchant existMerchant = merchantService.findByPhone(phone);
        if (existMerchant != null) {
            return Result.fail("该手机号已注册商家");
        }
        
        Merchant merchant = merchantService.register(phone, password, companyName, contactName, businessLicense);
        return Result.success(merchant);
    }
    
    /**
     * 商家登录
     */
    @Operation(summary = "商家登录")
    @PostMapping("/login")
    public Result<Merchant> login(@RequestBody Map<String, Object> params) {
        String phone = (String) params.get("phone");
        String password = (String) params.get("password");
        
        if (phone == null || password == null) {
            return Result.fail("手机号和密码不能为空");
        }
        
        // 验证商家账号密码
        Merchant merchant = merchantService.login(phone, password);
        if (merchant == null) {
            return Result.fail("手机号或密码错误");
        }
        
        return Result.success(merchant);
    }
    
    /**
     * 根据手机号查找商家
     */
    @Operation(summary = "根据手机号查找商家")
    @GetMapping("/info/{phone}")
    public Result<Merchant> getMerchantInfo(@PathVariable String phone) {
        Merchant merchant = merchantService.findByPhone(phone);
        if (merchant == null) {
            return Result.fail("商家不存在");
        }
        return Result.success(merchant);
    }
    
    /**
     * 发布商品
     */
    @Operation(summary = "发布商品")
    @PostMapping("/product")
    public Result<Product> publishProduct(@RequestBody Product product) {
        if (product.getMerchantId() == null || product.getName() == null || product.getDailyPrice() == null) {
            return Result.fail("参数错误");
        }
        
        Product savedProduct = productService.publishProduct(product);
        return Result.success(savedProduct);
    }
    
    /**
     * 获取商家商品列表
     */
    @Operation(summary = "获取商家商品列表")
    @GetMapping("/products/{merchantId}")
    public Result<IPage<Product>> getMerchantProducts(@PathVariable Long merchantId,
                                                     @RequestParam(defaultValue = "1") int page,
                                                     @RequestParam(defaultValue = "10") int size) {
        IPage<Product> products = productService.getProductsByMerchant(page, size, merchantId);
        return Result.success(products);
    }
    
    /**
     * 上架/下架商品
     */
    @Operation(summary = "上架/下架商品")
    @PutMapping("/product/{productId}/status")
    public Result<String> updateProductStatus(@PathVariable Long productId, 
                                             @RequestBody Map<String, Object> params) {
        Integer status = (Integer) params.get("status");
        Long merchantId = Long.valueOf(params.get("merchantId").toString());
        
        if (status == null || merchantId == null) {
            return Result.fail("参数错误");
        }
        
        productService.updateProductStatus(productId, status, merchantId);
        return Result.success(status.equals(ProductStatus.ON_SHELF.getCode()) ? "商品已上架" : "商品已下架");
    }
    
    /**
     * 获取商家订单
     */
    @Operation(summary = "获取商家订单")
    @GetMapping("/orders/{merchantId}")
    public Result<IPage<Order>> getMerchantOrders(@PathVariable Long merchantId,
                                                 @RequestParam(defaultValue = "1") int page,
                                                 @RequestParam(defaultValue = "10") int size,
                                                 @RequestParam(required = false) Integer status) {
        IPage<Order> orders = orderService.getMerchantOrders(page, size, merchantId, status);
        return Result.success(orders);
    }
    
    /**
     * 确认发货
     */
    @Operation(summary = "确认发货")
    @PutMapping("/order/{orderId}/ship")
    public Result<String> shipOrder(@PathVariable Long orderId, @RequestBody Map<String, Object> params) {
        Long merchantId = Long.valueOf(params.get("merchantId").toString());
        orderService.shipOrder(orderId, merchantId);
        return Result.success("发货成功");
    }
    
    /**
     * 确认收回
     */
    @Operation(summary = "确认收回")
    @PutMapping("/order/{orderId}/return")
    public Result<String> returnOrder(@PathVariable Long orderId, @RequestBody Map<String, Object> params) {
        Long merchantId = Long.valueOf(params.get("merchantId").toString());
        orderService.returnOrder(orderId, merchantId);
        return Result.success("确认收回成功");
    }
    
    /**
     * 获取商家统计数据
     */
    @Operation(summary = "获取商家统计数据")
    @GetMapping("/{merchantId}/stats")
    public Result<Map<String, Object>> getMerchantStats(@PathVariable Long merchantId) {
        try {
            Map<String, Object> stats = new java.util.HashMap<>();
            
            // 商品统计
            long totalProducts = productService.lambdaQuery()
                .eq(Product::getMerchantId, merchantId)
                .count();
            
            long onShelfProducts = productService.lambdaQuery()
                .eq(Product::getMerchantId, merchantId)
                .eq(Product::getStatus, ProductStatus.ON_SHELF.getCode())
                .eq(Product::getAuditStatus, AuditStatus.APPROVED.getCode())
                .count();
            
            long pendingAuditProducts = productService.lambdaQuery()
                .eq(Product::getMerchantId, merchantId)
                .eq(Product::getAuditStatus, AuditStatus.PENDING.getCode())
                .count();
            
            // 订单统计
            long totalOrders = orderService.lambdaQuery()
                .eq(Order::getMerchantId, merchantId)
                .count();
            
            long pendingOrders = orderService.lambdaQuery()
                .eq(Order::getMerchantId, merchantId)
                .in(Order::getStatus, OrderStatus.PENDING_PAYMENT.getCode(), OrderStatus.PAID.getCode()) // 待支付和已支付
                .count();
            
            long inProgressOrders = orderService.lambdaQuery()
                .eq(Order::getMerchantId, merchantId)
                .in(Order::getStatus, OrderStatus.MERCHANT_SHIPPING.getCode(), 
                    OrderStatus.IN_USE.getCode(), OrderStatus.USER_RETURNING.getCode()) // 发货中、使用中、返还中
                .count();
            
            long completedOrders = orderService.lambdaQuery()
                .eq(Order::getMerchantId, merchantId)
                .eq(Order::getStatus, OrderStatus.COMPLETED.getCode()) // 已完成
                .count();
            
            // 收入统计（简化版本，实际应该从订单金额计算）
            double totalRevenue = 0.0;
            double monthRevenue = 0.0;
            
            // 这里可以根据实际需求计算收入
            // 示例：获取已完成订单的总金额
            java.util.List<Order> completedOrderList = orderService.lambdaQuery()
                .eq(Order::getMerchantId, merchantId)
                .eq(Order::getStatus, OrderStatus.COMPLETED.getCode())
                .list();
            
            for (Order order : completedOrderList) {
                if (order.getTotalAmount() != null) {
                    totalRevenue += order.getTotalAmount().doubleValue();
                    
                    // 计算本月收入（简化处理）
                    if (order.getCreatedAt() != null && 
                        order.getCreatedAt().getMonth() == java.time.LocalDateTime.now().getMonth()) {
                        monthRevenue += order.getTotalAmount().doubleValue();
                    }
                }
            }
            
            stats.put("totalProducts", totalProducts);
            stats.put("onShelfProducts", onShelfProducts);
            stats.put("pendingAuditProducts", pendingAuditProducts);
            stats.put("totalOrders", totalOrders);
            stats.put("pendingOrders", pendingOrders);
            stats.put("inProgressOrders", inProgressOrders);
            stats.put("completedOrders", completedOrders);
            stats.put("totalRevenue", totalRevenue);
            stats.put("monthRevenue", monthRevenue);
            
            return Result.success(stats);
            
        } catch (Exception e) {
            return Result.error("获取统计数据失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取热门商品
     */
    @Operation(summary = "获取热门商品")
    @GetMapping("/{merchantId}/popular-products")
    public Result<java.util.List<Product>> getPopularProducts(@PathVariable Long merchantId) {
        try {
            // 简化版本：返回该商家的前5个商品
            java.util.List<Product> products = productService.lambdaQuery()
                .eq(Product::getMerchantId, merchantId)
                .eq(Product::getStatus, ProductStatus.ON_SHELF.getCode())
                .eq(Product::getAuditStatus, AuditStatus.APPROVED.getCode())
                .orderByDesc(Product::getCreatedAt)
                .last("LIMIT 5")
                .list();
            
            return Result.success(products);
        } catch (Exception e) {
            return Result.error("获取热门商品失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新商家认证信息（上传身份证和营业执照）
     */
    @Operation(summary = "更新商家认证信息")
    @PostMapping("/{merchantId}/certification")
    public Result<String> updateCertification(
            @PathVariable Long merchantId,
            @RequestParam(value = "idCardFront", required = false) MultipartFile idCardFront,
            @RequestParam(value = "idCardBack", required = false) MultipartFile idCardBack,
            @RequestParam(value = "businessLicense", required = false) MultipartFile businessLicense) {
        
        try {
            Merchant merchant = merchantService.getById(merchantId);
            if (merchant == null) {
                return Result.fail("商家不存在");
            }
            
            // 验证文件类型和大小
            String[] allowedTypes = {"image/", "application/pdf"};
            long maxSize = 10 * 1024 * 1024; // 10MB
            
            String idCardFrontUrl = merchant.getIdCardFront();
            String idCardBackUrl = merchant.getIdCardBack();
            String businessLicenseUrl = merchant.getBusinessLicense();
            
            // 更新身份证正面
            if (idCardFront != null && !idCardFront.isEmpty()) {
                if (!fileUploadService.isValidFileType(idCardFront, allowedTypes) ||
                    !fileUploadService.isValidFileSize(idCardFront, maxSize)) {
                    return Result.fail("身份证正面文件格式或大小不符合要求");
                }
                idCardFrontUrl = fileUploadService.uploadFile(idCardFront, "certificates");
            }
            
            // 更新身份证背面
            if (idCardBack != null && !idCardBack.isEmpty()) {
                if (!fileUploadService.isValidFileType(idCardBack, allowedTypes) ||
                    !fileUploadService.isValidFileSize(idCardBack, maxSize)) {
                    return Result.fail("身份证背面文件格式或大小不符合要求");
                }
                idCardBackUrl = fileUploadService.uploadFile(idCardBack, "certificates");
            }
            
            // 更新营业执照
            if (businessLicense != null && !businessLicense.isEmpty()) {
                if (!fileUploadService.isValidFileType(businessLicense, allowedTypes) ||
                    !fileUploadService.isValidFileSize(businessLicense, maxSize)) {
                    return Result.fail("营业执照文件格式或大小不符合要求");
                }
                businessLicenseUrl = fileUploadService.uploadFile(businessLicense, "certificates");
            }
            
            // 更新商家认证信息
            merchantService.updateCertification(merchantId, idCardFrontUrl, idCardBackUrl, businessLicenseUrl);
            
            return Result.success("认证信息更新成功");
            
        } catch (Exception e) {
            return Result.error("更新认证信息失败：" + e.getMessage());
        }
    }
} 