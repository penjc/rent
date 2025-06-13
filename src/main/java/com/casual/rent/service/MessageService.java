package com.casual.rent.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.entity.Message;
import com.casual.rent.mapper.MessageMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 聊天消息服务
 */
@Service
public class MessageService extends ServiceImpl<MessageMapper, Message> {
    /**
     * 发送消息
     */
    public Message sendMessage(Long senderId, Long receiverId, String content) {
        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        save(message);
        return message;
    }

    /**
     * 获取双方的聊天记录，按创建时间升序
     */
    public List<Message> getMessages(Long userA, Long userB) {
        return lambdaQuery()
                .and(wrapper -> wrapper
                        .eq(Message::getSenderId, userA)
                        .eq(Message::getReceiverId, userB)
                        .or()
                        .eq(Message::getSenderId, userB)
                        .eq(Message::getReceiverId, userA))
                .orderByAsc(Message::getCreatedAt)
                .list();
    }
}
