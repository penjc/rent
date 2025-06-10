package com.casual.rent.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.casual.rent.common.Result;
import com.casual.rent.entity.Order;
import com.casual.rent.entity.User;
import com.casual.rent.service.OrderService;
import com.casual.rent.service.UserService;
import com.casual.rent.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private FileUploadService fileUploadService;
    
    /**
     * 获取用户信息
     */
    @GetMapping("/profile/{userId}")
    public Result<User> getProfile(@PathVariable Long userId) {
        User user = userService.getById(userId);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        return Result.success(user);
    }
    
    /**
     * 上传头像
     */
    @PostMapping("/avatar/{userId}")
    public Result<?> uploadAvatar(@PathVariable Long userId, 
                                 @RequestParam("avatar") MultipartFile avatar) {
        try {
            // 验证文件
            if (avatar.isEmpty()) {
                return Result.error("头像文件不能为空");
            }
            
            String[] allowedTypes = {"image/"};
            long maxSize = 5 * 1024 * 1024; // 5MB
            
            if (!fileUploadService.isValidFileType(avatar, allowedTypes)) {
                return Result.error("只支持图片文件");
            }
            
            if (!fileUploadService.isValidFileSize(avatar, maxSize)) {
                return Result.error("图片大小不能超过5MB");
            }
            
            // 上传头像到腾讯云OSS
            String avatarUrl = fileUploadService.uploadFile(avatar, "avatars");
            
            // 更新用户头像URL
            User user = userService.getById(userId);
            if (user == null) {
                return Result.error("用户不存在");
            }
            
            user.setAvatar(avatarUrl);
            userService.updateById(user);
            
            Map<String, Object> result = new HashMap<>();
            result.put("avatarUrl", avatarUrl);
            result.put("message", "头像上传成功");
            
            return Result.success(result);
            
        } catch (Exception e) {
            return Result.error("头像上传失败：" + e.getMessage());
        }
    }

    /**
     * 更新用户信息（支持头像）
     */
    @PutMapping("/profile-with-avatar/{userId}")
    public Result<String> updateProfileWithAvatar(
            @PathVariable Long userId,
            @RequestParam(value = "nickname", required = false) String nickname,
            @RequestParam(value = "realName", required = false) String realName,
            @RequestParam(value = "idCard", required = false) String idCard,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar) {
        
        try {
            User user = userService.getById(userId);
            if (user == null) {
                return Result.error("用户不存在");
            }
            
            // 处理头像上传
            if (avatar != null && !avatar.isEmpty()) {
                String[] allowedTypes = {"image/"};
                long maxSize = 5 * 1024 * 1024; // 5MB
                
                if (!fileUploadService.isValidFileType(avatar, allowedTypes)) {
                    return Result.error("只支持图片文件");
                }
                
                if (!fileUploadService.isValidFileSize(avatar, maxSize)) {
                    return Result.error("图片大小不能超过5MB");
                }
                
                String avatarUrl = fileUploadService.uploadFile(avatar, "avatars");
                user.setAvatar(avatarUrl);
            }
            
            // 更新其他信息
            if (nickname != null) {
                user.setNickname(nickname);
            }
            if (realName != null) {
                user.setRealName(realName);
            }
            if (idCard != null) {
                user.setIdCard(idCard);
            }
            
            userService.updateById(user);
            return Result.success("更新成功");
            
        } catch (Exception e) {
            return Result.error("更新失败：" + e.getMessage());
        }
    }

    /**
     * 更新用户信息（原JSON格式，保持向后兼容）
     */
    @PutMapping("/profile/{userId}")
    public Result<String> updateProfile(@PathVariable Long userId, @RequestBody Map<String, Object> params) {
        String nickname = (String) params.get("nickname");
        String realName = (String) params.get("realName");
        String idCard = (String) params.get("idCard");
        
        userService.updateProfile(userId, nickname, realName, idCard);
        return Result.success("更新成功");
    }
    
    /**
     * 获取我的订单
     */
    @GetMapping("/orders/{userId}")
    public Result<IPage<Order>> getMyOrders(@PathVariable Long userId,
                                          @RequestParam(defaultValue = "1") int page,
                                          @RequestParam(defaultValue = "10") int size,
                                          @RequestParam(required = false) Integer status) {
        IPage<Order> orders = orderService.getUserOrders(page, size, userId, status);
        return Result.success(orders);
    }
} 