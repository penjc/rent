package com.casual.rent.controller;

import com.casual.rent.common.Result;
import com.casual.rent.entity.User;
import com.casual.rent.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;

/**
 * 用户认证控制器
 */
@Tag(name = "用户认证接口")
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 用户注册
     */
    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public Result<User> register(@RequestBody Map<String, Object> params) {
        String phone = (String) params.get("phone");
        String password = (String) params.get("password");
        String nickname = (String) params.get("nickname");
        
        if (phone == null || password == null) {
            return Result.fail("手机号和密码不能为空");
        }
        
        if (password.length() < 6) {
            return Result.fail("密码长度不能少于6位");
        }
        
        // 检查用户是否已存在
        User existUser = userService.findByPhone(phone);
        if (existUser != null) {
            return Result.fail("该手机号已注册");
        }
        
        // 注册用户
        User user = userService.register(phone, password, nickname != null ? nickname : "用户" + phone.substring(7));
        return Result.success(user);
    }
    
    /**
     * 用户登录
     */
    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public Result<User> login(@RequestBody Map<String, Object> params) {
        String phone = (String) params.get("phone");
        String password = (String) params.get("password");
        
        if (phone == null || password == null) {
            return Result.fail("手机号和密码不能为空");
        }
        
        // 验证用户名密码
        User user = userService.login(phone, password);
        if (user == null) {
            return Result.fail("手机号或密码错误");
        }
        
        return Result.success(user);
    }
} 