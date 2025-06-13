package com.casual.rent.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.casual.rent.entity.Message;
import org.springframework.stereotype.Repository;

/**
 * 聊天消息Mapper
 */
@Repository
public interface MessageMapper extends BaseMapper<Message> {
}
