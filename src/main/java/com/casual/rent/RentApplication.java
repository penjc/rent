package com.casual.rent;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.casual.rent.mapper")
public class RentApplication {

    public static void main(String[] args) {
        SpringApplication.run(RentApplication.class, args);
        System.out.println("===========================================");
        System.out.println("Casual Rent启动成功！");
        System.out.println("用户端访问地址: http://localhost:8080/api");
        System.out.println("管理后台访问地址: http://localhost:8080/api/admin");
        System.out.println("===========================================");
    }
} 