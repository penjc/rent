package com.casual.rent.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.casual.rent.entity.ChatSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 聊天会话Mapper接口
 */
@Mapper
public interface ChatSessionMapper extends BaseMapper<ChatSession> {
    
    /**
     * 获取用户的所有聊天会话
     */
    @Select("SELECT * FROM chat_sessions WHERE user_id = #{userId} ORDER BY last_message_time DESC")
    List<ChatSession> getUserSessions(@Param("userId") Long userId);
    
    /**
     * 获取商家的所有聊天会话
     */
    @Select("SELECT * FROM chat_sessions WHERE merchant_id = #{merchantId} ORDER BY last_message_time DESC")
    List<ChatSession> getMerchantSessions(@Param("merchantId") Long merchantId);
    
    /**
     * 查找特定的聊天会话
     */
    @Select("SELECT * FROM chat_sessions WHERE user_id = #{userId} AND merchant_id = #{merchantId}")
    ChatSession findSession(@Param("userId") Long userId, @Param("merchantId") Long merchantId);
} 