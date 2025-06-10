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
public class OrderControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Long testOrderId;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();

        // 创建测试订单
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("userId", 1L);
        orderData.put("productId", 1L);
        orderData.put("days", 7);
        orderData.put("startDate", "2024-01-01");

        String response =         mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderData)))
                .andReturn().getResponse().getContentAsString();

        testOrderId = 1L; // 简化处理
    }

    @Test
    void testCreateOrder() throws Exception {
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("userId", 1L);
        orderData.put("productId", 1L);
        orderData.put("days", 7);
        orderData.put("startDate", "2024-01-15");

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"));

        System.out.println("✅ 创建订单测试通过");
    }

    @Test
    void testPayOrder() throws Exception {
        Map<String, Object> payData = new HashMap<>();
        payData.put("userId", 1L);

        mockMvc.perform(post("/orders/" + testOrderId + "/pay")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"));

        System.out.println("✅ 支付订单测试通过");
    }
} 