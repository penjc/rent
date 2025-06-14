package com.casual.rent.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.entity.Message;
import com.casual.rent.mapper.MessageMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        message.setIsRead(false);
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

    /**
     * 获取用户的所有消息，按创建时间降序
     */
    public List<Message> getUserMessages(Long userId) {
        return lambdaQuery()
                .and(wrapper -> wrapper
                        .eq(Message::getSenderId, userId)
                        .or()
                        .eq(Message::getReceiverId, userId))
                .orderByDesc(Message::getCreatedAt)
                .list();
    }

    /**
     * 获取用户的未读消息数量
     */
    public long getUnreadCount(Long userId) {
        return lambdaQuery()
                .eq(Message::getReceiverId, userId)
                .eq(Message::getIsRead, false)
                .count();
    }

    /**
     * 获取用户与每个对话者的未读消息数量
     */
    public Map<Long, Long> getUnreadCountByUser(Long userId) {
        List<Message> unreadMessages = lambdaQuery()
                .eq(Message::getReceiverId, userId)
                .eq(Message::getIsRead, false)
                .list();
        
        return unreadMessages.stream()
                .collect(Collectors.groupingBy(
                        Message::getSenderId,
                        Collectors.counting()
                ));
    }

    /**
     * 标记消息为已读
     */
    public void markAsRead(Long messageId) {
        Message message = getById(messageId);
        if (message != null && !message.getIsRead()) {
            message.setIsRead(true);
            updateById(message);
        }
    }

    /**
     * 标记用户与指定对话者的所有消息为已读
     */
    public void markConversationAsRead(Long userId, Long otherUserId) {
        lambdaUpdate()
                .eq(Message::getReceiverId, userId)
                .eq(Message::getSenderId, otherUserId)
                .eq(Message::getIsRead, false)
                .set(Message::getIsRead, true)
                .update();
    }

    /**
     * 获取用户的未读消息列表
     */
    public List<Message> getUnreadMessages(Long userId) {
        return lambdaQuery()
                .eq(Message::getReceiverId, userId)
                .eq(Message::getIsRead, false)
                .orderByDesc(Message::getCreatedAt)
                .list();
    }
}
