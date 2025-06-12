package com.casual.rent.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.common.ChatMessageDTO;
import com.casual.rent.entity.*;
import com.casual.rent.mapper.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 聊天服务类
 */
@Service
public class ChatService extends ServiceImpl<ChatMessageMapper, ChatMessage> {

    @Autowired
    private ChatMessageMapper chatMessageMapper;
    
    @Autowired
    private ChatSessionMapper chatSessionMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private MerchantMapper merchantMapper;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * 发送消息
     */
    @Transactional
    public ChatMessageDTO sendMessage(Long senderId, String senderType, Long receiverId, String receiverType, 
                                     String content, String messageType, String fileUrl, String fileName) {
        
        // 创建消息
        ChatMessage message = new ChatMessage(senderId, senderType, receiverId, receiverType, content, messageType);
        message.setFileUrl(fileUrl);
        message.setFileName(fileName);
        message.setCreatedAt(LocalDateTime.now());
        message.setUpdatedAt(LocalDateTime.now());
        
        // 保存消息
        chatMessageMapper.insert(message);
        
        // 更新或创建会话
        updateChatSession(senderId, senderType, receiverId, receiverType, content);
        
        // 转换为DTO并添加发送者信息
        ChatMessageDTO messageDTO = convertToDTO(message);
        
        // 发送WebSocket消息给接收者
        String destination = "/queue/messages/" + receiverType + "/" + receiverId;
        messagingTemplate.convertAndSend(destination, messageDTO);
        
        return messageDTO;
    }

    /**
     * 获取聊天记录
     */
    public List<ChatMessageDTO> getChatHistory(Long senderId, String senderType, Long receiverId, String receiverType, 
                                              int page, int size) {
        int offset = (page - 1) * size;
        List<ChatMessage> messages = chatMessageMapper.getChatHistory(senderId, senderType, receiverId, receiverType, offset, size);
        
        List<ChatMessageDTO> messageDTOs = new ArrayList<>();
        for (ChatMessage message : messages) {
            messageDTOs.add(convertToDTO(message));
        }
        
        return messageDTOs;
    }

    /**
     * 标记消息为已读
     */
    @Transactional
    public void markMessagesAsRead(Long receiverId, String receiverType, Long senderId, String senderType) {
        // 更新消息状态为已读
        ChatMessage updateMessage = new ChatMessage();
        updateMessage.setIsRead(1);
        
        // 构建查询条件
        chatMessageMapper.update(updateMessage, 
            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<ChatMessage>()
                .eq("receiver_id", receiverId)
                .eq("receiver_type", receiverType)
                .eq("sender_id", senderId)
                .eq("sender_type", senderType)
                .eq("is_read", 0)
        );
        
        // 更新会话的未读数
        updateSessionUnreadCount(receiverId, receiverType, senderId, senderType);
    }

    /**
     * 获取用户的聊天会话列表
     */
    public List<ChatSession> getUserSessions(Long userId) {
        return chatSessionMapper.getUserSessions(userId);
    }

    /**
     * 获取商家的聊天会话列表
     */
    public List<ChatSession> getMerchantSessions(Long merchantId) {
        return chatSessionMapper.getMerchantSessions(merchantId);
    }

    /**
     * 获取未读消息数量
     */
    public int getUnreadCount(Long receiverId, String receiverType) {
        return chatMessageMapper.getUnreadCount(receiverId, receiverType);
    }

    /**
     * 更新聊天会话
     */
    private void updateChatSession(Long senderId, String senderType, Long receiverId, String receiverType, String lastMessage) {
        Long userId, merchantId;
        
        if ("user".equals(senderType)) {
            userId = senderId;
            merchantId = receiverId;
        } else {
            userId = receiverId;
            merchantId = senderId;
        }
        
        ChatSession session = chatSessionMapper.findSession(userId, merchantId);
        
        if (session == null) {
            // 创建新会话
            session = new ChatSession(userId, merchantId);
            session.setLastMessage(lastMessage);
            session.setLastMessageTime(LocalDateTime.now());
            session.setCreatedAt(LocalDateTime.now());
            session.setUpdatedAt(LocalDateTime.now());
            
            // 设置未读数
            if ("user".equals(senderType)) {
                session.setMerchantUnreadCount(1);
            } else {
                session.setUserUnreadCount(1);
            }
            
            chatSessionMapper.insert(session);
        } else {
            // 更新现有会话
            session.setLastMessage(lastMessage);
            session.setLastMessageTime(LocalDateTime.now());
            session.setUpdatedAt(LocalDateTime.now());
            
            // 增加接收者的未读数
            if ("user".equals(senderType)) {
                session.setMerchantUnreadCount(session.getMerchantUnreadCount() + 1);
            } else {
                session.setUserUnreadCount(session.getUserUnreadCount() + 1);
            }
            
            chatSessionMapper.updateById(session);
        }
    }

    /**
     * 更新会话未读数
     */
    private void updateSessionUnreadCount(Long receiverId, String receiverType, Long senderId, String senderType) {
        Long userId, merchantId;
        
        if ("user".equals(receiverType)) {
            userId = receiverId;
            merchantId = senderId;
        } else {
            userId = senderId;
            merchantId = receiverId;
        }
        
        ChatSession session = chatSessionMapper.findSession(userId, merchantId);
        if (session != null) {
            if ("user".equals(receiverType)) {
                session.setUserUnreadCount(0);
            } else {
                session.setMerchantUnreadCount(0);
            }
            chatSessionMapper.updateById(session);
        }
    }

    /**
     * 转换为DTO
     */
    private ChatMessageDTO convertToDTO(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        BeanUtils.copyProperties(message, dto);
        
        // 添加发送者信息
        if ("user".equals(message.getSenderType())) {
            User user = userMapper.selectById(message.getSenderId());
            if (user != null) {
                dto.setSenderName(user.getNickname() != null ? user.getNickname() : user.getPhone());
                dto.setSenderAvatar(user.getAvatar());
            }
        } else if ("merchant".equals(message.getSenderType())) {
            Merchant merchant = merchantMapper.selectById(message.getSenderId());
            if (merchant != null) {
                dto.setSenderName(merchant.getCompanyName() != null ? merchant.getCompanyName() : merchant.getContactName());
                dto.setSenderAvatar(null); // Merchant entity doesn't have avatar field yet
            }
        }
        
        return dto;
    }
} 