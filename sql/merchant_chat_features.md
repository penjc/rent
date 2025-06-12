# 商家端聊天功能说明

## 📋 功能概述

为Casual Rent租赁平台的商家端成功添加了完整的客户聊天管理功能，实现了商家与用户之间的实时沟通。

## 🚀 已实现功能

### 1. 商家端导航菜单
- ✅ 在商家端侧边栏添加了"客户消息"菜单项
- ✅ 菜单项带有实时未读消息数量红点提醒
- ✅ 支持点击菜单直接跳转到消息管理页面

### 2. 消息中心页面 (`/merchant/messages`)
- ✅ **实时统计面板**：显示总未读消息、活跃会话数量、WebSocket连接状态
- ✅ **会话列表**：展示所有与用户的聊天会话
- ✅ **搜索功能**：支持根据消息内容搜索特定会话
- ✅ **未读消息突出显示**：未读会话有特殊颜色标识和计数显示
- ✅ **实时刷新**：支持手动刷新和自动定期更新

### 3. 实时通信功能
- ✅ **WebSocket连接**：与后端建立实时双向通信
- ✅ **新消息提醒**：收到新消息时显示弹窗通知
- ✅ **连接状态监控**：实时显示WebSocket连接状态
- ✅ **自动重连**：连接断开时支持手动重连

### 4. 聊天窗口
- ✅ **统一聊天组件**：复用ChatWindow组件进行对话
- ✅ **用户信息展示**：显示用户头像、昵称等基本信息
- ✅ **消息已读管理**：打开聊天后自动标记消息为已读
- ✅ **多媒体支持**：支持文本、图片、文件消息类型

### 5. 未读消息提醒
- ✅ **菜单红点**：侧边栏消息菜单显示未读数量Badge
- ✅ **头部提醒**：用户头像旁显示总未读消息数量
- ✅ **定期更新**：每30秒自动刷新未读消息数量
- ✅ **智能更新**：进入消息页面后自动刷新计数

## 🏗️ 技术架构

### 前端组件结构
```
frontend/src/pages/merchant/
├── Layout.tsx          # 主布局，包含未读消息提醒
├── Messages.tsx        # 消息中心主页面
└── ...其他页面

frontend/src/components/common/
└── ChatWindow.tsx      # 通用聊天窗口组件

frontend/src/services/
├── chatService.ts      # 聊天API服务
└── webSocketService.ts # WebSocket通信服务
```

### 核心功能点

#### 1. 未读消息管理
```typescript
// 获取未读消息数量
const loadUnreadCount = useCallback(async () => {
  const response = await chatService.getUnreadCount('merchant', merchantId);
  setUnreadCount(response.data || 0);
}, []);

// 定期刷新（每30秒）
useEffect(() => {
  const interval = setInterval(loadUnreadCount, 30000);
  return () => clearInterval(interval);
}, [loadUnreadCount]);
```

#### 2. 实时消息处理
```typescript
// WebSocket消息处理
const handleNewMessage = useCallback((newMessage: ChatMessage) => {
  if (newMessage.receiverId === merchantId && newMessage.receiverType === 'merchant') {
    loadSessions(); // 刷新会话列表
    message.info(`收到来自用户的新消息`); // 显示通知
  }
}, []);
```

#### 3. 会话状态管理
```typescript
// 会话列表显示逻辑
- 未读会话：橙色背景高亮显示
- 已读会话：普通白色背景
- 未读计数：红色Badge显示具体数量
- 时间显示：智能格式化（今天显示时间，昨天显示"昨天"等）
```

## 🎯 用户体验优化

### 1. 视觉设计
- **响应式布局**：支持不同屏幕尺寸
- **色彩搭配**：未读消息橙色提醒，已读消息淡雅显示
- **交互反馈**：悬停效果、点击反馈、加载状态
- **图标提示**：清晰的功能图标和状态指示

### 2. 性能优化
- **懒加载**：按需加载用户信息
- **缓存机制**：合理使用useCallback避免重复渲染
- **批量更新**：聊天列表统一刷新
- **连接管理**：智能WebSocket连接和断开

### 3. 错误处理
- **网络异常**：友好的错误提示
- **连接断开**：自动重连机制
- **数据加载**：Loading状态显示
- **空状态**：优雅的空数据提示

## 📱 使用流程

### 商家端操作流程：
1. **登录商家账号** → 进入商家中心
2. **查看消息提醒** → 头部/菜单显示未读数量
3. **点击客户消息** → 进入消息中心页面
4. **查看会话列表** → 浏览所有客户对话
5. **点击具体会话** → 打开聊天窗口
6. **实时对话交流** → 发送文字/图片/文件消息
7. **关闭聊天窗口** → 返回会话列表

### 自动化功能：
- ✅ 新消息自动提醒
- ✅ 未读数量自动更新
- ✅ 会话状态自动同步
- ✅ 连接状态自动监控

## 🔗 API接口使用

### 主要接口：
- `GET /api/chat/sessions/merchant/{id}` - 获取商家会话列表
- `GET /api/chat/unread/merchant/{id}` - 获取商家未读消息数量  
- `POST /api/chat/read` - 标记消息已读
- `WebSocket /api/ws` - 实时消息推送

## 🎉 总结

商家端聊天功能已完全集成到Casual Rent平台中，为商家提供了专业的客户沟通管理工具。功能完善，界面友好，性能优化，能够有效提升商家的客户服务效率和用户体验。

**下一步建议：**
- 可考虑添加消息搜索历史功能
- 支持消息批量操作（批量标记已读等）
- 增加客户标签分类管理
- 添加自动回复和常用语快捷功能 