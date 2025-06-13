package com.casual.rent.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.casual.rent.common.Result;
import com.casual.rent.common.VerificationStatus;
import com.casual.rent.entity.Order;
import com.casual.rent.entity.User;
import com.casual.rent.service.OrderService;
import com.casual.rent.service.UserService;
import com.casual.rent.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户控制器
 */
@Tag(name = "用户接口")
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
    @Operation(summary = "获取用户信息")
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
    @Operation(summary = "上传头像")
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
    @Operation(summary = "更新用户信息(含头像)")
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
    @Operation(summary = "更新用户信息(JSON)")
    @PutMapping("/profile/{userId}")
    public Result<String> updateProfile(@PathVariable Long userId, @RequestBody Map<String, Object> params) {
        String nickname = (String) params.get("nickname");
        String realName = (String) params.get("realName");
        String idCard = (String) params.get("idCard");
        
        userService.updateProfile(userId, nickname, realName, idCard);
        return Result.success("更新成功");
    }
    
    /**
     * 用户身份认证 - 上传身份证
     */
    @Operation(summary = "用户身份认证")
    @PostMapping("/certification/{userId}")
    public Result<?> uploadCertification(@PathVariable Long userId,
                                        @RequestParam(value = "idCardFront", required = false) MultipartFile idCardFront,
                                        @RequestParam(value = "idCardBack", required = false) MultipartFile idCardBack,
                                        @RequestParam(value = "realName", required = false) String realName,
                                        @RequestParam(value = "idCard", required = false) String idCard) {
        try {
            User user = userService.getById(userId);
            if (user == null) {
                return Result.error("用户不存在");
            }
            
            String[] allowedTypes = {"image/", "application/pdf"};
            long maxSize = 10 * 1024 * 1024; // 10MB
            
            // 处理身份证正面
            if (idCardFront != null && !idCardFront.isEmpty()) {
                if (!fileUploadService.isValidFileType(idCardFront, allowedTypes) ||
                    !fileUploadService.isValidFileSize(idCardFront, maxSize)) {
                    return Result.error("身份证正面文件格式或大小不符合要求");
                }
                String idCardFrontUrl = fileUploadService.uploadFile(idCardFront, "certificates");
                user.setIdCardFront(idCardFrontUrl);
            }
            
            // 处理身份证反面
            if (idCardBack != null && !idCardBack.isEmpty()) {
                if (!fileUploadService.isValidFileType(idCardBack, allowedTypes) ||
                    !fileUploadService.isValidFileSize(idCardBack, maxSize)) {
                    return Result.error("身份证反面文件格式或大小不符合要求");
                }
                String idCardBackUrl = fileUploadService.uploadFile(idCardBack, "certificates");
                user.setIdCardBack(idCardBackUrl);
            }
            
            // 更新其他信息
            if (realName != null && !realName.trim().isEmpty()) {
                user.setRealName(realName.trim());
            }
            if (idCard != null && !idCard.trim().isEmpty()) {
                user.setIdCard(idCard.trim());
            }
            
            // 如果提交了认证材料，设置为待验证状态
            if ((idCardFront != null && !idCardFront.isEmpty()) || 
                (idCardBack != null && !idCardBack.isEmpty())) {
                user.setVerified(VerificationStatus.PENDING.getCode()); // 重新设置为待审核状态
            }
            
            userService.updateById(user);
            return Result.success("认证信息提交成功，请等待管理员审核");
            
        } catch (Exception e) {
            return Result.error("认证信息提交失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取用户认证状态
     */
    @Operation(summary = "获取用户认证状态")
    @GetMapping("/certification/status/{userId}")
    public Result<Map<String, Object>> getCertificationStatus(@PathVariable Long userId) {
        User user = userService.getById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("verified", user.getVerified());
        result.put("realName", user.getRealName());
        result.put("idCard", user.getIdCard());
        result.put("idCardFront", user.getIdCardFront());
        result.put("idCardBack", user.getIdCardBack());
        
        return Result.success(result);
    }
    
    /**
     * 获取我的订单
     */
    @Operation(summary = "获取我的订单")
    @GetMapping("/orders/{userId}")
    public Result<IPage<Order>> getMyOrders(@PathVariable Long userId,
                                          @RequestParam(defaultValue = "1") int page,
                                          @RequestParam(defaultValue = "10") int size,
                                          @RequestParam(required = false) Integer status) {
        IPage<Order> orders = orderService.getUserOrders(page, size, userId, status);
        return Result.success(orders);
    }

    @GetMapping("/nicknames")
    @Operation(summary = "批量获取用户昵称", description = "根据用户ID列表获取对应的用户昵称")
    public Result<Map<Long, String>> getUserNicknames(
            @Parameter(description = "用户ID列表，用逗号分隔") @RequestParam List<Long> userIds) {
        Map<Long, String> nicknames = userService.getUserNicknames(userIds);
        return Result.success(nicknames);
    }
} 