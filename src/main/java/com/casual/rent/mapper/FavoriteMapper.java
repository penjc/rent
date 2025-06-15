package com.casual.rent.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.casual.rent.entity.Favorite;
import org.apache.ibatis.annotations.Mapper;

/**
 * 收藏 Mapper 接口
 */
@Mapper
public interface FavoriteMapper extends BaseMapper<Favorite> {
} 