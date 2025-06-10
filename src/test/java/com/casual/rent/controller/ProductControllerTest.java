package com.casual.rent.controller;

import com.casual.rent.entity.Product;
import com.casual.rent.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 商品控制器测试 - 重点测试按分类查询功能
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 测试按分类查询商品 - 核心功能
     */
    @Test
    public void testGetProductsByCategory() throws Exception {
        // 创建测试数据
        createTestProduct("iPhone 15 Pro", 1L, 1L);      // 数码产品
        createTestProduct("MacBook Pro", 1L, 1L);        // 数码产品
        createTestProduct("洗衣机", 2L, 1L);              // 家用电器

        // 查询分类ID为1的商品（数码产品）
        mockMvc.perform(get("/products")
                        .param("page", "1")
                        .param("size", "10")
                        .param("categoryId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.records").isArray());

        System.out.println("✅ 按分类查询商品测试通过");
    }

    /**
     * 测试查询不存在的分类
     */
    @Test
    public void testGetProductsByNonExistentCategory() throws Exception {
        // 创建测试数据
        createTestProduct("iPhone 15 Pro", 1L, 1L);

        // 查询分类ID为999的商品（不存在的分类）
        mockMvc.perform(get("/products")
                        .param("page", "1")
                        .param("size", "10")
                        .param("categoryId", "999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.records").isArray())
                .andExpect(jsonPath("$.data.total").value(0));

        System.out.println("✅ 查询不存在分类测试通过");
    }

    /**
     * 测试获取商品列表 - 不带分类筛选
     */
    @Test
    public void testGetAllProducts() throws Exception {
        // 创建测试数据
        createTestProduct("iPhone 15 Pro", 1L, 1L);
        createTestProduct("洗衣机", 2L, 1L);

        mockMvc.perform(get("/products")
                        .param("page", "1")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.records").isArray());

        System.out.println("✅ 获取所有商品测试通过");
    }

    /**
     * 测试获取单个商品详情
     */
    @Test
    public void testGetProductById() throws Exception {
        // 创建测试商品
        Product product = createTestProduct("iPhone 15 Pro", 1L, 1L);

        mockMvc.perform(get("/products/{id}", product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.name").value("iPhone 15 Pro"))
                .andExpect(jsonPath("$.data.categoryId").value(1));

        System.out.println("✅ 获取商品详情测试通过");
    }

    /**
     * 测试创建商品
     */
    @Test
    public void testCreateProduct() throws Exception {
        Product product = new Product();
        product.setMerchantId(1L);
        product.setCategoryId(1L);
        product.setName("iPad Pro");
        product.setDescription("全新iPad Pro");
        product.setImages("[\"image1.jpg\",\"image2.jpg\"]");
        product.setDailyPrice(new BigDecimal("80.00"));
        product.setWeeklyPrice(new BigDecimal("480.00"));
        product.setMonthlyPrice(new BigDecimal("1600.00"));
        product.setDeposit(new BigDecimal("2500.00"));
        product.setStock(5);

        mockMvc.perform(post("/products")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(product)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.name").value("iPad Pro"))
                .andExpect(jsonPath("$.data.categoryId").value(1));

        System.out.println("✅ 创建商品测试通过");
    }

    /**
     * 创建单个测试商品
     */
    private Product createTestProduct(String name, Long categoryId, Long merchantId) {
        Product product = new Product();
        product.setMerchantId(merchantId);
        product.setCategoryId(categoryId);
        product.setName(name);
        product.setDescription("Test description for " + name);
        product.setImages("[\"test1.jpg\",\"test2.jpg\"]");
        product.setDailyPrice(new BigDecimal("100.00"));
        product.setWeeklyPrice(new BigDecimal("600.00"));
        product.setMonthlyPrice(new BigDecimal("2000.00"));
        product.setDeposit(new BigDecimal("3000.00"));
        product.setStock(10);
        product.setStatus(1); // 上架状态
        product.setAuditStatus(1); // 已审核通过
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        productService.save(product);
        return product;
    }
} 