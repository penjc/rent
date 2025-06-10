package com.casual.rent.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
public class BusinessFlowIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testCompleteBusinessFlow() throws Exception {
        System.out.println("🚀 开始完整业务流程测试...");

        // 1. 用户注册
        System.out.println("📝 步骤1: 用户注册");
        Map<String, Object> userRegisterData = new HashMap<>();
        userRegisterData.put("phone", "13900139999");
        userRegisterData.put("password", "123456");
        userRegisterData.put("nickname", "测试用户");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userRegisterData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 2. 商家注册
        System.out.println("🏪 步骤2: 商家注册");
        Map<String, Object> merchantRegisterData = new HashMap<>();
        merchantRegisterData.put("phone", "13900138888");
        merchantRegisterData.put("companyName", "测试租赁公司");
        merchantRegisterData.put("contactName", "商家测试");
        merchantRegisterData.put("idCardFront", "front.jpg");
        merchantRegisterData.put("idCardBack", "back.jpg");

        mockMvc.perform(post("/merchant/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(merchantRegisterData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 3. 管理员审核商家
        System.out.println("✅ 步骤3: 管理员审核商家");
        Map<String, Object> merchantAuditData = new HashMap<>();
        merchantAuditData.put("status", 1);
        merchantAuditData.put("remark", "审核通过");

        mockMvc.perform(put("/admin/merchants/1/audit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(merchantAuditData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 4. 商家发布商品
        System.out.println("📦 步骤4: 商家发布商品");
        Map<String, Object> productData = new HashMap<>();
        productData.put("merchantId", 1L);
        productData.put("categoryId", 1L);
        productData.put("name", "iPhone 15 Pro");
        productData.put("description", "全新iPhone 15 Pro，256GB");
        productData.put("images", "[\"iphone1.jpg\",\"iphone2.jpg\"]");
        productData.put("dailyPrice", 100.0);
        productData.put("weeklyPrice", 600.0);
        productData.put("monthlyPrice", 2000.0);
        productData.put("deposit", 3000.0);
        productData.put("stock", 1);

        mockMvc.perform(post("/merchant/product")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 5. 管理员审核商品
        System.out.println("✅ 步骤5: 管理员审核商品");
        Map<String, Object> productAuditData = new HashMap<>();
        productAuditData.put("auditStatus", 1);
        productAuditData.put("auditRemark", "商品审核通过");

        mockMvc.perform(put("/admin/products/1/audit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productAuditData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 6. 用户浏览商品
        System.out.println("👀 步骤6: 用户浏览商品");
        mockMvc.perform(get("/products")
                .param("page", "1")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 7. 用户创建订单
        System.out.println("🛒 步骤7: 用户创建订单");
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("userId", 1L);
        orderData.put("productId", 1L);
        orderData.put("days", 7);
        orderData.put("startDate", "2024-01-01");

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 8. 用户支付订单
        System.out.println("💳 步骤8: 用户支付订单");
        Map<String, Object> payData = new HashMap<>();
        payData.put("userId", 1L);

        mockMvc.perform(post("/orders/1/pay")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 9. 商家确认发货
        System.out.println("🚚 步骤9: 商家确认发货");
        Map<String, Object> shipData = new HashMap<>();
        shipData.put("merchantId", 1L);

        mockMvc.perform(put("/merchant/order/1/ship")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(shipData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 10. 商家确认收回
        System.out.println("📬 步骤10: 商家确认收回");
        Map<String, Object> returnData = new HashMap<>();
        returnData.put("merchantId", 1L);

        mockMvc.perform(put("/merchant/order/1/return")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(returnData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        System.out.println("🎉 完整业务流程测试成功！");
    }
} 