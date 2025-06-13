package com.casual.rent.controller;

import com.casual.rent.common.Result;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * 测试控制器
 */
@Tag(name = "测试接口")
@RestController
@RequestMapping("/test")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class TestController {
    
    @Operation(summary = "测试接口是否可用")
    @GetMapping("/hello")
    public Result<String> hello() {
        return Result.success("Casual Rent 启动成功！");
    }
    
    @Operation(summary = "获取系统运行状态")
    @GetMapping("/status")
    public Result<Object> status() {
        return Result.success("系统运行正常", new Object() {
            public String message = "Casual Rent 后台服务运行中";
            public long timestamp = System.currentTimeMillis();
            public String version = "1.0.0";
        });
    }
} 