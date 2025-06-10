package com.casual.rent.controller;

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
public class AdminControllerTest {

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
    void testAdminLogin() throws Exception {
        Map<String, Object> loginData = new HashMap<>();
        loginData.put("username", "admin");
        loginData.put("password", "123456");

        mockMvc.perform(post("/admin/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"));

        System.out.println("✅ 管理员登录测试通过");
    }

    @Test
    void testGetPendingMerchants() throws Exception {
        mockMvc.perform(get("/admin/merchants/pending")
                .param("page", "1")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());

        System.out.println("✅ 获取待审核商家列表测试通过");
    }

    @Test
    void testAuditMerchant() throws Exception {
        Map<String, Object> auditData = new HashMap<>();
        auditData.put("status", 1);
        auditData.put("remark", "审核通过");

        mockMvc.perform(put("/admin/merchants/1/audit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(auditData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"));

        System.out.println("✅ 审核商家测试通过");
    }

    @Test
    void testGetPendingProducts() throws Exception {
        mockMvc.perform(get("/admin/products/pending")
                .param("page", "1")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());

        System.out.println("✅ 获取待审核商品列表测试通过");
    }

    @Test
    void testAuditProduct() throws Exception {
        Map<String, Object> auditData = new HashMap<>();
        auditData.put("auditStatus", 1);
        auditData.put("auditRemark", "商品审核通过");

        mockMvc.perform(put("/admin/products/1/audit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(auditData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"));

        System.out.println("✅ 审核商品测试通过");
    }

    @Test
    void testGetAllOrders() throws Exception {
        mockMvc.perform(get("/admin/orders")
                .param("page", "1")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());

        System.out.println("✅ 获取所有订单测试通过");
    }

    @Test
    void testUpdateOrderStatus() throws Exception {
        Map<String, Object> statusData = new HashMap<>();
        statusData.put("status", 3);

        mockMvc.perform(put("/admin/orders/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"));

        System.out.println("✅ 更新订单状态测试通过");
    }
} 