package com.casual.rent.controller;

import com.casual.rent.entity.Merchant;
import com.casual.rent.service.MerchantService;
import com.casual.rent.service.OrderService;
import com.casual.rent.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
public class MerchantControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockBean
    private MerchantService merchantService;

    @MockBean
    private ProductService productService;

    @MockBean
    private OrderService orderService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Long testMerchantId;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();

        // 注册测试商家
        Map<String, Object> merchantData = new HashMap<>();
        merchantData.put("phone", "13900139007");
        merchantData.put("companyName", "测试租赁公司");
        merchantData.put("contactName", "李四");
        merchantData.put("idCardFront", "front.jpg");
        merchantData.put("idCardBack", "back.jpg");

        mockMvc.perform(post("/merchant/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(merchantData)));

        testMerchantId = 1L; // 简化处理
    }

    @Test
    void testMerchantRegister() throws Exception {
        Map<String, Object> merchantData = new HashMap<>();
        merchantData.put("phone", "13900139006");
        merchantData.put("companyName", "新测试租赁公司");
        merchantData.put("contactName", "王五");
        merchantData.put("idCardFront", "front2.jpg");
        merchantData.put("idCardBack", "back2.jpg");

        mockMvc.perform(post("/merchant/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(merchantData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"));

        System.out.println("✅ 商家注册测试通过");
    }

    @Test
    void testGetMerchantInfo() throws Exception {
        mockMvc.perform(get("/merchant/info/13900139007"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());

        System.out.println("✅ 获取商家信息测试通过");
    }

    @Test
    void testPublishProduct() throws Exception {
        Map<String, Object> productData = new HashMap<>();
        productData.put("merchantId", testMerchantId);
        productData.put("categoryId", 1L);
        productData.put("name", "测试商品");
        productData.put("description", "这是一个测试商品");
        productData.put("images", "[\"image1.jpg\"]");
        productData.put("dailyPrice", 50.0);
        productData.put("weeklyPrice", 300.0);
        productData.put("monthlyPrice", 1000.0);
        productData.put("deposit", 500.0);
        productData.put("stock", 1);

        mockMvc.perform(post("/merchant/product")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("操作成功"));

        System.out.println("✅ 发布商品测试通过");
    }

    @Test
    void testGetMerchantProducts() throws Exception {
        mockMvc.perform(get("/merchant/products/" + testMerchantId)
                .param("page", "1")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());

        System.out.println("✅ 获取商家商品列表测试通过");
    }

    @Test
    void testUpdateProductStatus() throws Exception {
        Map<String, Object> statusData = new HashMap<>();
        statusData.put("status", 1);
        statusData.put("merchantId", testMerchantId);

        mockMvc.perform(put("/merchant/product/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        System.out.println("✅ 更新商品状态测试通过");
    }

    @Test
    void testGetMerchantOrders() throws Exception {
        mockMvc.perform(get("/merchant/orders/" + testMerchantId)
                .param("page", "1")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists());

        System.out.println("✅ 获取商家订单测试通过");
    }

    @Test
    void testConfirmShipment() throws Exception {
        Map<String, Object> shipData = new HashMap<>();
        shipData.put("merchantId", testMerchantId);

        mockMvc.perform(put("/merchant/order/1/ship")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(shipData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        System.out.println("✅ 确认发货测试通过");
    }

    @Test
    void testConfirmReturn() throws Exception {
        Map<String, Object> returnData = new HashMap<>();
        returnData.put("merchantId", testMerchantId);

        mockMvc.perform(put("/merchant/order/1/return")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(returnData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        System.out.println("✅ 确认收回测试通过");
    }

    @Test
    public void testMerchantLogin() throws Exception {
        Merchant merchant = new Merchant();
        merchant.setId(1L);
        merchant.setPhone("13900139000");
        merchant.setContactName("测试商家");

        when(merchantService.login(anyString(), anyString())).thenReturn(merchant);

        Map<String, Object> request = new HashMap<>();
        request.put("phone", "13900139000");
        request.put("password", "123456");

        mockMvc.perform(post("/merchant/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.phone").value("13900139000"));
    }

    @Test
    public void testMerchantLoginFailed() throws Exception {
        when(merchantService.login(anyString(), anyString())).thenReturn(null);

        Map<String, Object> request = new HashMap<>();
        request.put("phone", "13900139000");
        request.put("password", "wrongpassword");

        mockMvc.perform(post("/merchant/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("手机号或密码错误"));
    }
} 