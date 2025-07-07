package com.casual.rent.controller;

import com.casual.rent.common.Result;
import com.casual.rent.entity.AiChat;
import com.casual.rent.entity.AiMessage;
import com.casual.rent.service.AiChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai-chat")
@Tag(name = "AI客服", description = "AI客服对话接口")
public class AiChatController {

    @Autowired
    private AiChatService aiChatService;

    @PostMapping("/create")
    @Operation(summary = "创建新的AI对话会话")
    public Result<AiChat> createChat(
            @Parameter(description = "用户ID") @RequestParam Long userId) {
        try {
            AiChat chat = aiChatService.createChat(userId);
            return Result.success(chat);
        } catch (Exception e) {
            return Result.error("创建对话失败: " + e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    @Operation(summary = "获取用户的对话历史")
    public Result<List<AiChat>> getChatHistory(
            @Parameter(description = "用户ID") @PathVariable Long userId) {
        try {
            List<AiChat> chats = aiChatService.getUserChats(userId);
            return Result.success(chats);
        } catch (Exception e) {
            return Result.error("获取对话历史失败: " + e.getMessage());
        }
    }

    @GetMapping("/messages/{sessionId}")
    @Operation(summary = "获取对话消息")
    public Result<List<AiMessage>> getChatMessages(
            @Parameter(description = "会话ID") @PathVariable String sessionId) {
        try {
            List<AiMessage> messages = aiChatService.getChatMessages(sessionId);
            return Result.success(messages);
        } catch (Exception e) {
            return Result.error("获取消息失败: " + e.getMessage());
        }
    }

    @PostMapping("/send")
    @Operation(summary = "发送消息并获取AI回复")
    public Result<AiMessage> sendMessage(@RequestBody Map<String, Object> request) {
        try {
            String sessionId = (String) request.get("sessionId");
            String message = (String) request.get("message");
            Long userId = Long.valueOf(request.get("userId").toString());

            if (message == null || message.trim().isEmpty()) {
                return Result.error("消息内容不能为空");
            }

            AiMessage response = aiChatService.sendMessage(sessionId, message.trim(), userId);
            return Result.success(response);
        } catch (Exception e) {
            return Result.error("发送消息失败: " + e.getMessage());
        }
    }

    @PostMapping("/reload-model")
    @Operation(summary = "重新加载AI模型")
    public Result<String> reloadModel() {
        try {
            aiChatService.reloadModel();
            return Result.success("AI模型重新加载成功");
        } catch (Exception e) {
            return Result.error("重新加载AI模型失败: " + e.getMessage());
        }
    }
}