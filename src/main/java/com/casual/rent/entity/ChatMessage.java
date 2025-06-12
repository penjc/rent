package com.casual.rent.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 聊天消息实体
 */
@TableName("chat_messages")
public class ChatMessage {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 发送者ID
     */
    private Long senderId;
    
    /**
     * 发送者类型：user-用户，merchant-商家
     */
    private String senderType;
    
    /**
     * 接收者ID
     */
    private Long receiverId;
    
    /**
     * 接收者类型：user-用户，merchant-商家
     */
    private String receiverType;
    
    /**
     * 消息内容
     */
    private String content;
    
    /**
     * 消息类型：text-文本，image-图片，file-文件
     */
    private String messageType;
    
    /**
     * 文件URL（当消息类型为图片或文件时）
     */
    private String fileUrl;
    
    /**
     * 文件名称
     */
    private String fileName;
    
    /**
     * 是否已读：0-未读，1-已读
     */
    private Integer isRead;
    
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
    public ChatMessage() {}

    public ChatMessage(Long senderId, String senderType, Long receiverId, String receiverType, 
                      String content, String messageType) {
        this.senderId = senderId;
        this.senderType = senderType;
        this.receiverId = receiverId;
        this.receiverType = receiverType;
        this.content = content;
        this.messageType = messageType;
        this.isRead = 0;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getReceiverType() {
        return receiverType;
    }

    public void setReceiverType(String receiverType) {
        this.receiverType = receiverType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Integer getIsRead() {
        return isRead;
    }

    public void setIsRead(Integer isRead) {
        this.isRead = isRead;
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