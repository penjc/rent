package com.casual.rent.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.casual.rent.common.Result;
import com.casual.rent.common.ProductStatus;
import com.casual.rent.common.AuditStatus;
import com.casual.rent.common.VerificationStatus;
import com.casual.rent.entity.Product;
import com.casual.rent.entity.Merchant;
import com.casual.rent.entity.Address;
import com.casual.rent.service.ProductService;
import com.casual.rent.service.MerchantService;
import com.casual.rent.service.FileUploadService;
import com.casual.rent.service.AddressService;
import com.casual.rent.common.AddressOwnerType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

/**
 * 商品控制器
 */
@Tag(name = "商品接口")
@RestController
@RequestMapping("/products")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private MerchantService merchantService;
    
    @Autowired
    private FileUploadService fileUploadService;
    
    @Autowired
    private AddressService addressService;
    
    /**
     * 分页查询商品列表
     */
    @Operation(summary = "分页查询商品列表")
    @GetMapping
    public Result<IPage<Product>> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "created_desc") String sortBy) {
        
        IPage<Product> productPage = productService.getProductPage(page, size, categoryId, name, sortBy);
        return Result.success(productPage);
    }
    
    /**
     * 根据ID获取商品详情
     */
    @Operation(summary = "根据ID获取商品详情")
    @GetMapping("/{id}")
    public Result<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getById(id);
        if (product == null) {
            return Result.notFound();
        }
        return Result.success(product);
    }
    
    /**
     * 商家查询自己的商品
     */
    @Operation(summary = "商家查询自己的商品")
    @GetMapping("/merchant/{merchantId}")
    public Result<IPage<Product>> getProductsByMerchant(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        IPage<Product> productPage = productService.getProductsByMerchant(page, size, merchantId);
        return Result.success(productPage);
    }
    
    /**
     * 获取商家默认地址
     */
    @Operation(summary = "获取商家默认地址")
    @GetMapping("/default-address/{merchantId}")
    public Result<Address> getMerchantDefaultAddress(@PathVariable Long merchantId) {
        Address defaultAddress = addressService.getDefaultAddress(merchantId, AddressOwnerType.MERCHANT);
        return Result.success(defaultAddress);
    }
    
    /**
     * 创建商品（支持文件上传）
     */
    @Operation(summary = "创建商品（上传图片）")
    @PostMapping("/with-images")
    public Result<Product> createProductWithImages(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("dailyPrice") Double dailyPrice,
            @RequestParam("weeklyPrice") Double weeklyPrice,
            @RequestParam("monthlyPrice") Double monthlyPrice,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("merchantId") Long merchantId,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "merchantAddressId", required = false) String merchantAddressIdStr,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        
        try {
            // 处理地址ID参数
            Long merchantAddressId = null;
            if (merchantAddressIdStr != null && !merchantAddressIdStr.trim().isEmpty()) {
                try {
                    merchantAddressId = Long.parseLong(merchantAddressIdStr.trim());
                } catch (NumberFormatException e) {
                    System.out.println("地址ID格式错误: " + merchantAddressIdStr);
                }
            }
            
            // 调试日志
            System.out.println("接收到的地址ID字符串: " + merchantAddressIdStr);
            System.out.println("解析后的地址ID: " + merchantAddressId);
            
            // 检查商家认证状态
            Merchant merchant = merchantService.getById(merchantId);
            if (merchant == null) {
                return Result.fail("商家不存在");
            }
            if (!merchant.getStatus().equals(VerificationStatus.VERIFIED.getCode())) {
                return Result.fail("商家认证状态未通过，无法发布商品。请先完成商家认证");
            }
            // 创建商品对象
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setDailyPrice(BigDecimal.valueOf(dailyPrice));
            product.setWeeklyPrice(BigDecimal.valueOf(weeklyPrice));
            product.setMonthlyPrice(BigDecimal.valueOf(monthlyPrice));
            product.setCategoryId(categoryId);
            product.setMerchantId(merchantId);
            product.setStock(stock);
            product.setMerchantAddressId(merchantAddressId);
            
            // 调试日志
            System.out.println("设置商品地址ID: " + product.getMerchantAddressId());
            
            product.setStatus(ProductStatus.OFF_SHELF.getCode()); // 发布时下架状态
            product.setAuditStatus(AuditStatus.PENDING.getCode()); // 待审核
            product.setCreatedAt(LocalDateTime.now());
            product.setUpdatedAt(LocalDateTime.now());
            
            // 处理图片上传
            if (images != null && images.length > 0) {
                // 验证图片
                String[] allowedTypes = {"image/"};
                long maxSize = 5 * 1024 * 1024; // 5MB
                
                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        if (!fileUploadService.isValidFileType(image, allowedTypes)) {
                            return Result.fail("只支持图片文件：" + image.getOriginalFilename());
                        }
                        if (!fileUploadService.isValidFileSize(image, maxSize)) {
                            return Result.fail("图片大小不能超过5MB：" + image.getOriginalFilename());
                        }
                    }
                }
                
                // 上传图片到腾讯云OSS
                String[] imageUrls = fileUploadService.uploadFiles(images, "products");
                
                // 将图片URL数组转换为JSON字符串存储
                product.setImages(Arrays.toString(imageUrls));
            }
            
            // 保存商品
            productService.save(product);
            return Result.success(product);
            
        } catch (Exception e) {
            return Result.error("创建商品失败：" + e.getMessage());
        }
    }
    
    /**
     * 创建商品（原JSON格式，保持向后兼容）
     */
    @Operation(summary = "创建商品（兼容JSON）")
    @PostMapping
    public Result<Product> createProduct(@RequestBody Product product) {
        // 检查商家认证状态
        if (product.getMerchantId() == null) {
            return Result.fail("商家ID不能为空");
        }
        
        Merchant merchant = merchantService.getById(product.getMerchantId());
        if (merchant == null) {
            return Result.fail("商家不存在");
        }
        if (!merchant.getStatus().equals(VerificationStatus.VERIFIED.getCode())) {
            return Result.fail("商家认证状态未通过，无法发布商品。请先完成商家认证");
        }
        
        // 设置默认值
        if (product.getStatus() == null) {
            product.setStatus(ProductStatus.OFF_SHELF.getCode());
        }
        if (product.getAuditStatus() == null) {
            product.setAuditStatus(AuditStatus.PENDING.getCode());
        }
        
        // 设置时间戳
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        
        productService.save(product);
        return Result.success(product);
    }
    
    /**
     * 更新商品
     */
    @Operation(summary = "更新商品")
    @PutMapping("/{id}")
    public Result<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        // 获取原商品信息
        Product existingProduct = productService.getById(id);
        if (existingProduct == null) {
            return Result.fail("商品不存在");
        }
        
        // 检查商家认证状态
        Merchant merchant = merchantService.getById(existingProduct.getMerchantId());
        if (merchant == null) {
            return Result.fail("商家不存在");
        }
        if (!merchant.getStatus().equals(VerificationStatus.VERIFIED.getCode())) {
            return Result.fail("商家认证状态未通过，无法更新商品。请先完成商家认证");
        }
        
        product.setId(id);
        product.setUpdatedAt(LocalDateTime.now());
        productService.updateById(product);
        return Result.success(product);
    }
    
    /**
     * 删除商品
     */
    @Operation(summary = "删除商品")
    @DeleteMapping("/{id}")
    public Result<String> deleteProduct(@PathVariable Long id, @RequestParam Long merchantId) {
        // 验证商品是否属于该商家
        Product product = productService.getById(id);
        if (product == null) {
            return Result.fail("商品不存在");
        }
        
        if (!product.getMerchantId().equals(merchantId)) {
            return Result.fail("无权删除此商品");
        }
        
        productService.removeById(id);
        return Result.success("商品删除成功");
    }
} 