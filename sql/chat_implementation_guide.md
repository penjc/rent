# 📱 Casual Rent 即时通讯功能实现指南

## 🌟 功能概述

本文档详细介绍了Casual Rent平台用户与商家之间的线上交流即时通讯功能的完整实现方案。

### 🔧 技术架构

- **后端**: Spring Boot + WebSocket + STOMP协议
- **前端**: React + SockJS + STOMP客户端
- **消息存储**: MySQL数据库
- **文件传输**: 腾讯云COS对象存储

## 🚀 核心功能特性

### 💬 消息类型支持
- **文本消息**: 支持纯文本聊天
- **图片消息**: 支持图片文件发送和预览
- **文件消息**: 支持各类文件的传输和下载

### 👥 用户管理
- **身份识别**: 区分用户(user)和商家(merchant)
- **会话管理**: 自动创建和维护聊天会话
- **在线状态**: 实时连接状态管理

### 📊 消息状态
- **实时推送**: WebSocket实时消息推送
- **已读未读**: 消息已读状态管理
- **未读计数**: 实时未读消息计数

## 📂 数据库设计

### 聊天消息表 (chat_messages)
```sql
CREATE TABLE `chat_messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `sender_id` bigint(20) NOT NULL,
  `sender_type` varchar(20) NOT NULL,
  `receiver_id` bigint(20) NOT NULL,
  `receiver_type` varchar(20) NOT NULL,
  `content` text,
  `message_type` varchar(20) NOT NULL DEFAULT 'text',
  `file_url` varchar(500),
  `file_name` varchar(200),
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

### 聊天会话表 (chat_sessions)
```sql
CREATE TABLE `chat_sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `merchant_id` bigint(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `last_message` text,
  `last_message_time` datetime,
  `user_unread_count` int(11) NOT NULL DEFAULT 0,
  `merchant_unread_count` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_merchant` (`user_id`, `merchant_id`)
);
```

## 🛠️ 部署步骤

### 1. 后端部署

#### 添加依赖
在 `pom.xml` 中添加WebSocket依赖：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

#### 创建数据表
执行 `docs/chat_tables.sql` 中的SQL脚本创建数据表。

#### 启动服务
启动Spring Boot应用，WebSocket端点将在 `/api/ws` 可用。

### 2. 前端部署

#### 安装依赖
```bash
cd frontend
npm install @stomp/stompjs sockjs-client @types/sockjs-client
```

#### 构建和启动
```bash
npm run build
npm run dev
```

## 🎯 使用说明

### 👤 用户端使用

#### 1. 联系商家
- 在商品详情页面，点击"联系商家"按钮
- 系统会自动打开聊天窗口
- 可以发送文字、图片、文件消息

#### 2. 查看消息
- 在用户中心可以查看所有聊天会话
- 支持消息搜索和筛选
- 实时接收新消息通知

### 🏪 商家端使用

#### 1. 消息管理
- 访问"客户消息"页面查看所有聊天会话
- 会话列表显示最新消息和未读数量
- 点击会话可打开聊天窗口

#### 2. 客户沟通
- 实时回复客户消息
- 支持发送商品链接和图片
- 可以发送文件资料

### 🔧 管理员功能

#### 1. 消息监控
- 可以查看所有聊天记录
- 监控敏感词和不当行为
- 支持消息审核和管理

#### 2. 系统设置
- 配置消息保留时间
- 设置文件上传限制
- 管理黑名单用户

## 📋 API接口说明

### WebSocket端点
- **连接地址**: `ws://localhost:8080/api/ws`
- **协议**: STOMP over SockJS
- **订阅频道**: `/queue/messages/{userType}/{userId}`

### HTTP API

#### 发送文本消息
```http
POST /api/chat/message
Content-Type: application/json

{
  "senderId": 1,
  "senderType": "user",
  "receiverId": 2,
  "receiverType": "merchant",
  "content": "你好，我想咨询这个商品"
}
```

#### 发送图片消息
```http
POST /api/chat/image
Content-Type: multipart/form-data

file: [图片文件]
senderId: 1
senderType: user
receiverId: 2
receiverType: merchant
```

#### 获取聊天记录
```http
GET /api/chat/history?senderId=1&senderType=user&receiverId=2&receiverType=merchant&page=1&size=20
```

#### 标记已读
```http
POST /api/chat/read
Content-Type: application/json

{
  "receiverId": 1,
  "receiverType": "user",
  "senderId": 2,
  "senderType": "merchant"
}
```

## 🔍 故障排除

### 常见问题

#### 1. WebSocket连接失败
- **问题**: 无法建立WebSocket连接
- **解决**: 检查服务器防火墙设置，确保8080端口开放
- **排查**: 查看浏览器控制台WebSocket连接错误

#### 2. 消息发送失败
- **问题**: 消息无法发送或接收
- **解决**: 检查用户登录状态和权限
- **排查**: 查看服务器日志和数据库连接

#### 3. 文件上传失败
- **问题**: 图片或文件无法上传
- **解决**: 检查腾讯云COS配置和文件大小限制
- **排查**: 查看文件服务日志

### 性能优化

#### 1. 消息分页
- 实现消息历史分页加载
- 限制单次加载消息数量
- 使用懒加载优化性能

#### 2. 连接管理
- 实现连接池管理
- 自动重连机制
- 心跳检测保持连接

#### 3. 缓存策略
- 消息缓存减少数据库查询
- 会话状态缓存
- 用户在线状态缓存

## 📈 扩展功能

### 计划中的功能
- 语音消息支持
- 视频通话功能
- 消息撤回功能
- 消息转发功能
- 群聊功能
- 消息加密传输

### 集成建议
- 推送通知集成
- 客服系统集成
- 智能机器人客服
- 消息翻译功能

## 📞 技术支持

如果在实现过程中遇到问题，请参考以下资源：

1. **文档**: 查看详细的API文档
2. **日志**: 检查服务器和客户端日志
3. **测试**: 使用提供的测试用例验证功能
4. **社区**: 在开发者社区寻求帮助

---

**注意**: 在生产环境中使用前，请确保所有安全配置正确，包括HTTPS、用户认证、数据加密等安全措施。 