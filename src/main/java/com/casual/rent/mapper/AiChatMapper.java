package com.casual.rent.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.casual.rent.entity.AiChat;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface AiChatMapper extends BaseMapper<AiChat> {

    @Select("SELECT * FROM ai_chat WHERE user_id = #{userId} ORDER BY updated_at DESC LIMIT 10")
    List<AiChat> selectRecentChatsByUserId(Long userId);

    @Select("SELECT * FROM ai_chat WHERE session_id = #{sessionId}")
    AiChat selectBySessionId(String sessionId);
}