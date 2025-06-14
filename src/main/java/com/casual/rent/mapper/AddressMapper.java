package com.casual.rent.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.casual.rent.entity.Address;
import org.apache.ibatis.annotations.Mapper;

/**
 * 地址 Mapper 接口
 */
@Mapper
public interface AddressMapper extends BaseMapper<Address> {
} 