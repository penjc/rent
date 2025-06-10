package com.casual.rent.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 密码加密配置 - 已注释，改为明文存储
 */
@Configuration
public class PasswordConfig {
    
    /**
     * 密码加密器Bean - 已注释，不再使用加密
     */
    // @Bean
    // public PasswordEncoder passwordEncoder() {
    //     return new BCryptPasswordEncoder();
    // }
} 