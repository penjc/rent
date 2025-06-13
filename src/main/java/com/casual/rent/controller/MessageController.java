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
}
