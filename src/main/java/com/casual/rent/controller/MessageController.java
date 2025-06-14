package com.casual.rent.controller;

import com.casual.rent.common.Result;
import com.casual.rent.entity.Message;
import com.casual.rent.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 聊天消息控制器
 */
@Tag(name = "消息管理")
@RestController
@RequestMapping("/messages")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class MessageController {

    @Autowired
    private MessageService messageService;

    /**
     * 发送消息
     */
    @Operation(
        summary = "发送消息",
        description = "发送一条新消息",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "发送成功",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = Message.class))
            )
        }
    )
    @PostMapping
    public Result<Message> sendMessage(
        @Parameter(description = "消息内容", required = true)
        @RequestBody Map<String, Object> params
    ) {
        Long senderId = Long.valueOf(params.get("senderId").toString());
        Long receiverId = Long.valueOf(params.get("receiverId").toString());
        String content = params.get("content").toString();
        Message message = messageService.sendMessage(senderId, receiverId, content);
        return Result.success(message);
    }

    /**
     * 获取双方聊天记录
     */
    @Operation(summary = "获取聊天记录")
    @GetMapping
    public Result<List<Message>> getMessages(@RequestParam Long userA, @RequestParam Long userB) {
        List<Message> list = messageService.getMessages(userA, userB);
        return Result.success(list);
    }

    /**
     * 获取用户的所有消息
     */
    @Operation(
        summary = "获取用户/商家消息列表",
        description = "获取指定用户/商家的所有消息记录",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class))
            )
        }
    )
    @GetMapping("/user/{userId}")
    public Result<List<Message>> getUserMessages(
        @Parameter(description = "用户/商家ID", required = true)
        @PathVariable Long userId
    ) {
        List<Message> list = messageService.getUserMessages(userId);
        return Result.success(list);
    }

    /**
     * 获取用户的未读消息数量
     */
    @Operation(
        summary = "获取未读消息数量",
        description = "获取指定用户的未读消息总数",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = Long.class))
            )
        }
    )
    @GetMapping("/unread-count/{userId}")
    public Result<Long> getUnreadCount(
        @Parameter(description = "用户ID", required = true)
        @PathVariable Long userId
    ) {
        long count = messageService.getUnreadCount(userId);
        return Result.success(count);
    }

    /**
     * 获取用户与每个对话者的未读消息数量
     */
    @Operation(
        summary = "获取分组未读消息数量",
        description = "获取用户与每个对话者的未读消息数量",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))
            )
        }
    )
    @GetMapping("/unread-count-by-user/{userId}")
    public Result<Map<Long, Long>> getUnreadCountByUser(
        @Parameter(description = "用户ID", required = true)
        @PathVariable Long userId
    ) {
        Map<Long, Long> countMap = messageService.getUnreadCountByUser(userId);
        return Result.success(countMap);
    }

    /**
     * 标记消息为已读
     */
    @Operation(
        summary = "标记消息已读",
        description = "将指定消息标记为已读状态",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "标记成功"
            )
        }
    )
    @PutMapping("/{messageId}/read")
    public Result<String> markAsRead(
        @Parameter(description = "消息ID", required = true)
        @PathVariable Long messageId
    ) {
        messageService.markAsRead(messageId);
        return Result.success("标记成功");
    }

    /**
     * 标记对话为已读
     */
    @Operation(
        summary = "标记对话已读",
        description = "将用户与指定对话者的所有未读消息标记为已读",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "标记成功"
            )
        }
    )
    @PutMapping("/conversation/read")
    public Result<String> markConversationAsRead(
        @Parameter(description = "请求参数", required = true)
        @RequestBody Map<String, Object> params
    ) {
        Long userId = Long.valueOf(params.get("userId").toString());
        Long otherUserId = Long.valueOf(params.get("otherUserId").toString());
        messageService.markConversationAsRead(userId, otherUserId);
        return Result.success("标记成功");
    }

    /**
     * 获取用户的未读消息列表
     */
    @Operation(
        summary = "获取未读消息列表",
        description = "获取指定用户的所有未读消息",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "获取成功",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class))
            )
        }
    )
    @GetMapping("/unread/{userId}")
    public Result<List<Message>> getUnreadMessages(
        @Parameter(description = "用户ID", required = true)
        @PathVariable Long userId
    ) {
        List<Message> list = messageService.getUnreadMessages(userId);
        return Result.success(list);
    }
}
