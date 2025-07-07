package com.casual.rent.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.casual.rent.entity.AiMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface AiMessageMapper extends BaseMapper<AiMessage> {

    @Select("SELECT * FROM ai_message WHERE chat_id = #{chatId} ORDER BY created_at ASC")
    List<AiMessage> selectByChatId(Long chatId);

    @Select("SELECT * FROM ai_message WHERE session_id = #{sessionId} ORDER BY created_at ASC")
    List<AiMessage> selectBySessionId(String sessionId);
}