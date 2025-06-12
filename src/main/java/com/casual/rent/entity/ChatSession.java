package com.casual.rent.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 聊天会话实体
 */
@TableName("chat_sessions")
public class ChatSession {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 商家ID
     */
    private Long merchantId;
    
    /**
     * 会话状态：active-活跃，closed-关闭
     */
    private String status;
    
    /**
     * 最后一条消息内容
     */
    private String lastMessage;
    
    /**
     * 最后消息时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastMessageTime;
    
    /**
     * 用户未读消息数
     */
    private Integer userUnreadCount;
    
    /**
     * 商家未读消息数
     */
    private Integer merchantUnreadCount;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // 构造函数
    public ChatSession() {}

    public ChatSession(Long userId, Long merchantId) {
        this.userId = userId;
        this.merchantId = merchantId;
        this.status = "active";
        this.userUnreadCount = 0;
        this.merchantUnreadCount = 0;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(Long merchantId) {
        this.merchantId = merchantId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public Integer getUserUnreadCount() {
        return userUnreadCount;
    }

    public void setUserUnreadCount(Integer userUnreadCount) {
        this.userUnreadCount = userUnreadCount;
    }

    public Integer getMerchantUnreadCount() {
        return merchantUnreadCount;
    }

    public void setMerchantUnreadCount(Integer merchantUnreadCount) {
        this.merchantUnreadCount = merchantUnreadCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 