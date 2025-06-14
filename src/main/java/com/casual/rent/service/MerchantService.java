package com.casual.rent.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.common.VerificationStatus;
import com.casual.rent.entity.Merchant;
import com.casual.rent.mapper.MerchantMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * 商家服务
 */
@Service
public class MerchantService extends ServiceImpl<MerchantMapper, Merchant> {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * 根据手机号查找商家
     */
    public Merchant findByPhone(String phone) {
        QueryWrapper<Merchant> wrapper = new QueryWrapper<>();
        wrapper.eq("phone", phone);
        return getOne(wrapper);
    }
    
    /**
     * 根据ID查找商家
     */
    public Merchant findById(Long merchantId) {
        return getById(merchantId);
    }
    
    /**
     * 商家注册
     */
    public Merchant register(String phone, String password, String companyName, String contactName, 
                           String businessLicense) {
        Merchant merchant = new Merchant();
        merchant.setPhone(phone);
        // 使用PasswordEncoder加密密码
        merchant.setPassword(passwordEncoder.encode(password));
        merchant.setCompanyName(companyName);
        merchant.setContactName(contactName);
        merchant.setBusinessLicense(businessLicense);
        merchant.setStatus(VerificationStatus.NOT_VERIFIED.getCode()); // 商家注册后为未认证状态
        save(merchant);
        return merchant;
    }
    
    /**
     * 商家登录
     */
    public Merchant login(String phone, String password) {
        Merchant merchant = findByPhone(phone);
        if (merchant != null) {
            // 使用PasswordEncoder验证密码
            if (passwordEncoder.matches(password, merchant.getPassword())) {
                return merchant;
            }
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
        wrapper.eq("status", VerificationStatus.PENDING.getCode()); // 待审核状态
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
    
    /**
     * 更新商家认证信息
     */
    public void updateCertification(Long merchantId, String idCardFront, String idCardBack, String businessLicense) {
        Merchant merchant = getById(merchantId);
        if (merchant != null) {
            if (idCardFront != null) {
                merchant.setIdCardFront(idCardFront);
            }
            if (idCardBack != null) {
                merchant.setIdCardBack(idCardBack);
            }
            if (businessLicense != null) {
                merchant.setBusinessLicense(businessLicense);
            }
            // 更新状态为待审核（如果之前是审核通过，重新提交认证材料后需要重新审核）
            if (!Objects.equals(merchant.getStatus(), VerificationStatus.NOT_VERIFIED.getCode())) {
                merchant.setStatus(VerificationStatus.PENDING.getCode());
//                merchant.setRemark("商家更新认证材料，待重新审核");
            }
            updateById(merchant);
        }
    }
    
    /**
     * 根据状态统计商家数量
     */
    public long countByStatus(Integer status) {
        QueryWrapper<Merchant> wrapper = new QueryWrapper<>();
        wrapper.eq("status", status);
        return count(wrapper);
    }
    
    /**
     * 根据认证状态统计商家数量（使用枚举）
     */
    public long countByStatus(VerificationStatus status) {
        return countByStatus(status.getCode());
    }
} 