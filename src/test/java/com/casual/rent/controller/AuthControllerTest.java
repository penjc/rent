package com.casual.rent.controller;

import com.casual.rent.entity.User;
import com.casual.rent.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testUserRegister() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setPhone("13800138000");
        user.setNickname("测试用户");

        when(userService.findByPhone(anyString())).thenReturn(null);
        when(userService.register(anyString(), anyString(), anyString())).thenReturn(user);

        Map<String, Object> request = new HashMap<>();
        request.put("phone", "13800138000");
        request.put("password", "123456");
        request.put("nickname", "测试用户");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.phone").value("13800138000"));
    }

    @Test
    public void testUserLogin() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setPhone("13800138000");
        user.setNickname("测试用户");

        when(userService.login(anyString(), anyString())).thenReturn(user);

        Map<String, Object> request = new HashMap<>();
        request.put("phone", "13800138000");
        request.put("password", "123456");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.phone").value("13800138000"));
    }
} 