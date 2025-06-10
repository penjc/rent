package com.casual.rent.controller;

import com.casual.rent.common.Result;
import org.springframework.web.bind.annotation.*;

/**
 * 测试控制器
 */
@RestController
@RequestMapping("/test")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class TestController {
    
    @GetMapping("/hello")
    public Result<String> hello() {
        return Result.success("C2C租赁平台启动成功！");
    }
    
    @GetMapping("/status")
    public Result<Object> status() {
        return Result.success("系统运行正常", new Object() {
            public String message = "C2C租赁平台后台服务运行中";
            public long timestamp = System.currentTimeMillis();
            public String version = "1.0.0";
        });
    }
} 