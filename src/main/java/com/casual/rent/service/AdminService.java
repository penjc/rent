package com.casual.rent.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.entity.Admin;
import com.casual.rent.mapper.AdminMapper;
import org.springframework.stereotype.Service;

/**
 * 管理员服务
 */
@Service
public class AdminService extends ServiceImpl<AdminMapper, Admin> {
    
    /**
     * 根据用户名查找管理员
     */
    public Admin findByUsername(String username) {
        QueryWrapper<Admin> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        return getOne(wrapper);
    }
    
    /**
     * 管理员登录验证（明文密码比较）
     */
    public Admin login(String username, String password) {
        Admin admin = findByUsername(username);
        if (admin != null && admin.getStatus() == 1) {
            // 明文密码比较
            if (password.equals(admin.getPassword())) {
                return admin;
            }
        }
        return null;
    }
} 