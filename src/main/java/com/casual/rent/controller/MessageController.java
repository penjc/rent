package com.casual.rent.controller;

import com.casual.rent.common.Result;
import com.casual.rent.entity.Message;
import com.casual.rent.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 聊天消息控制器
 */
@RestController
@RequestMapping("/messages")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class MessageController {

    @Autowired
    private MessageService messageService;

    /**
     * 发送消息
     */
    @PostMapping
    public Result<Message> sendMessage(@RequestBody Map<String, Object> params) {
        Long senderId = Long.valueOf(params.get("senderId").toString());
        Long receiverId = Long.valueOf(params.get("receiverId").toString());
        String content = params.get("content").toString();
        Message message = messageService.sendMessage(senderId, receiverId, content);
        return Result.success(message);
    }

    /**
     * 获取双方聊天记录
     */
    @GetMapping
    public Result<List<Message>> getMessages(@RequestParam Long userA, @RequestParam Long userB) {
        List<Message> list = messageService.getMessages(userA, userB);
        return Result.success(list);
    }

    /**
     * 获取用户的所有消息
     */
    @GetMapping("/user/{userId}")
    public Result<List<Message>> getUserMessages(@PathVariable Long userId) {
        List<Message> list = messageService.getUserMessages(userId);
        return Result.success(list);
    }
}
