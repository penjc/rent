package com.casual.rent.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.entity.Merchant;
import com.casual.rent.mapper.MerchantMapper;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 商家服务
 */
@Service
public class MerchantService extends ServiceImpl<MerchantMapper, Merchant> {
    
    // @Autowired
    // private PasswordEncoder passwordEncoder;
    
    /**
     * 根据手机号查找商家
     */
    public Merchant findByPhone(String phone) {
        QueryWrapper<Merchant> wrapper = new QueryWrapper<>();
        wrapper.eq("phone", phone);
        return getOne(wrapper);
    }
    
    /**
     * 商家注册
     */
    public Merchant register(String phone, String password, String companyName, String contactName, 
                           String idCardFront, String idCardBack, String businessLicense) {
        Merchant merchant = new Merchant();
        merchant.setPhone(phone);
        // 密码明文存储（已注释加密操作）
        merchant.setPassword(password);
        // merchant.setPassword(passwordEncoder.encode(password));
        merchant.setCompanyName(companyName);
        merchant.setContactName(contactName);
        merchant.setIdCardFront(idCardFront);
        merchant.setIdCardBack(idCardBack);
        merchant.setBusinessLicense(businessLicense);
        merchant.setStatus(0); // 待审核
        save(merchant);
        return merchant;
    }
    
    /**
     * 商家登录
     */
    public Merchant login(String phone, String password) {
        Merchant merchant = findByPhone(phone);
        if (merchant != null) {
            // 明文密码比较（已注释加密验证）
            if (password.equals(merchant.getPassword())) {
                return merchant;
            }
            // if (passwordEncoder.matches(password, merchant.getPassword())) {
            //     return merchant;
            // }
        }
        return null;
    }
    
    /**
     * 获取商家分页列表
     */
    public IPage<Merchant> getMerchantPage(int current, int size, Integer status) {
        Page<Merchant> page = new Page<>(current, size);
        QueryWrapper<Merchant> wrapper = new QueryWrapper<>();
        if (status != null) {
            wrapper.eq("status", status);
        }
        wrapper.orderByDesc("created_at");
        return page(page, wrapper);
    }
    
    /**
     * 审核商家
     */
    public void auditMerchant(Long merchantId, Integer status, String remark) {
        Merchant merchant = getById(merchantId);
        if (merchant != null) {
            merchant.setStatus(status);
            merchant.setRemark(remark);
            updateById(merchant);
        }
    }
    
    /**
     * 获取待审核商家分页列表
     */
    public IPage<Merchant> getPendingMerchants(int page, int size) {
        Page<Merchant> pageObj = new Page<>(page, size);
        QueryWrapper<Merchant> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 0); // 待审核状态
        wrapper.orderByAsc("created_at"); // 按创建时间升序排列
        return page(pageObj, wrapper);
    }
    
    /**
     * 管理员获取商家列表（支持多条件查询）
     */
    public IPage<Merchant> getMerchants(int page, int size, String phone, Integer status) {
        Page<Merchant> pageParam = new Page<>(page, size);
        QueryWrapper<Merchant> wrapper = new QueryWrapper<>();
        
        if (phone != null && !phone.trim().isEmpty()) {
            wrapper.and(w -> w.like("phone", phone.trim()).or().like("company_name", phone.trim()));
        }
        
        if (status != null) {
            wrapper.eq("status", status);
        }
        
        wrapper.orderByDesc("created_at");
        return page(pageParam, wrapper);
    }
} 