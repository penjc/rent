package com.casual.rent.controller;

import com.casual.rent.common.AddressOwnerType;
import com.casual.rent.common.Result;
import com.casual.rent.entity.Address;
import com.casual.rent.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

/**
 * 地址控制器
 */
@Tag(name = "地址管理接口")
@RestController
@RequestMapping("/addresses")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class AddressController {
    
    @Autowired
    private AddressService addressService;
    
    /**
     * 获取用户地址列表
     */
    @Operation(summary = "获取用户地址列表")
    @GetMapping("/user/{userId}")
    public Result<List<Address>> getUserAddresses(@PathVariable Long userId) {
        List<Address> addresses = addressService.getUserAddresses(userId);
        return Result.success(addresses);
    }
    
    /**
     * 获取商家地址列表
     */
    @Operation(summary = "获取商家地址列表")
    @GetMapping("/merchant/{merchantId}")
    public Result<List<Address>> getMerchantAddresses(@PathVariable Long merchantId) {
        List<Address> addresses = addressService.getMerchantAddresses(merchantId);
        return Result.success(addresses);
    }
    
    /**
     * 获取用户默认地址
     */
    @Operation(summary = "获取用户默认地址")
    @GetMapping("/user/{userId}/default")
    public Result<Address> getUserDefaultAddress(@PathVariable Long userId) {
        Address address = addressService.getDefaultAddress(userId, AddressOwnerType.USER);
        return Result.success(address);
    }
    
    /**
     * 获取商家默认地址
     */
    @Operation(summary = "获取商家默认地址")
    @GetMapping("/merchant/{merchantId}/default")
    public Result<Address> getMerchantDefaultAddress(@PathVariable Long merchantId) {
        Address address = addressService.getDefaultAddress(merchantId, AddressOwnerType.MERCHANT);
        return Result.success(address);
    }
    
    /**
     * 添加用户地址
     */
    @Operation(summary = "添加用户地址")
    @PostMapping("/user/{userId}")
    public Result<Address> addUserAddress(@PathVariable Long userId, @RequestBody Map<String, Object> params) {
        try {
            String contactName = (String) params.get("contactName");
            String contactPhone = (String) params.get("contactPhone");
            String province = (String) params.get("province");
            String city = (String) params.get("city");
            String district = (String) params.get("district");
            String detailAddress = (String) params.get("detailAddress");
            Boolean isDefault = params.get("isDefault") != null ? (Boolean) params.get("isDefault") : false;
            
            if (contactName == null || contactPhone == null || province == null || 
                city == null || district == null || detailAddress == null) {
                return Result.fail("地址信息不完整");
            }
            
            Address address = addressService.addAddress(userId, AddressOwnerType.USER, 
                contactName, contactPhone, province, city, district, detailAddress, isDefault);
            return Result.success(address);
        } catch (Exception e) {
            return Result.error("添加地址失败：" + e.getMessage());
        }
    }
    
    /**
     * 添加商家地址
     */
    @Operation(summary = "添加商家地址")
    @PostMapping("/merchant/{merchantId}")
    public Result<Address> addMerchantAddress(@PathVariable Long merchantId, @RequestBody Map<String, Object> params) {
        try {
            String contactName = (String) params.get("contactName");
            String contactPhone = (String) params.get("contactPhone");
            String province = (String) params.get("province");
            String city = (String) params.get("city");
            String district = (String) params.get("district");
            String detailAddress = (String) params.get("detailAddress");
            Boolean isDefault = params.get("isDefault") != null ? (Boolean) params.get("isDefault") : false;
            
            if (contactName == null || contactPhone == null || province == null || 
                city == null || district == null || detailAddress == null) {
                return Result.fail("地址信息不完整");
            }
            
            Address address = addressService.addAddress(merchantId, AddressOwnerType.MERCHANT, 
                contactName, contactPhone, province, city, district, detailAddress, isDefault);
            return Result.success(address);
        } catch (Exception e) {
            return Result.error("添加地址失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新用户地址
     */
    @Operation(summary = "更新用户地址")
    @PutMapping("/user/{userId}/{addressId}")
    public Result<Address> updateUserAddress(@PathVariable Long userId, @PathVariable Long addressId, 
                                           @RequestBody Map<String, Object> params) {
        try {
            String contactName = (String) params.get("contactName");
            String contactPhone = (String) params.get("contactPhone");
            String province = (String) params.get("province");
            String city = (String) params.get("city");
            String district = (String) params.get("district");
            String detailAddress = (String) params.get("detailAddress");
            Boolean isDefault = params.get("isDefault") != null ? (Boolean) params.get("isDefault") : null;
            
            Address address = addressService.updateAddress(addressId, userId, AddressOwnerType.USER,
                contactName, contactPhone, province, city, district, detailAddress, isDefault);
            return Result.success(address);
        } catch (Exception e) {
            return Result.error("更新地址失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新商家地址
     */
    @Operation(summary = "更新商家地址")
    @PutMapping("/merchant/{merchantId}/{addressId}")
    public Result<Address> updateMerchantAddress(@PathVariable Long merchantId, @PathVariable Long addressId, 
                                               @RequestBody Map<String, Object> params) {
        try {
            String contactName = (String) params.get("contactName");
            String contactPhone = (String) params.get("contactPhone");
            String province = (String) params.get("province");
            String city = (String) params.get("city");
            String district = (String) params.get("district");
            String detailAddress = (String) params.get("detailAddress");
            Boolean isDefault = params.get("isDefault") != null ? (Boolean) params.get("isDefault") : null;
            
            Address address = addressService.updateAddress(addressId, merchantId, AddressOwnerType.MERCHANT,
                contactName, contactPhone, province, city, district, detailAddress, isDefault);
            return Result.success(address);
        } catch (Exception e) {
            return Result.error("更新地址失败：" + e.getMessage());
        }
    }
    
    /**
     * 删除用户地址
     */
    @Operation(summary = "删除用户地址")
    @DeleteMapping("/user/{userId}/{addressId}")
    public Result<String> deleteUserAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        try {
            addressService.deleteAddress(addressId, userId, AddressOwnerType.USER);
            return Result.success("删除成功");
        } catch (Exception e) {
            return Result.error("删除地址失败：" + e.getMessage());
        }
    }
    
    /**
     * 删除商家地址
     */
    @Operation(summary = "删除商家地址")
    @DeleteMapping("/merchant/{merchantId}/{addressId}")
    public Result<String> deleteMerchantAddress(@PathVariable Long merchantId, @PathVariable Long addressId) {
        try {
            addressService.deleteAddress(addressId, merchantId, AddressOwnerType.MERCHANT);
            return Result.success("删除成功");
        } catch (Exception e) {
            return Result.error("删除地址失败：" + e.getMessage());
        }
    }
    
    /**
     * 设置用户默认地址
     */
    @Operation(summary = "设置用户默认地址")
    @PutMapping("/user/{userId}/{addressId}/default")
    public Result<String> setUserDefaultAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        try {
            addressService.setDefaultAddress(addressId, userId, AddressOwnerType.USER);
            return Result.success("设置成功");
        } catch (Exception e) {
            return Result.error("设置默认地址失败：" + e.getMessage());
        }
    }
    
    /**
     * 设置商家默认地址
     */
    @Operation(summary = "设置商家默认地址")
    @PutMapping("/merchant/{merchantId}/{addressId}/default")
    public Result<String> setMerchantDefaultAddress(@PathVariable Long merchantId, @PathVariable Long addressId) {
        try {
            addressService.setDefaultAddress(addressId, merchantId, AddressOwnerType.MERCHANT);
            return Result.success("设置成功");
        } catch (Exception e) {
            return Result.error("设置默认地址失败：" + e.getMessage());
        }
    }
    
    /**
     * 根据ID获取地址详情
     */
    @Operation(summary = "根据ID获取地址详情")
    @GetMapping("/{addressId}")
    public Result<Address> getAddressById(@PathVariable Long addressId) {
        Address address = addressService.getById(addressId);
        if (address == null) {
            return Result.fail("地址不存在");
        }
        return Result.success(address);
    }
} 