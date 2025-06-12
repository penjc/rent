-- 聊天消息表
CREATE TABLE `chat_messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `sender_id` bigint(20) NOT NULL COMMENT '发送者ID',
  `sender_type` varchar(20) NOT NULL COMMENT '发送者类型：user-用户，merchant-商家',
  `receiver_id` bigint(20) NOT NULL COMMENT '接收者ID',
  `receiver_type` varchar(20) NOT NULL COMMENT '接收者类型：user-用户，merchant-商家',
  `content` text COMMENT '消息内容',
  `message_type` varchar(20) NOT NULL DEFAULT 'text' COMMENT '消息类型：text-文本，image-图片，file-文件',
  `file_url` varchar(500) COMMENT '文件URL',
  `file_name` varchar(200) COMMENT '文件名称',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_id`, `sender_type`),
  KEY `idx_receiver` (`receiver_id`, `receiver_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天消息表';

-- 聊天会话表
CREATE TABLE `chat_sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `merchant_id` bigint(20) NOT NULL COMMENT '商家ID',
  `status` varchar(20) NOT NULL DEFAULT 'active' COMMENT '会话状态：active-活跃，closed-关闭',
  `last_message` text COMMENT '最后一条消息内容',
  `last_message_time` datetime COMMENT '最后消息时间',
  `user_unread_count` int(11) NOT NULL DEFAULT 0 COMMENT '用户未读消息数',
  `merchant_unread_count` int(11) NOT NULL DEFAULT 0 COMMENT '商家未读消息数',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_merchant` (`user_id`, `merchant_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_last_message_time` (`last_message_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天会话表'; 