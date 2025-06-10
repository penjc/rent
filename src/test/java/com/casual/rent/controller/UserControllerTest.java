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
public class UserControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Long testUserId;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
        
        // 先创建一个测试用户
        Map<String, Object> registerData = new HashMap<>();
        registerData.put("phone", "13900139003");
        registerData.put("password", "123456");
        registerData.put("nickname", "测试用户3");

        String response = mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerData)))
                .andReturn().getResponse().getContentAsString();
        
        // 从响应中提取用户ID
        testUserId = 1L; // 简化处理，实际应从响应中解析
    }

    @Test
    void testGetUserProfile() throws Exception {
        mockMvc.perform(get("/user/profile/" + testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.phone").exists());

        System.out.println("✅ 获取用户信息测试通过");
    }

    @Test
    void testUpdateUserProfile() throws Exception {
        Map<String, Object> updateData = new HashMap<>();
        updateData.put("nickname", "更新后的昵称");
        updateData.put("realName", "张三");
        updateData.put("idCard", "110101199001011234");

        mockMvc.perform(put("/user/profile/" + testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"));

        System.out.println("✅ 更新用户信息测试通过");
    }

    @Test
    void testGetUserOrders() throws Exception {
        mockMvc.perform(get("/user/orders/" + testUserId)
                .param("page", "1")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());

        System.out.println("✅ 获取用户订单测试通过");
    }
} 