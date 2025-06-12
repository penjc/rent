package com.casual.rent.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.casual.rent.entity.ChatMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 聊天消息Mapper接口
 */
@Mapper
public interface ChatMessageMapper extends BaseMapper<ChatMessage> {
    
    /**
     * 获取两个用户之间的聊天记录
     */
    @Select("SELECT * FROM chat_messages WHERE " +
            "((sender_id = #{senderId} AND sender_type = #{senderType} AND receiver_id = #{receiverId} AND receiver_type = #{receiverType}) " +
            "OR (sender_id = #{receiverId} AND sender_type = #{receiverType} AND receiver_id = #{senderId} AND receiver_type = #{senderType})) " +
            "ORDER BY created_at ASC LIMIT #{limit} OFFSET #{offset}")
    List<ChatMessage> getChatHistory(@Param("senderId") Long senderId, 
                                   @Param("senderType") String senderType,
                                   @Param("receiverId") Long receiverId, 
                                   @Param("receiverType") String receiverType,
                                   @Param("offset") int offset,
                                   @Param("limit") int limit);
    
    /**
     * 获取未读消息数量
     */
    @Select("SELECT COUNT(*) FROM chat_messages WHERE receiver_id = #{receiverId} AND receiver_type = #{receiverType} AND is_read = 0")
    int getUnreadCount(@Param("receiverId") Long receiverId, @Param("receiverType") String receiverType);
} 