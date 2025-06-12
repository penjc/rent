package com.casual.rent.controller;

import com.casual.rent.common.ChatMessageDTO;
import com.casual.rent.common.Result;
import com.casual.rent.entity.ChatSession;
import com.casual.rent.service.ChatService;
import com.casual.rent.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 聊天控制器
 */
@Controller
@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ChatController {

    @Autowired
    private ChatService chatService;
    
    @Autowired
    private FileUploadService fileUploadService;

    /**
     * WebSocket消息处理 - 发送文本消息
     */
    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload Map<String, Object> message) {
        Long senderId = Long.valueOf(message.get("senderId").toString());
        String senderType = message.get("senderType").toString();
        Long receiverId = Long.valueOf(message.get("receiverId").toString());
        String receiverType = message.get("receiverType").toString();
        String content = message.get("content").toString();
        
        chatService.sendMessage(senderId, senderType, receiverId, receiverType, content, "text", null, null);
    }

    /**
     * 发送文本消息 (HTTP API)
     */
    @PostMapping("/message")
    public Result<ChatMessageDTO> sendTextMessage(@RequestBody Map<String, Object> request) {
        try {
            Long senderId = Long.valueOf(request.get("senderId").toString());
            String senderType = request.get("senderType").toString();
            Long receiverId = Long.valueOf(request.get("receiverId").toString());
            String receiverType = request.get("receiverType").toString();
            String content = request.get("content").toString();
            
            ChatMessageDTO message = chatService.sendMessage(senderId, senderType, receiverId, receiverType, 
                                                           content, "text", null, null);
            return Result.success(message);
        } catch (Exception e) {
            return Result.error("发送消息失败：" + e.getMessage());
        }
    }

    /**
     * 发送图片消息
     */
    @PostMapping("/image")
    public Result<ChatMessageDTO> sendImageMessage(@RequestParam("file") MultipartFile file,
                                                   @RequestParam("senderId") Long senderId,
                                                   @RequestParam("senderType") String senderType,
                                                   @RequestParam("receiverId") Long receiverId,
                                                   @RequestParam("receiverType") String receiverType) {
        try {
            // 验证文件
            if (file.isEmpty()) {
                return Result.error("图片文件不能为空");
            }
            
            String[] allowedTypes = {"image/"};
            long maxSize = 10 * 1024 * 1024; // 10MB
            
            if (!fileUploadService.isValidFileType(file, allowedTypes)) {
                return Result.error("只支持图片文件");
            }
            
            if (!fileUploadService.isValidFileSize(file, maxSize)) {
                return Result.error("图片大小不能超过10MB");
            }
            
            // 上传文件
            String fileUrl = fileUploadService.uploadFile(file, "chat/images");
            
            // 发送消息
            ChatMessageDTO message = chatService.sendMessage(senderId, senderType, receiverId, receiverType, 
                                                           "", "image", fileUrl, file.getOriginalFilename());
            return Result.success(message);
        } catch (Exception e) {
            return Result.error("发送图片失败：" + e.getMessage());
        }
    }

    /**
     * 发送文件消息
     */
    @PostMapping("/file")
    public Result<ChatMessageDTO> sendFileMessage(@RequestParam("file") MultipartFile file,
                                                  @RequestParam("senderId") Long senderId,
                                                  @RequestParam("senderType") String senderType,
                                                  @RequestParam("receiverId") Long receiverId,
                                                  @RequestParam("receiverType") String receiverType) {
        try {
            // 验证文件
            if (file.isEmpty()) {
                return Result.error("文件不能为空");
            }
            
            long maxSize = 50 * 1024 * 1024; // 50MB
            
            if (!fileUploadService.isValidFileSize(file, maxSize)) {
                return Result.error("文件大小不能超过50MB");
            }
            
            // 上传文件
            String fileUrl = fileUploadService.uploadFile(file, "chat/files");
            
            // 发送消息
            ChatMessageDTO message = chatService.sendMessage(senderId, senderType, receiverId, receiverType, 
                                                           "", "file", fileUrl, file.getOriginalFilename());
            return Result.success(message);
        } catch (Exception e) {
            return Result.error("发送文件失败：" + e.getMessage());
        }
    }

    /**
     * 获取聊天记录
     */
    @GetMapping("/history")
    public Result<List<ChatMessageDTO>> getChatHistory(@RequestParam("senderId") Long senderId,
                                                       @RequestParam("senderType") String senderType,
                                                       @RequestParam("receiverId") Long receiverId,
                                                       @RequestParam("receiverType") String receiverType,
                                                       @RequestParam(value = "page", defaultValue = "1") int page,
                                                       @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            List<ChatMessageDTO> messages = chatService.getChatHistory(senderId, senderType, receiverId, receiverType, page, size);
            return Result.success(messages);
        } catch (Exception e) {
            return Result.error("获取聊天记录失败：" + e.getMessage());
        }
    }

    /**
     * 标记消息为已读
     */
    @PostMapping("/read")
    public Result<String> markAsRead(@RequestBody Map<String, Object> request) {
        try {
            Long receiverId = Long.valueOf(request.get("receiverId").toString());
            String receiverType = request.get("receiverType").toString();
            Long senderId = Long.valueOf(request.get("senderId").toString());
            String senderType = request.get("senderType").toString();
            
            chatService.markMessagesAsRead(receiverId, receiverType, senderId, senderType);
            return Result.success("标记已读成功");
        } catch (Exception e) {
            return Result.error("标记已读失败：" + e.getMessage());
        }
    }

    /**
     * 获取用户的聊天会话列表
     */
    @GetMapping("/sessions/user/{userId}")
    public Result<List<ChatSession>> getUserSessions(@PathVariable Long userId) {
        try {
            List<ChatSession> sessions = chatService.getUserSessions(userId);
            return Result.success(sessions);
        } catch (Exception e) {
            return Result.error("获取会话列表失败：" + e.getMessage());
        }
    }

    /**
     * 获取商家的聊天会话列表
     */
    @GetMapping("/sessions/merchant/{merchantId}")
    public Result<List<ChatSession>> getMerchantSessions(@PathVariable Long merchantId) {
        try {
            List<ChatSession> sessions = chatService.getMerchantSessions(merchantId);
            return Result.success(sessions);
        } catch (Exception e) {
            return Result.error("获取会话列表失败：" + e.getMessage());
        }
    }

    /**
     * 获取未读消息数量
     */
    @GetMapping("/unread/{receiverType}/{receiverId}")
    public Result<Integer> getUnreadCount(@PathVariable String receiverType, @PathVariable Long receiverId) {
        try {
            int unreadCount = chatService.getUnreadCount(receiverId, receiverType);
            return Result.success(unreadCount);
        } catch (Exception e) {
            return Result.error("获取未读消息数失败：" + e.getMessage());
        }
    }
} 