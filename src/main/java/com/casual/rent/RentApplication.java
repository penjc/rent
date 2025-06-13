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
        System.out.println("Casual Rent 后端启动成功！");
        System.out.println("接口文档地址：http://localhost:8080/api/swagger-ui.html");
        System.out.println("===========================================");
    }
} 