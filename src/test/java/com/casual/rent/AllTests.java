package com.casual.rent;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class AllTests {

    @Test
    void runAllTests() {
        System.out.println("🚀 开始运行所有测试...");
        // 这个类主要用于确保测试环境正常工作
        // 具体的测试由各个测试类独立执行
    }
} 