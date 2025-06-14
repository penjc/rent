package com.casual.rent.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.common.UserStatus;
import com.casual.rent.common.VerificationStatus;
import com.casual.rent.entity.User;
import com.casual.rent.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 用户服务
 */
@Service
public class UserService extends ServiceImpl<UserMapper, User> {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * 根据手机号查找用户
     */
    public User findByPhone(String phone) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("phone", phone);
        return getOne(wrapper);
    }
    
    /**
     * 用户注册
     */
    public User register(String phone, String password, String nickname) {
        User user = new User();
        user.setPhone(phone);
        // 使用PasswordEncoder加密密码
        user.setPassword(passwordEncoder.encode(password));
        user.setNickname(nickname);
        user.setStatus(UserStatus.ACTIVE.getCode()); // 默认激活
        user.setVerified(VerificationStatus.NOT_VERIFIED.getCode()); // 注册后为未认证状态
        save(user);
        return user;
    }
    
    /**
     * 用户登录
     */
    public User login(String phone, String password) {
        User user = findByPhone(phone);
        if (user != null) {
            // 使用PasswordEncoder验证密码
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
        }
        return null;
    }
    
    /**
     * 更新用户头像
     */
    public void updateAvatar(Long userId, String avatarUrl) {
        User user = getById(userId);
        if (user != null) {
            user.setAvatar(avatarUrl);
            updateById(user);
        }
    }
    
    /**
     * 更新用户信息
     */
    public User updateUserInfo(Long userId, String nickname, String avatarUrl) {
        User user = getById(userId);
        if (user != null) {
            if (nickname != null) {
                user.setNickname(nickname);
            }
            if (avatarUrl != null) {
                user.setAvatar(avatarUrl);
            }
            updateById(user);
        }
        return user;
    }

    /**
     * 更新用户个人资料
     */
    public void updateProfile(Long userId, String nickname, String realName, String idCard) {
        User user = getById(userId);
        if (user != null) {
            // 更新昵称
            if (nickname != null && !nickname.trim().isEmpty()) {
                user.setNickname(nickname.trim());
            }
            
            // 更新真实姓名
            if (realName != null && !realName.trim().isEmpty()) {
                user.setRealName(realName.trim());
            }
            
            // 更新身份证号
            if (idCard != null && !idCard.trim().isEmpty()) {
                user.setIdCard(idCard.trim());
                // 如果填写了身份证号，设置为已实名认证
                user.setVerified(VerificationStatus.VERIFIED.getCode());
            }
            
            // 保存更新
            updateById(user);
        }
    }
    
    /**
     * 管理员获取用户列表
     */
    public IPage<User> getUsers(int page, int size, String phone, Integer verified, Integer status) {
        Page<User> pageParam = new Page<>(page, size);
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        
        if (phone != null && !phone.trim().isEmpty()) {
            wrapper.like("phone", phone.trim());
        }
        
        if (verified != null) {
            wrapper.eq("verified", verified);
        }
        
        if (status != null) {
            wrapper.eq("status", status);
        }
        
        wrapper.orderByDesc("created_at");
        return page(pageParam, wrapper);
    }
    
    /**
     * 管理员获取用户列表（保持向后兼容）
     */
    public IPage<User> getUsers(int page, int size, String phone) {
        return getUsers(page, size, phone, null, null);
    }
    
    /**
     * 根据认证状态统计用户数量
     */
    public long countByVerificationStatus(Integer verified) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("verified", verified);
        return count(wrapper);
    }
    
    /**
     * 根据认证状态统计用户数量（使用枚举）
     */
    public long countByVerificationStatus(VerificationStatus status) {
        return countByVerificationStatus(status.getCode());
    }

    /**
     * 批量获取用户昵称
     */
    public Map<Long, String> getUserNicknames(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return lambdaQuery()
                .in(User::getId, userIds)
                .list()
                .stream()
                .collect(Collectors.toMap(
                        User::getId,
                        user -> user.getNickname() != null ? user.getNickname() : "用户" + user.getId()
                ));
    }

    /**
     * 批量获取用户头像
     */
    public Map<Long, String> getUserAvatars(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return lambdaQuery()
                .in(User::getId, userIds)
                .list()
                .stream()
                .collect(Collectors.toMap(
                        User::getId,
                        user -> user.getAvatar() != null ? user.getAvatar() : ""
                ));
    }
} 