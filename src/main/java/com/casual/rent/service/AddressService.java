package com.casual.rent.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.common.AddressOwnerType;
import com.casual.rent.entity.Address;
import com.casual.rent.mapper.AddressMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 地址服务
 */
@Service
public class AddressService extends ServiceImpl<AddressMapper, Address> {
    
    /**
     * 获取用户地址列表
     */
    public List<Address> getUserAddresses(Long userId) {
        QueryWrapper<Address> wrapper = new QueryWrapper<>();
        wrapper.eq("owner_id", userId)
               .eq("owner_type", AddressOwnerType.USER.getCode())
               .orderByDesc("is_default")
               .orderByDesc("created_at");
        return list(wrapper);
    }
    
    /**
     * 获取商家地址列表
     */
    public List<Address> getMerchantAddresses(Long merchantId) {
        QueryWrapper<Address> wrapper = new QueryWrapper<>();
        wrapper.eq("owner_id", merchantId)
               .eq("owner_type", AddressOwnerType.MERCHANT.getCode())
               .orderByDesc("is_default")
               .orderByDesc("created_at");
        return list(wrapper);
    }
    
    /**
     * 获取默认地址
     */
    public Address getDefaultAddress(Long ownerId, AddressOwnerType ownerType) {
        QueryWrapper<Address> wrapper = new QueryWrapper<>();
        wrapper.eq("owner_id", ownerId)
               .eq("owner_type", ownerType.getCode())
               .eq("is_default", 1);
        return getOne(wrapper);
    }
    
    /**
     * 添加地址
     */
    @Transactional
    public Address addAddress(Long ownerId, AddressOwnerType ownerType, String contactName, 
                             String contactPhone, String province, String city, String district, 
                             String detailAddress, Boolean isDefault) {
        
        // 如果设置为默认地址，先取消其他默认地址
        if (isDefault != null && isDefault) {
            clearDefaultAddress(ownerId, ownerType);
        }
        
        Address address = new Address();
        address.setOwnerId(ownerId);
        address.setOwnerType(ownerType.getCode());
        address.setContactName(contactName);
        address.setContactPhone(contactPhone);
        address.setProvince(province);
        address.setCity(city);
        address.setDistrict(district);
        address.setDetailAddress(detailAddress);
        address.setIsDefault(isDefault != null && isDefault ? 1 : 0);
        address.setCreatedAt(LocalDateTime.now());
        address.setUpdatedAt(LocalDateTime.now());
        
        save(address);
        return address;
    }
    
    /**
     * 更新地址
     */
    @Transactional
    public Address updateAddress(Long addressId, Long ownerId, AddressOwnerType ownerType,
                                String contactName, String contactPhone, String province, 
                                String city, String district, String detailAddress, Boolean isDefault) {
        
        Address address = getById(addressId);
        if (address == null) {
            throw new RuntimeException("地址不存在");
        }
        
        // 验证地址所有权
        if (!address.getOwnerId().equals(ownerId) || 
            !address.getOwnerType().equals(ownerType.getCode())) {
            throw new RuntimeException("无权限操作此地址");
        }
        
        // 如果设置为默认地址，先取消其他默认地址
        if (isDefault != null && isDefault) {
            clearDefaultAddress(ownerId, ownerType);
        }
        
        address.setContactName(contactName);
        address.setContactPhone(contactPhone);
        address.setProvince(province);
        address.setCity(city);
        address.setDistrict(district);
        address.setDetailAddress(detailAddress);
        if (isDefault != null) {
            address.setIsDefault(isDefault ? 1 : 0);
        }
        address.setUpdatedAt(LocalDateTime.now());
        
        updateById(address);
        return address;
    }
    
    /**
     * 删除地址
     */
    public void deleteAddress(Long addressId, Long ownerId, AddressOwnerType ownerType) {
        Address address = getById(addressId);
        if (address == null) {
            throw new RuntimeException("地址不存在");
        }
        
        // 验证地址所有权
        if (!address.getOwnerId().equals(ownerId) || 
            !address.getOwnerType().equals(ownerType.getCode())) {
            throw new RuntimeException("无权限操作此地址");
        }
        
        removeById(addressId);
    }
    
    /**
     * 设置默认地址
     */
    @Transactional
    public void setDefaultAddress(Long addressId, Long ownerId, AddressOwnerType ownerType) {
        Address address = getById(addressId);
        if (address == null) {
            throw new RuntimeException("地址不存在");
        }
        
        // 验证地址所有权
        if (!address.getOwnerId().equals(ownerId) || 
            !address.getOwnerType().equals(ownerType.getCode())) {
            throw new RuntimeException("无权限操作此地址");
        }
        
        // 先取消其他默认地址
        clearDefaultAddress(ownerId, ownerType);
        
        // 设置当前地址为默认
        address.setIsDefault(1);
        address.setUpdatedAt(LocalDateTime.now());
        updateById(address);
    }
    
    /**
     * 清除默认地址
     */
    private void clearDefaultAddress(Long ownerId, AddressOwnerType ownerType) {
        QueryWrapper<Address> wrapper = new QueryWrapper<>();
        wrapper.eq("owner_id", ownerId)
               .eq("owner_type", ownerType.getCode())
               .eq("is_default", 1);
        
        List<Address> defaultAddresses = list(wrapper);
        for (Address addr : defaultAddresses) {
            addr.setIsDefault(0);
            addr.setUpdatedAt(LocalDateTime.now());
            updateById(addr);
        }
    }
    
    /**
     * 验证地址所有权
     */
    public boolean validateAddressOwnership(Long addressId, Long ownerId, AddressOwnerType ownerType) {
        Address address = getById(addressId);
        return address != null && 
               address.getOwnerId().equals(ownerId) && 
               address.getOwnerType().equals(ownerType.getCode());
    }
} 